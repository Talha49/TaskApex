"use client";
import React, { useState, useEffect } from 'react';
import { signIn, useSession } from "next-auth/react";
import { 
  Mail, Eye, EyeOff, Loader2, 
  AlertCircle, ArrowRight, 
  LogIn, Building2 
} from 'lucide-react';
import { FcGoogle } from "react-icons/fc";
import { useRouter } from 'next/navigation';
import { IoClose } from 'react-icons/io5';
import axios from 'axios';
import ForgotPasswordDialog from './ForgotPasswordDialog';

export default function Login() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
  });
  const [focused, setFocused] = useState({
    companyName: false,
    email: false,
    password: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [otp, setOtp] = useState(null);
  const [enteredOTP, setEnteredOTP] = useState("");
  const [varified, setVarified] = useState(false);
  const [newPasswordData, setNewPasswordData] = useState({
    newPass: "",
    confirm: "",
  });
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && !session?.user?.isVerified) {
      setForgotEmail(session.user.email);
      setOtp(session.user.otp);
      setIsVerificationOpen(true);
    } else if (status === "authenticated" && session?.user?.isVerified) {
      router.push("/Tasks");
    }
  }, [status, session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", {
        redirect: false,
        companyName: formData.companyName,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        setError(res.error);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl: "/Tasks" });
  };

  const handleSendOtp = async () => {
    setForgotError("");
    setForgotSuccess("");
    setIsSendingOTP(true);
    try {
      if (!forgotEmail || !formData.companyName) {
        setForgotError("Email and Company Name are required.");
        setIsSendingOTP(false);
        return;
      }
      const res = await axios.post("/api/auth/Forgot_password", {
        email: forgotEmail,
        companyName: formData.companyName,
      });
      if (res.data.message) {
        setForgotSuccess(res.data.message);
        setOtp(res.data.otp);
      } else {
        setForgotError(res.data.error);
      }
    } catch (error) {
      setForgotError("Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleUpdatePassword = async () => {
    setForgotError("");
    if (!newPasswordData.newPass || !newPasswordData.confirm) {
      setForgotError("Both fields are required.");
      return;
    } else if (newPasswordData.newPass !== newPasswordData.confirm) {
      setForgotError("Passwords do not match.");
      return;
    }
    setIsSendingOTP(true);
    try {
      const res = await axios.put("/api/auth/Reset_password", {
        email: forgotEmail,
        newPassword: newPasswordData.newPass,
        companyName: formData.companyName,
      });
      setForgotSuccess(res.data.message);
      setNewPasswordData({ newPass: "", confirm: "" });
      setIsOpen(false);
    } catch (error) {
      setForgotError("Failed to update password. Please try again.");
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerificationComplete = async () => {
    try {
      await axios.put("/api/auth/verify", { email: forgotEmail, companyName: formData.companyName });
      setIsVerificationOpen(false);
      router.push("/Tasks");
    } catch (error) {
      setForgotError("Verification failed. Please try again.");
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

  const handleNewPasswordChange = (e) => {
    setNewPasswordData({ ...newPasswordData, [e.target.id]: e.target.value });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      <AnimatedBackground />
      <div className="w-full max-w-6xl flex rounded-2xl shadow-2xl overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm relative">
        <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 dark:bg-indigo-500 p-12 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-800 dark:from-indigo-500 dark:to-indigo-700" />
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#fff', stopOpacity: 0.2 }} />
                  <stop offset="100%" style={{ stopColor: '#fff', stopOpacity: 0.5 }} />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="40" className="animate-pulse-slow" fill="url(#grad)" />
              <path className="animate-morph" fill="rgba(255,255,255,0.2)" d="M50,0 A50,50,0,1,1,50,100 A50,50,0,1,1,50,0 Z" />
            </svg>
          </div>
          <div className="relative text-white text-center animate-float">
            <h1 className="text-4xl font-bold mb-6">Welcome Back!</h1>
            <p className="text-lg opacity-90">Sign in to your account</p>
            <LogIn className="h-24 w-24 mx-auto mt-8 opacity-90" />
          </div>
        </div>
        <div className="w-full lg:w-1/2 p-8 md:p-12">
          <div className="max-w-md mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 animate-fade-in">Sign In</h2>
              <p className="text-gray-600 dark:text-gray-400 animate-fade-in-delay">Welcome back! Please enter your details</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  onFocus={() => setFocused(prev => ({ ...prev, companyName: true }))}
                  onBlur={() => setFocused(prev => ({ ...prev, companyName: false }))}
                  required
                  className="peer w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm dark:text-white"
                  placeholder=" "
                />
                <label className={`absolute left-4 transition-all duration-300 pointer-events-none ${(focused.companyName || formData.companyName) ? 'text-xs -top-2 bg-white dark:bg-gray-900 px-1 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 top-3'}`}>
                  Company Name
                </label>
                <Building2 className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" />
              </div>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocused(prev => ({ ...prev, email: true }))}
                  onBlur={() => setFocused(prev => ({ ...prev, email: false }))}
                  required
                  className="peer w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm dark:text-white"
                  placeholder=" "
                />
                <label className={`absolute left-4 transition-all duration-300 pointer-events-none ${(focused.email || formData.email) ? 'text-xs -top-2 bg-white dark:bg-gray-900 px-1 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 top-3'}`}>
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
                  onFocus={() => setFocused(prev => ({ ...prev, password: true }))}
                  onBlur={() => setFocused(prev => ({ ...prev, password: false }))}
                  required
                  className="peer w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm dark:text-white"
                  placeholder=" "
                />
                <label className={`absolute left-4 transition-all duration-300 pointer-events-none ${(focused.password || formData.password) ? 'text-xs -top-2 bg-white dark:bg-gray-900 px-1 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 top-3'}`}>
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
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-colors"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-300 transition-colors">
                    Remember me
                  </span>
                </label>
                <p className="text-right my-1 text-sm">
                  <span
                    className="text-blue-500 hover:underline cursor-pointer"
                    onClick={() => {
                      setForgotEmail(formData.email);
                      setIsOpen(true);
                    }}
                  >
                    Forgot Password
                  </span>
                </p>
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
                className={`w-full bg-indigo-600 dark:bg-indigo-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-800'} transform transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
              <div className="flex flex-col items-center justify-center gap-y-4 w-full">
                <p className="text-lg font-medium">Continue With</p>
                <button onClick={handleGoogleSignIn} className="bg-white py-2 px-4 rounded-lg shadow-md hover:shadow-lg flex items-center justify-center gap-x-2 border border-gray-200">
                  <FcGoogle size={24} />
                  <span className="text-lg font-medium">Google</span>
                </button>
              </div>
              <p className="text-center text-gray-600 dark:text-gray-400">
                Don’t have an account?{' '}
                <button
                  type="button"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  onClick={() => window.location.href = '/register'}
                >
                  Sign up
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
      <ForgotPasswordDialog 
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setForgotEmail("");
          setForgotError("");
          setForgotSuccess("");
          setOtp(null);
          setEnteredOTP("");
          setVarified(false);
          setNewPasswordData({ newPass: "", confirm: "" });
        }}
        companyName={formData.companyName}
        forgotEmail={forgotEmail}
        setForgotEmail={setForgotEmail}
        handleSendOtp={handleSendOtp}
        isSendingOTP={isSendingOTP}
        otp={otp}
        enteredOTP={enteredOTP}
        setEnteredOTP={setEnteredOTP}
        forgotError={forgotError}
        forgotSuccess={forgotSuccess}
        varified={varified}
        setVarified={setVarified}
        newPasswordData={newPasswordData}
        handleNewPasswordChange={handleNewPasswordChange}
        handleUpdatePassword={handleUpdatePassword}
      />
      <ForgotPasswordDialog 
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        companyName={formData.companyName}
        forgotEmail={forgotEmail}
        setForgotEmail={setForgotEmail}
        handleSendOtp={handleSendOtp}
        isSendingOTP={isSendingOTP}
        otp={otp}
        enteredOTP={enteredOTP}
        setEnteredOTP={setEnteredOTP}
        forgotError={forgotError}
        forgotSuccess={forgotSuccess}
        varified={varified}
        setVarified={setVarified}
        newPasswordData={newPasswordData}
        handleNewPasswordChange={handleNewPasswordChange}
        handleUpdatePassword={handleUpdatePassword}
        isVerificationMode={true}
        onVerificationComplete={handleVerificationComplete}
      />
    </div>
  );
}