import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { Play, CheckCircle2, XCircle, RotateCcw, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    loadPyodide?: any;
  }
}

interface PythonEditorProps {
  initialCode?: string;
  expectedOutput?: string;
  onSuccess?: () => void;
  onRun?: (output: string) => void;
}

export const PythonEditor: React.FC<PythonEditorProps> = ({ 
  initialCode = '', 
  expectedOutput, 
  onSuccess,
  onRun 
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPyodideLoaded, setIsPyodideLoaded] = useState(false);
  const pyodideRef = useRef<any>(null);

  useEffect(() => {
    const loadPyodide = async () => {
      if (window.loadPyodide) {
        pyodideRef.current = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
        });
        setIsPyodideLoaded(true);
      } else {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
        script.onload = async () => {
          pyodideRef.current = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
          });
          setIsPyodideLoaded(true);
        };
        document.head.appendChild(script);
      }
    };
    loadPyodide();
  }, []);

  const runCode = async () => {
    if (!pyodideRef.current) return;
    setIsRunning(true);
    setError(null);
    setOutput('');

    try {
      // Setup stdout capture
      await pyodideRef.current.runPythonAsync(`
import sys
import io
sys.stdout = io.StringIO()
      `);

      await pyodideRef.current.runPythonAsync(code);
      
      const stdout = await pyodideRef.current.runPythonAsync("sys.stdout.getvalue()");
      setOutput(stdout);
      if (onRun) onRun(stdout);

      if (expectedOutput && stdout.trim() === expectedOutput.trim()) {
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    setCode(initialCode);
    setOutput('');
    setError(null);
  };

  return (
    <div className="flex flex-col h-full border-2 border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      <div className="bg-gray-50 px-4 py-2 border-b-2 border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="ml-2 text-sm font-bold text-gray-500 uppercase tracking-wider">main.py</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={resetCode}
            className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
            title="Reset Code"
          >
            <RotateCcw size={18} />
          </button>
          <button 
            onClick={runCode}
            disabled={isRunning || !isPyodideLoaded}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-bold text-sm shadow-sm transition-all active:translate-y-0.5
              ${isRunning || !isPyodideLoaded 
                ? 'bg-gray-200 text-gray-400' 
                : 'bg-[#58CC02] text-white shadow-[#46A302] hover:brightness-110'}`}
          >
            {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
            {isPyodideLoaded ? 'RUN' : 'LOADING...'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto min-h-[200px]">
        <CodeMirror
          value={code}
          height="100%"
          theme="light"
          extensions={[python()]}
          onChange={(value) => setCode(value)}
          className="text-base"
        />
      </div>

      <div className="p-4 bg-[#1E1E1E] text-white font-mono text-sm h-40 overflow-auto">
        <div className="flex items-center gap-2 mb-2 text-gray-500 font-bold border-b border-gray-800 pb-1">
          <span>OUTPUT</span>
        </div>
        {error ? (
          <div className="text-red-400 whitespace-pre-wrap">{error}</div>
        ) : output ? (
          <div className="text-green-400 whitespace-pre-wrap">{output}</div>
        ) : (
          <div className="text-gray-600">Click RUN to see output...</div>
        )}
      </div>

      {expectedOutput && output.trim() === expectedOutput.trim() && (
        <div className="bg-[#D7FFB8] p-3 flex items-center gap-3 border-t-2 border-[#A5E571]">
          <CheckCircle2 className="text-[#58CC02]" size={20} />
          <span className="text-[#46A302] font-bold text-sm">Correct! Output matched.</span>
        </div>
      )}
    </div>
  );
};
