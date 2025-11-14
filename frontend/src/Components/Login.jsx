import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate(); // ✅ MUST be inside the component

  const handleLogin = async (e) => {
    e.preventDefault();

    // TODO: Add your backend login API here
    console.log("Login clicked");

    // If login success:
    navigate("/dashboard");
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

        <div className="flex flex-col gap-5">

          {/* Username */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-400">Username or Email</label>
            <input
              type="text"
              className="p-3 bg-black/30 border border-[#2563EB] rounded-xl 
              focus:outline-none focus:ring-2 focus:ring-[#38BDF8] 
              placeholder-gray-500 text-gray-200"
              placeholder="Enter username"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-400">Password</label>
            <input
              type="password"
              className="p-3 bg-black/30 border border-[#2563EB] rounded-xl 
              focus:outline-none focus:ring-2 focus:ring-[#38BDF8] 
              placeholder-gray-500 text-gray-200"
              placeholder="Enter password"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="bg-[#2563EB] hover:bg-[#1E40AF] text-white py-3 rounded-xl 
            transition-all shadow-[0_0_20px_rgba(37,99,235,0.6)] 
            hover:shadow-[0_0_30px_rgba(14,165,233,0.8)] font-semibold"
          >
            Login
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
