"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, LogIn } from "lucide-react";
import Login from "./_components/login";
import Register from "./_components/register";

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -inset-[100%] opacity-50">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full mix-blend-multiply filter blur-xl animate-blob-slow dark:mix-blend-screen"
          style={{
            backgroundColor: `hsla(${Math.random() * 360}, 70%, 70%, 0.1)`,
            width: `${Math.random() * 400 + 100}px`,
            height: `${Math.random() * 400 + 100}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${Math.random() * 20 + 10}s`,
          }}
        />
      ))}
    </div>
  </div>
);

const TabButton = ({ isActive, onClick, children, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`relative flex-1 flex items-center justify-center space-x-2 py-4 px-6 text-lg font-medium transition-all duration-300
      ${isActive 
        ? 'text-indigo-600 dark:text-indigo-400' 
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
  >
    <Icon className={`h-5 w-5 transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} />
    <span>{children}</span>
    {isActive && (
      <motion.div
        layoutId="active-tab"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
        initial={false}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    )}
  </button>
);

const Auth = () => {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <TabButton 
              isActive={activeTab === "login"}
              onClick={() => setActiveTab("login")}
              icon={LogIn}
            >
              Sign In
            </TabButton>
            <TabButton 
              isActive={activeTab === "register"}
              onClick={() => setActiveTab("register")}
              icon={UserPlus}
            >
              Sign Up
            </TabButton>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "login" ? <Login /> : <Register />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Auth;