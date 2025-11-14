import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { setAuthToken, setUser } from "../utils/auth";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(formData.email, formData.password);
      
      if (response.success) {
        // Store token and user data
        setAuthToken(response.data.token);
        setUser(response.data.user);
        
        // Navigate to dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#0B0014]">

      <form 
        onSubmit={handleLogin}
        className="bg-[#1A0B2E] p-8 rounded-2xl shadow-[0_0_20px_rgba(218,0,255,0.4)] 
        w-full max-w-sm text-gray-200"
      >
        
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Login
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-5">

          {/* Email */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-400">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="p-3 bg-black/30 border border-[#2563EB] rounded-xl 
              focus:outline-none focus:ring-2 focus:ring-[#38BDF8] 
              placeholder-gray-500 text-gray-200"
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
              className="p-3 bg-black/30 border border-[#2563EB] rounded-xl 
              focus:outline-none focus:ring-2 focus:ring-[#38BDF8] 
              placeholder-gray-500 text-gray-200"
              placeholder="Enter password"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#2563EB] hover:bg-[#1E40AF] disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-xl 
            transition-all shadow-[0_0_20px_rgba(37,99,235,0.6)] 
            hover:shadow-[0_0_30px_rgba(14,165,233,0.8)] font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-gray-400 text-sm">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-[#38BDF8] underline hover:text-blue-300"
            >
              Sign Up
            </Link>
          </p>

        </div>
      </form>
    </div>
  );
};

export default Login;
