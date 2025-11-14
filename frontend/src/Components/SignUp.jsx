import React from "react";

const Signup = () => {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#0B0014]">

      <form className="bg-[#1A0B2E] p-8 rounded-2xl shadow-[0_0_20px_rgba(218,0,255,0.4)] w-full max-w-sm text-gray-200">
        
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Create Account
        </h1>

        <div className="flex flex-col gap-5">

          {/* Full Name */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-400">Full Name</label>
            <input
              type="text"
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
              className="p-3 bg-black/30 border border-[#8A2BE2] rounded-xl 
              focus:outline-none focus:ring-2 focus:ring-[#DA00FF] placeholder-gray-500 text-gray-200"
              placeholder="Re-enter your password"
            />
          </div>

          {/* Signup Button */}
          <button
            className="bg-[#8A2BE2] hover:bg-[#5A189A] text-white py-3 rounded-xl 
            transition-all shadow-[0_0_20px_rgba(138,43,226,0.6)] hover:shadow-[0_0_30px_rgba(218,0,255,0.6)]"
          >
            Sign Up
          </button>

          {/* Already Have Account */}
          <p className="text-center text-gray-400 text-sm">
            Already have an account?{" "}
            <a href="#" className="text-[#DA00FF] underline hover:text-pink-400">
              Login
            </a>
          </p>

        </div>
      </form>
    </div>
  );
};

export default Signup;
