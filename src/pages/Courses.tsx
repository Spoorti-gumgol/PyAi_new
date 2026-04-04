import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clock, Layers, ChevronRight, PlayCircle } from 'lucide-react';
// import { COURSES } from '../data/courseData';
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

type Course = {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
};



export const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*");

        console.log("COURSES FROM DB:", data);
        

      if (error) {
        console.log(error);
        return;
      }

      setCourses(data || []);
    };

    fetchCourses();
  }, [])

//   useEffect(() => {
//   const testFetch = async () => {
//     const { data, error } = await supabase
//       .from("courses")
//       .select("*");

//     console.log("DATA:", data);
//     console.log("ERROR:", error);
//   };

//   testFetch();
// }, []);


  return (
    <div className="min-h-screen bg-[#F7F7F7] py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-[#4B4B4B]">Explore Courses</h1>
          <p className="text-xl text-gray-500 font-medium">From binary basics to neural networks. Choose your next quest.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {courses.map((course, i) => ( 
            <motion.div 
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[40px] border-2 border-[#E5E5E5] overflow-hidden flex flex-col shadow-sm hover:border-[#1CB0F6] transition-colors group"
            >
              <div className="h-56 bg-[#DDF4FF] relative overflow-hidden flex items-center justify-center">
                <div className="p-8 group-hover:scale-110 transition-transform duration-500">
                  <PlayCircle size={100} className="text-[#1CB0F6] opacity-20" />
                </div>
                <div className="absolute top-6 left-6 flex gap-2">
                  <span className={`px-4 py-1.5 rounded-full font-black text-xs uppercase shadow-sm border-2
                    ${course.level === 'beginner' ? 'bg-blue-50 text-[#1CB0F6] border-blue-100' : 'bg-green-50 text-[#58CC02] border-green-100'}`}>
                    {course.level}
                  </span>
                </div>
              </div>
              
              <div className="p-10 flex-1 flex flex-col space-y-6">
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-[#4B4B4B] leading-tight group-hover:text-[#1CB0F6] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-500 font-medium leading-relaxed line-clamp-2">
                    {course.description}
                  </p>
                </div>

                <div className="flex gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-gray-400" />
                    <span className="font-bold text-gray-400 text-sm uppercase tracking-wider">{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers size={18} className="text-gray-400" />
                    <span className="font-bold text-gray-400 text-sm uppercase tracking-wider"> Units</span>
                  </div>
                </div>

                <div className="pt-4 mt-auto">
                  <Link 
                    to={`/course/${course.id}`}
                    className="w-full bg-[#1CB0F6] text-white py-5 rounded-2xl font-black text-xl shadow-[0_6px_0_0_#1899D6] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    VIEW COURSE <ChevronRight />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
