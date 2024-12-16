"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHome, 
  FaTasks, 
  FaCheckCircle, 
  FaChartBar, 
  FaSignInAlt, 
  FaUserCircle,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { ModeToggle } from '@/components/ui/Toggle';

const menuItems = [
  { href: "/", icon: FaHome, text: "Home", badge: null },
  { href: "/Tasks", icon: FaTasks, text: "Tasks", badge: "New" },
  { href: "/CompletedTasks", icon: FaCheckCircle, text: "Complete Tasks", badge: null },
  { href: "/Dashboard", icon: FaChartBar, text: "Dashboard", badge: null },
];

export default function Sidebar() {
  const { data: session, status } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSignOut = async () => {
    setShowProfileMenu(false);
    await signOut({ callbackUrl: '/' });
  };

  const sidebarVariants = {
    expanded: { width: "16rem" },
    collapsed: { width: "5rem" }
  };

  const ProfileMenu = () => (
    <AnimatePresence>
      {showProfileMenu && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute bottom-20 left-full ml-2 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg shadow-lg p-4 z-50"
        >
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3 pb-4 border-b dark:border-neutral-700">
              <Image
                src={session?.user?.image || "/metaverse.png"}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="flex flex-col">
                <span className="font-medium text-sm dark:text-white">
                  {session?.user?.fullName || "User"}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {session?.user?.email || ""}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center space-x-2 text-sm text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <FaUserCircle className="w-4 h-4" />
              <span>View Profile</span>
            </button>
            
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              <FaSignInAlt className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const NavLink = ({ href, icon: Icon, text, badge }) => {
    const isActive = router.pathname === href;
    
    return (
      <Link
        href={href}
        className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-200
          ${isActive 
            ? 'bg-neutral-200 dark:bg-neutral-800 text-primary' 
            : 'hover:bg-neutral-200 dark:hover:bg-neutral-800'
          }`}
      >
        <div className="flex items-center justify-center w-8 h-8">
          <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
        </div>
        {!isCollapsed && (
          <span className="text-sm font-medium">{text}</span>
        )}
        {!isCollapsed && badge && (
          <span className="px-2 py-1 text-xs font-medium text-white bg-primary rounded-full ml-auto">
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <motion.aside
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3 }}
      className={`relative min-h-screen bg-white dark:bg-neutral-900 border-r border-neutral-200 
        dark:border-neutral-800 flex flex-col py-6 transition-all duration-300 ease-in-out`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white dark:bg-neutral-900 border border-neutral-200 
          dark:border-neutral-800 rounded-full p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 
          transition-colors"
      >
        {isCollapsed ? (
          <FaChevronRight className="w-4 h-4 text-neutral-500" />
        ) : (
          <FaChevronLeft className="w-4 h-4 text-neutral-500" />
        )}
      </button>

      {/* Logo Section */}
      <div className="px-4 mb-8">
        <div className="flex items-center space-x-3">
          <Image 
            src="/metaverse.png" 
            alt="Logo" 
            width={40} 
            height={40} 
            className="rounded-lg"
          />
          {!isCollapsed && (
            <span className="font-bold text-lg">Talhism</span>
          )}
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            text={item.text}
            badge={item.badge}
          />
        ))}
      </nav>

      {/* Footer Section */}
      <div className="px-4 space-y-4">
        {/* Authentication Button */}
        {status === "authenticated" ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-2 w-full rounded-lg hover:bg-neutral-200 
                dark:hover:bg-neutral-800 transition-colors"
            >
              <Image
                src={session.user.image || "/metaverse.png"}
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full"
              />
              {!isCollapsed && (
                <span className="text-sm font-medium truncate">
                  {session.user.fullName}
                </span>
              )}
            </button>
            <ProfileMenu />
          </div>
        ) : (
          <Link
            href="/Auth"
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-200 
              dark:hover:bg-neutral-800 transition-colors"
          >
            <FaSignInAlt className="w-5 h-5" />
            {!isCollapsed && (
              <span className="text-sm font-medium">Sign In</span>
            )}
          </Link>
        )}

        {/* Theme Toggle */}
        <div className={`flex ${isCollapsed ? 'justify-center ' : 'justify-start'}`}>
          <ModeToggle />
        </div>
      </div>
    </motion.aside>
  );
}