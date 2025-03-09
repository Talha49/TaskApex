"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Mail, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, User, Phone, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaTeamspeak } from "react-icons/fa";

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    contact: "",
    team: "",
  });
  const [focused, setFocused] = useState({
    fullName: false,
    email: false,
    password: false,
    contact: false,
    team: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        contact: formData.contact,
        team: formData.team,
      });

      if (res.error) {
        setError(res.error);
      } else {
        console.log("Registered successfully", res);
        router.push("/Tasks");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      <AnimatedBackground />
      <div className="w-full max-w-6xl flex rounded-2xl shadow-2xl overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm relative z-10">
        <div className="w-full lg:w-1/2 p-8 md:p-12">
          <div className="max-w-md mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 animate-fade-in">Create Account</h2>
              <p className="text-gray-600 dark:text-gray-400 animate-fade-in-delay">Join us today</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onFocus={() => setFocused((prev) => ({ ...prev, fullName: true }))}
                  onBlur={() => setFocused((prev) => ({ ...prev, fullName: false }))}
                  required
                  className="peer w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm dark:text-white"
                  placeholder=" "
                />
                <label
                  className={`absolute left-4 transition-all duration-300 pointer-events-none ${(focused.fullName || formData.fullName) ? "text-xs -top-2 bg-white dark:bg-gray-900 px-1 text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400 top-3"}`}
                >
                  Full Name
                </label>
                <User className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" />
              </div>

              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocused((prev) => ({ ...prev, email: true }))}
                  onBlur={() => setFocused((prev) => ({ ...prev, email: false }))}
                  required
                  className="peer w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm dark:text-white"
                  placeholder=" "
                />
                <label
                  className={`absolute left-4 transition-all duration-300 pointer-events-none ${(focused.email || formData.email) ? "text-xs -top-2 bg-white dark:bg-gray-900 px-1 text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400 top-3"}`}
                >
                  Email Address
                </label>
                <Mail className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocused((prev) => ({ ...prev, password: true }))}
                  onBlur={() => setFocused((prev) => ({ ...prev, password: false }))}
                  required
                  className="peer w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm dark:text-white"
                  placeholder=" "
                />
                <label
                  className={`absolute left-4 transition-all duration-300 pointer-events-none ${(focused.password || formData.password) ? "text-xs -top-2 bg-white dark:bg-gray-900 px-1 text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400 top-3"}`}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative">
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  onFocus={() => setFocused((prev) => ({ ...prev, contact: true }))}
                  onBlur={() => setFocused((prev) => ({ ...prev, contact: false }))}
                  className="peer w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm dark:text-white"
                  placeholder=" "
                />
                <label
                  className={`absolute left-4 transition-all duration-300 pointer-events-none ${(focused.contact || formData.contact) ? "text-xs -top-2 bg-white dark:bg-gray-900 px-1 text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400 top-3"}`}
                >
                  Contact Number
                </label>
                <Phone className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" />
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                  onFocus={() => setFocused((prev) => ({ ...prev, team: true }))}
                  onBlur={() => setFocused((prev) => ({ ...prev, team: false }))}
                  className="peer w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm dark:text-white"
                  placeholder=" "
                />
                <label
                  className={`absolute left-4 transition-all duration-300 pointer-events-none ${(focused.team || formData.team) ? "text-xs -top-2 bg-white dark:bg-gray-900 px-1 text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400 top-3"}`}
                >
                  Team Name
                </label>
                <FaTeamspeak className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" />
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  required
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-colors"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  I agree to the{" "}
                  <button type="button" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button type="button" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    Privacy Policy
                  </button>
                </span>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 px-4 py-3 rounded-lg animate-shake flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-indigo-600 dark:bg-indigo-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-800"} transform transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <div className="flex flex-col items-center justify-center gap-y-4 w-full">
                <p className="text-lg font-medium">Continue With</p>
                <button
                  onClick={() => signIn("google")}
                  className="bg-white py-2 px-4 rounded-lg shadow-md hover:shadow-lg flex items-center justify-center gap-x-2 border border-gray-200"
                >
                  <FcGoogle size={24} />
                  <span className="text-lg font-medium">Google</span>
                </button>
              </div>

              <p className="text-center text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <button type="button" onClick={() => signIn()} className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                  Sign In
                </button>
              </p>
            </form>
          </div>
        </div>

        <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 dark:bg-indigo-500 p-12 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-800 dark:from-indigo-500 dark:to-indigo-700" />
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: "#fff", stopOpacity: 0.2 }} />
                  <stop offset="100%" style={{ stopColor: "#fff", stopOpacity: 0.5 }} />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="40" className="animate-pulse-slow" fill="url(#grad)" />
              <path className="animate-morph" fill="rgba(255,255,255,0.2)" d="M50,0 A50,50,0,1,1,50,100 A50,50,0,1,1,50,0 Z" />
            </svg>
          </div>
          <div className="relative text-white text-center animate-float">
            <h1 className="text-4xl font-bold mb-6">Join Our Community</h1>
            <p className="text-lg opacity-90">Create an account to get started</p>
            <UserPlus className="h-24 w-24 mx-auto mt-8 opacity-90" />
          </div>
        </div>
      </div>
    </div>
  );
}