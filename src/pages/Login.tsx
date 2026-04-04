import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { motion } from "motion/react";
import { LogIn } from "lucide-react";
import { Button } from "../components/SharedUI";
import logo from "../assets/8443babb0dd67ee3ebd39b55554989e03b362ce3.png";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    navigate("/dashboard");

  } catch (err: any) {
    setError(err?.message || "Login failed.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1CB0F6] via-[#58CC02] to-[#FFC800]">

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-[420px] bg-white rounded-3xl shadow-2xl p-10"
      >

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src={logo} className="w-14 mb-3" />
          <h1 className="text-3xl font-black text-[#4B4B4B]">Welcome Back</h1>
          <p className="text-gray-500 text-sm font-semibold">
            Log in to continue learning
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-600 rounded-xl p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold focus:border-[#1CB0F6] outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold focus:border-[#1CB0F6] outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full py-3 text-lg flex items-center justify-center gap-2"
          >
            <LogIn size={18} />
            {loading ? "Logging in..." : "Log In"}
          </Button>

        </form>

        {/* Link */}
        <p className="text-center mt-6 text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#1CB0F6] font-bold hover:underline">
            Sign Up
          </Link>
        </p>

      </motion.div>

    </div>
  );
};