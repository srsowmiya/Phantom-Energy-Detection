import React from "react";

const Login = () => {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#0B0014]">

      <form className="bg-[#1A0B2E] p-8 rounded-2xl shadow-[0_0_20px_rgba(218,0,255,0.4)] w-full max-w-sm text-gray-200">
        
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Login
        </h1>

        <div className="flex flex-col gap-5">

          {/* Username */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-400">Username or Email</label>
            <input
              type="text"
              className="p-3 bg-black/30 border border-[#8A2BE2] rounded-xl 
              focus:outline-none focus:ring-2 focus:ring-[#DA00FF] placeholder-gray-500 text-gray-200"
              placeholder="Enter username"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-400">Password</label>
            <input
              type="password"
              className="p-3 bg-black/30 border border-[#8A2BE2] rounded-xl 
              focus:outline-none focus:ring-2 focus:ring-[#DA00FF] placeholder-gray-500 text-gray-200"
              placeholder="Enter password"
            />
          </div>

          {/* Login Button */}
          <button
            className="bg-[#8A2BE2] hover:bg-[#5A189A] text-white py-3 rounded-xl 
            transition-all shadow-[0_0_20px_rgba(138,43,226,0.6)] hover:shadow-[0_0_30px_rgba(218,0,255,0.6)]"
          >
            Login
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-gray-400 text-sm">
            Don’t have an account?{" "}
            <a
              href="#"
              className="text-[#DA00FF] underline hover:text-pink-400"
            >
              Sign Up
            </a>
          </p>

        </div>
      </form>
    </div>
  );
};

export default Login;
