import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { Button } from "../components/SharedUI";
import { motion } from "framer-motion";
import logo from "../assets/8443babb0dd67ee3ebd39b55554989e03b362ce3.png";
import { UserPlus } from "lucide-react";

export const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [grade, setGrade] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 🔐 Step 1: Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      const authUser = data.user;

      if (!authUser) {
        throw new Error(
          "Signup succeeded but user not returned. Disable email confirmation in Supabase."
        );
      }

      // 🧠 Step 2: Insert into your users table
      const { error: dbError } = await supabase.from("users").insert([
        {
          id: authUser.id,
          name,
          email,
          grade,
          created_at: new Date().toISOString(),
        },
      ]);

      if (dbError) throw dbError;

      // 🚀 Step 3: Redirect
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Failed to create account.");
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
          <h1 className="text-3xl font-black text-[#4B4B4B]">
            Join PyAi
          </h1>
          <p className="text-gray-500 text-sm font-semibold">
            Start your coding journey
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-600 rounded-xl p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold focus:border-[#1CB0F6] outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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
            minLength={6}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold focus:border-[#1CB0F6] outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold focus:border-[#1CB0F6] outline-none bg-white"
          >
            <option value="">Select Grade</option>
            <option value="5">Grade 5</option>
            <option value="6">Grade 6</option>
            <option value="7">Grade 7</option>
            <option value="8">Grade 8</option>
            <option value="9">Grade 9</option>
            <option value="10">Grade 10</option>
            <option value="11">Grade 11</option>
            <option value="12">Grade 12</option>
          </select>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full py-3 text-lg flex items-center justify-center gap-2"
          >
            <UserPlus size={18} />
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        {/* Login link */}
        <p className="text-center mt-6 text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#1CB0F6] font-bold hover:underline"
          >
            Log In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};