import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    age: "",
    grade: "",
    goal: "",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
  });

  const [isSaved, setIsSaved] = useState(false);

  // 🔥 Fetch user data from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data && !error) {
        setProfile((prev) => ({
          ...prev,
          ...data,
        }));
      }
    };

    fetchProfile();
  }, [user]);

  // 🔥 Save profile
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: profile.name,
          age: profile.age,
          grade: profile.grade,
          goal: profile.goal,
          avatar: profile.avatar,
        })
        .eq("id", user.id);

      if (error) throw error;

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 Logout (Supabase)
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] py-10 px-6">
      <div className="max-w-2xl mx-auto pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[30px] border-2 border-[#E5E5E5] p-6 md:p-8 shadow-sm"
        >
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8 gap-2">
            <img
              src={profile.avatar}
              className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 shadow"
            />
            <h1 className="text-2xl font-black text-[#4B4B4B]">
              {profile.name || "Student"}
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="font-bold text-sm text-gray-500">Name</label>
              <input
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full p-3 border-2 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-sm text-gray-500">Age</label>
              <input
                name="age"
                value={profile.age}
                onChange={handleChange}
                placeholder="Age"
                className="w-full p-3 border-2 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-sm text-gray-500">Grade</label>
              <input
                name="grade"
                value={profile.grade}
                onChange={handleChange}
                placeholder="Grade"
                className="w-full p-3 border-2 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-sm text-gray-500">
                Learning Goal
              </label>
              <input
                name="goal"
                value={profile.goal}
                onChange={handleChange}
                placeholder="Learning Goal"
                className="w-full p-3 border-2 rounded-xl"
              />
            </div>

            {/* Buttons */}
            <div className="mt-8 space-y-4">
              {/* Save */}
              <button
                type="submit"
                className={`w-full py-4 rounded-2xl font-black text-lg shadow-[0_5px_0_0_#1899D6] active:translate-y-1 active:shadow-none transition-all ${
                  isSaved ? "bg-green-500 shadow-green-700" : "bg-[#1CB0F6]"
                } text-white`}
              >
                {isSaved ? "Saved ✅" : "Save Profile"}
              </button>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-4 rounded-2xl font-black text-lg bg-[#FF4B4B] text-white shadow-[0_5px_0_0_#c0392b] active:translate-y-1 active:shadow-none transition-all border-2 border-red-300"
              >
                Log Out
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};