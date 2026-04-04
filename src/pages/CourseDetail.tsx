import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Layers, ChevronLeft, Trophy } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { supabase } from "../supabase";
import { Topic } from "../types/course";
import { fetchTopicsWithLessons } from "../utils/FetchCourseData"; // ✅ FIXED CASE
import AdventurePath from "../components/AdventurePath"; // ✅ correct default import

type Course = {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
};

export const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { userProgress } = useProgress();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]); // ✅ typed properly

  // ───────── Fetch Course ─────────
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) {
        setError("No course ID provided.");
        setLoading(false);
        return;
      }

      const { data, error: sbError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .limit(1);

      if (sbError) {
        setError("Failed to load course.");
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setError("Course not found.");
        setLoading(false);
        return;
      }

      setCourse(data[0] as Course);
      setLoading(false);
    };

    fetchCourse();
  }, [courseId]);

  // ───────── Fetch Topics + Lessons ─────────
  useEffect(() => {
    if (!courseId) return;

    const load = async () => {
      try {
        const result = await fetchTopicsWithLessons(courseId);
        setTopics(result);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [courseId]);

  const progressPercent = 0;

  // ───────── Loading / Error ─────────
  if (loading) {
    return (
      <div className="p-20 text-center font-bold text-2xl text-gray-400">
        Loading course...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-20 text-center font-bold text-2xl text-red-400">
        {error}
      </div>
    );
  }

  if (!course) return null;

  // ───────── UI ─────────
  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-20">

      {/* Header */}
      <div className="bg-white border-b-2 border-gray-100 py-16 px-6">
        <div className="max-w-6xl mx-auto">

          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-gray-400 font-bold mb-8 hover:text-gray-600"
          >
            <ChevronLeft size={20} /> BACK TO COURSES
          </Link>

          <div className="grid lg:grid-cols-3 gap-12 items-start">

            <div className="lg:col-span-2 space-y-8">

              <div className="flex gap-2">
                <span className={`px-4 py-1.5 rounded-full font-black text-xs uppercase border-2
                  ${course.level === 'beginner'
                    ? 'bg-blue-50 text-[#1CB0F6] border-blue-100'
                    : 'bg-green-50 text-[#58CC02] border-green-100'}`}>
                  {course.level}
                </span>

                <span className="px-4 py-1.5 rounded-full bg-gray-50 text-gray-400 text-xs border-2 flex items-center gap-2">
                  <Clock size={14} /> {course.duration}
                </span>

                <span className="px-4 py-1.5 rounded-full bg-gray-50 text-gray-400 text-xs border-2 flex items-center gap-2">
                  <Layers size={14} /> Units
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-[#4B4B4B]">
                {course.title}
              </h1>

              <p className="text-xl text-gray-500 max-w-2xl">
                {course.description}
              </p>

            </div>

            {/* Progress */}
            <div className="bg-white p-8 rounded-[32px] border shadow-sm">
              <div className="space-y-6">

                <div className="flex justify-between text-gray-400 text-xs font-bold">
                  <span>Course Progress</span>
                  <span>{progressPercent}%</span>
                </div>

                <div className="h-4 bg-gray-100 rounded-full">
                  <div
                    className="h-full bg-[#58CC02]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex justify-center text-[#FFC800] font-bold">
                  <Trophy size={16} /> {userProgress.totalXP} XP
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 🌀 DUOLINGO PATH HERE */}

      <div className="mt-10 text-center">
        <Link to={`/course/${courseId}/units`}>
          <button className="w-full py-5 bg-[#58CC02] text-white font-black text-xl rounded-3xl shadow-[0_6px_0_0_#46A302] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 max-w-sm mx-auto">
            View Units 🚀
          </button>
        </Link>
      </div>

    </div>
  );
};