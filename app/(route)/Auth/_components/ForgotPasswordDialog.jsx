import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Loader2, 
  AlertCircle, 
  Check, 
  X,
  KeyRound,
  Shield 
} from 'lucide-react';

const variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.3,
      type: "spring",
      stiffness: 300
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: { duration: 0.2 }
  }
};

const inputVariants = {
  initial: { 
    borderColor: "transparent",
    backgroundColor: "rgba(255,255,255,0.1)"
  },
  focus: { 
    borderColor: "#6366f1",
    backgroundColor: "rgba(255,255,255,0.2)",
    transition: { duration: 0.3 }
  }
};

const AnimatedForgotPasswordDialog = ({
  isOpen, 
  onClose, 
  forgotEmail, 
  setForgotEmail, 
  handleSendOtp, 
  isSendingOTP, 
  otp, 
  enteredOTP, 
  setEnteredOTP, 
  forgotError, 
  forgotSuccess, 
  varified, 
  setVarified,
  newPasswordData, 
  handleNewPasswordChange, 
  handleUpdatePassword
}) => {
  const [stage, setStage] = useState(0);
  const [currentError, setCurrentError] = useState('');
  const [currentSuccess, setCurrentSuccess] = useState('');

  // Reset states when dialog opens or closes
  useEffect(() => {
    if (isOpen) {
      setStage(0);
      setCurrentError('');
      setCurrentSuccess('');
    }
  }, [isOpen]);

  // Handle error and success messages
  useEffect(() => {
    if (forgotError) {
      setCurrentError(forgotError);
      const timer = setTimeout(() => {
        setCurrentError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [forgotError]);

  useEffect(() => {
    if (forgotSuccess) {
      setCurrentSuccess(forgotSuccess);
      const timer = setTimeout(() => {
        setCurrentSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [forgotSuccess]);

  const handleOTPVerification = () => {
    if (enteredOTP.length === 5 && enteredOTP === otp.toString()) {
      setVarified(true);
      setStage(2);
    } else {
      setCurrentError('Invalid OTP. Please try again.');
      setVarified(false);
    }
  };

  const renderEmailStage = () => (
    <motion.div 
      key="email-stage"
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="text-center">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center"
        >
          <Shield className="mr-3 text-indigo-600" />
          Reset Password
        </motion.h2>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your email to reset your password
        </p>
      </div>

      <motion.div 
        variants={inputVariants}
        initial="initial"
        whileFocus="focus"
        className="relative"
      >
        <input
          type="email"
          value={forgotEmail}
          onChange={(e) => {
            setForgotEmail(e.target.value);
            setCurrentError('');
          }}
          placeholder="Enter your email"
          className="w-full px-4 py-3 rounded-xl border-2 border-transparent 
            bg-gray-100 dark:bg-gray-800 
            focus:outline-none focus:ring-2 focus:ring-indigo-500 
            dark:text-white transition-all duration-300"
        />
        <Mail className="absolute right-4 top-3.5 text-gray-400" />
      </motion.div>

      <AnimatePresence>
        {currentError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-900/30 text-red-500 
              dark:text-red-400 px-4 py-3 rounded-xl 
              flex items-center space-x-2"
          >
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{currentError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSendOtp}
        disabled={isSendingOTP || !forgotEmail}
        className={`w-full bg-indigo-600 text-white py-3 rounded-xl 
          flex items-center justify-center space-x-2
          ${!forgotEmail ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}
          transition-all duration-300`}
      >
        {isSendingOTP ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Sending OTP...</span>
          </>
        ) : (
          <span>Send OTP</span>
        )}
      </motion.button>
    </motion.div>
  );

  const renderOTPStage = () => (
    <motion.div 
      key="otp-stage"
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="text-center">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center"
        >
          <KeyRound className="mr-3 text-indigo-600" />
          Verify OTP
        </motion.h2>
        <p className="text-gray-600 dark:text-gray-400">
          Enter 5-digit OTP sent to {forgotEmail}
        </p>
      </div>

      <div className="flex justify-center space-x-2">
  {[...Array(5)].map((_, index) => (
    <motion.input
      key={index}
      type="text"
      maxLength="1"
      value={enteredOTP[index] || ''}
      onChange={(e) => {
        const newOTP = enteredOTP.split('');
        newOTP[index] = e.target.value;
        setEnteredOTP(newOTP.join(''));
        setCurrentError('');
      }}
      variants={inputVariants}
      initial="initial"
      whileFocus=""
      className="w-16 h-16 text-center text-2xl rounded-xl 
        border-3 border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-800 
        text-gray-800 dark:text-white
        focus:outline-none 
        focus:border-indigo-500 dark:focus:border-indigo-400 
        focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-700
        shadow-md hover:shadow-lg transition-all duration-300"
    />
  ))}
</div>

      <AnimatePresence>
        {currentError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-900/30 text-red-500 
              dark:text-red-400 px-4 py-3 rounded-xl 
              flex items-center space-x-2"
          >
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{currentError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOTPVerification}
        disabled={enteredOTP.length !== 5}
        className={`w-full bg-indigo-600 text-white py-3 rounded-xl 
          flex items-center justify-center space-x-2
          ${enteredOTP.length !== 5 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}
          transition-all duration-300`}
      >
        Verify OTP
      </motion.button>
    </motion.div>
  );

  const renderNewPasswordStage = () => (
    <motion.div 
      key="new-password-stage"
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="text-center">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center"
        >
          <KeyRound className="mr-3 text-indigo-600" />
          New Password
        </motion.h2>
        <p className="text-gray-600 dark:text-gray-400">
          Create a strong new password
        </p>
      </div>

      <motion.div 
        variants={inputVariants}
        initial="initial"
        whileFocus="focus"
        className="relative"
      >
        <input
          type="password"
          id="newPass"
          value={newPasswordData.newPass}
          onChange={(e) => {
            handleNewPasswordChange(e);
            setCurrentError('');
          }}
          placeholder="New Password"
          className="w-full px-4 py-3 rounded-xl border-2 border-transparent 
            bg-gray-100 dark:bg-gray-800 
            focus:outline-none focus:ring-2 focus:ring-indigo-500 
            dark:text-white transition-all duration-300"
        />
      </motion.div>

      <motion.div 
        variants={inputVariants}
        initial="initial"
        whileFocus="focus"
        className="relative"
      >
        <input
          type="password"
          id="confirm"
          value={newPasswordData.confirm}
          onChange={(e) => {
            handleNewPasswordChange(e);
            setCurrentError('');
          }}
          placeholder="Confirm New Password"
          className="w-full px-4 py-3 rounded-xl border-2 border-transparent 
            bg-gray-100 dark:bg-gray-800 
            focus:outline-none focus:ring-2 focus:ring-indigo-500 
            dark:text-white transition-all duration-300"
        />
      </motion.div>

      <AnimatePresence>
        {currentError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-900/30 text-red-500 
              dark:text-red-400 px-4 py-3 rounded-xl 
              flex items-center space-x-2"
          >
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{currentError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleUpdatePassword}
        disabled={isSendingOTP}
        className={`w-full bg-indigo-600 text-white py-3 rounded-xl 
          flex items-center justify-center space-x-2
          ${isSendingOTP ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}
          transition-all duration-300`}
      >
        {isSendingOTP ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Resetting...</span>
          </>
        ) : (
          <span>Reset Password</span>
        )}
      </motion.button>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center 
            bg-black/30 dark:bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-900 
              rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-600 
                dark:text-gray-300 hover:text-gray-900 
                dark:hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <AnimatePresence mode="wait">
              {otp === null && renderEmailStage()}
              {otp !== null && !varified && renderOTPStage()}
              {varified && renderNewPasswordStage()}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedForgotPasswordDialog;