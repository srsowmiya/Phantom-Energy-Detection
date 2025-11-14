import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div 
      className="w-full min-h-screen bg-cover bg-center bg-no-repeat flex items-center px-10 text-white"
      style={{ backgroundImage: "url('/homeBBg.jpg')" }}
    >

      <div className="ml-auto flex flex-col items-start text-left max-w-md">

        <h1 className="text-4xl font-bold mb-6 leading-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]">
          Welcome to <span className="text-[#38BDF8]">Phantom</span>-Conservation
        </h1>

        
        <p className="text-gray-200 mb-6 text-sm max-w-sm leading-relaxed drop-shadow-[0_0_8px_rgba(0,0,0,0.4)]">
          A smart energy monitoring system that helps you track, analyze and reduce phantom power usage efficiently.
        </p>

       
        <div className="flex flex-col gap-3 w-full max-w-[220px]">

        
          <Link
            to="/login"
            className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] w-full text-center py-3 rounded-lg font-semibold
            shadow-[0_0_18px_rgba(37,99,235,0.5)]
            hover:shadow-[0_0_28px_rgba(37,99,235,0.8)]
            hover:brightness-110 transition-all"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] w-full text-center py-3 rounded-lg font-semibold
            shadow-[0_0_18px_rgba(14,165,233,0.5)]
            hover:shadow-[0_0_28px_rgba(14,165,233,0.8)]
            hover:brightness-110 transition-all"
          >
            Sign Up
          </Link>

        </div>

      </div>
    </div>
  );
};

export default Home;
