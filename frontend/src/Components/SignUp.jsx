import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { setAuthToken, setUser } from "../utils/auth";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error on input change
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register(
        formData.name,
        formData.email,
        formData.password
      );
      
      if (response.success && response.data) {
        // Store token and user data
        setAuthToken(response.data.token);
        setUser(response.data.user);
        
        // Navigate to dashboard
        navigate("/dashboard");
      } else {
        setError(response.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#0B0014]">

      <form 
        onSubmit={handleSignup}
        className="bg-[#1A0B2E] p-8 rounded-2xl shadow-[0_0_20px_rgba(218,0,255,0.4)] w-full max-w-sm text-gray-200">
        
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Create Account
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-5">

          {/* Full Name */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-400">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="p-3 bg-black/30 border border-[#8A2BE2] rounded-xl 
              focus:outline-none focus:ring-2 focus:ring-[#DA00FF] placeholder-gray-500 text-gray-200"
              placeholder="Enter your name"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-400">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="p-3 bg-black/30 border border-[#8A2BE2] rounded-xl 
              focus:outline-none focus:ring-2 focus:ring-[#DA00FF] placeholder-gray-500 text-gray-200"
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-400">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="p-3 bg-black/30 border border-[#8A2BE2] rounded-xl 
              focus:outline-none focus:ring-2 focus:ring-[#DA00FF] placeholder-gray-500 text-gray-200"
              placeholder="Create a password"
            />
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-400">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="p-3 bg-black/30 border border-[#8A2BE2] rounded-xl 
              focus:outline-none focus:ring-2 focus:ring-[#DA00FF] placeholder-gray-500 text-gray-200"
              placeholder="Re-enter your password"
            />
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#8A2BE2] hover:bg-[#5A189A] disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-xl 
            transition-all shadow-[0_0_20px_rgba(138,43,226,0.6)] hover:shadow-[0_0_30px_rgba(218,0,255,0.6)]"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          {/* Login Link FIXED */}
          <p className="text-center text-gray-400 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#DA00FF] underline hover:text-pink-400"
            >
              Login
            </Link>
          </p>

        </div>
      </form>
    </div>
  );
};

export default Signup;
