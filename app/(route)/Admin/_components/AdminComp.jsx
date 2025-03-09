"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Edit2, Trash2, RefreshCw, Search, 
  AlertCircle, CheckCircle, ChevronDown, Mail, Phone, 
  Briefcase, Shield, Lock, Eye, EyeOff
} from 'lucide-react';
import { debounce } from 'lodash';

// Password generator
function generateRandomPassword(length = 12) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues).map((val) => chars[val % chars.length]).join('');
}

// Toast component
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${type === "success" ? "bg-green-500" : "bg-red-500"} text-white p-4 rounded-lg shadow-lg flex items-center space-x-3 fixed top-4 right-4 z-50 max-w-md`}
    >
      {type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      <span>{message}</span>
      <button onClick={onClose} className="text-white">×</button>
    </motion.div>
  );
};

// Input field component
const InputField = ({ label, icon: Icon, error, ...props }) => (
  <div className="mb-4">
    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />}
      <input
        className={`w-full px-4 py-2 ${Icon ? 'pl-10' : ''} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
        {...props}
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// Select field component
const SelectField = ({ label, icon: Icon, options, error, ...props }) => (
  <div className="mb-4">
    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />}
      <select
        className={`w-full px-4 py-2 ${Icon ? 'pl-10' : ''} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 dark:text-gray-300 pointer-events-none" />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default function AdminComp() {
  const { data: session, status } = useSession();
  const [selectedTab, setSelectedTab] = useState("create");
  const [formData, setFormData] = useState({
    fullName: "", email: "", contact: "", team: "", role: "user", password: generateRandomPassword(),
  });
  const [formErrors, setFormErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10;

  // All hooks must be called before any returns
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/Get?page=${page}&limit=${PAGE_SIZE}`, {
        headers: { Authorization: `Bearer ${session?.user.id}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setFilteredUsers(data.users);
        setTotalPages(Math.ceil(data.total / PAGE_SIZE));
      } else throw new Error(data.error || "Failed to fetch users");
    } catch (error) {
      showToast(error.message, "error");
      console.error("Fetch users error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = useCallback(
    debounce((term) => {
      const results = users.filter((user) =>
        [user.fullName, user.email, user.team || ""].some((field) => field.toLowerCase().includes(term.toLowerCase()))
      );
      setFilteredUsers(results);
    }, 300),
    [users]
  );

  useEffect(() => {
    if (status === "authenticated" && session?.user.role === "admin") {
      fetchUsers();
    }
  }, [page, status, session]);

  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm, handleSearch]);

  // Early returns after all hooks
  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center"><RefreshCw className="animate-spin text-blue-500" size={30} /></div>;
  }

  if (status === "unauthenticated" || (session && session.user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Unauthorized</h1>
        <p className="text-gray-600 dark:text-gray-400">You don’t have permission to access this page.</p>
      </div>
    );
  }

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email format";
    if (formData.contact && !/^\+?[1-9]\d{0,14}$/.test(formData.contact)) errors.contact = "Invalid phone number (e.g., +1234567890)";
    if (!editingUser && !formData.password) errors.password = "Password is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGeneratePassword = () => {
    setFormData((prev) => ({ ...prev, password: generateRandomPassword() }));
  };

  const showToast = (message, type = "success") => setToast({ show: true, message, type });
  const hideToast = () => setToast((prev) => ({ ...prev, show: false }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/users/Create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.id}`
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("User created successfully");
        fetchUsers();
        setFormData({ fullName: "", email: "", contact: "", team: "", role: "user", password: generateRandomPassword() });
      } else throw new Error(data.error || "Failed to create user");
    } catch (error) {
      showToast(error.message, "error");
      console.error("Create user error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ ...user, password: "" });
    setSelectedTab("create");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/RUD/${editingUser._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.id}`
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("User updated successfully");
        setEditingUser(null);
        fetchUsers();
        setFormData({ fullName: "", email: "", contact: "", team: "", role: "user", password: generateRandomPassword() });
      } else throw new Error(data.error || "Failed to update user");
    } catch (error) {
      showToast(error.message, "error");
      console.error("Update user error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/Delete/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.user.id}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast("User deleted successfully");
        fetchUsers();
      } else throw new Error(data.error || "Failed to delete user");
    } catch (error) {
      showToast(error.message, "error");
      console.error("Delete user error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AnimatePresence>
        {toast.show && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      </AnimatePresence>

      <div className="container mx-auto p-6">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
          User Management
        </motion.h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-1 mb-8 flex">
          <motion.button
            className={`flex-1 p-3 rounded-lg ${selectedTab === "create" ? "bg-blue-500 text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
            onClick={() => setSelectedTab("create")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {editingUser ? <><Edit2 size={18} className="inline mr-2" /> Edit User</> : <><UserPlus size={18} className="inline mr-2" /> Create User</>}
          </motion.button>
          <motion.button
            className={`flex-1 p-3 rounded-lg ${selectedTab === "list" ? "bg-blue-500 text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
            onClick={() => setSelectedTab("list")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Users size={18} className="inline mr-2" /> User List
          </motion.button>
        </div>

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <RefreshCw size={30} className="animate-spin text-blue-500" />
          </motion.div>
        )}

        {selectedTab === "create" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{editingUser ? "Edit User" : "Create New User"}</h2>
            <form onSubmit={editingUser ? handleUpdate : handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Full Name" icon={Users} name="fullName" value={formData.fullName} onChange={handleChange} required error={formErrors.fullName} />
                <InputField label="Email" icon={Mail} name="email" value={formData.email} onChange={handleChange} required disabled={!!editingUser} error={formErrors.email} />
                <InputField label="Contact" icon={Phone} name="contact" value={formData.contact} onChange={handleChange} error={formErrors.contact} />
                <InputField label="Team" icon={Briefcase} name="team" value={formData.team} onChange={handleChange} />
                <SelectField
                  label="Role"
                  icon={Shield}
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  options={[
                    { value: "user", label: "User" },
                    { value: "admin", label: "Admin" },
                    { value: "manager", label: "Manager" },
                    { value: "readonly", label: "Read Only" },
                  ]}
                />
                <div className="relative">
                  <InputField
                    label="Password"
                    icon={Lock}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingUser}
                    error={formErrors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute ml-[80%] top-10 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="absolute right-2 top-10 text-blue-500 hover:text-blue-700"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div className="flex space-x-4">
                <motion.button
                  type="submit"
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                >
                  {editingUser ? "Update User" : "Create User"}
                </motion.button>
                {editingUser && (
                  <motion.button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>
        )}

        {selectedTab === "list" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User List</h2>
              <InputField
                icon={Search}
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Full Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Team</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <motion.tr key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{user.fullName}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.role === "admin" ? "bg-red-100 text-red-800" :
                          user.role === "manager" ? "bg-purple-100 text-purple-800" :
                          user.role === "readonly" ? "bg-gray-100 text-gray-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{user.team || "-"}</td>
                      <td className="px-6 py-4 flex space-x-2">
                        <motion.button onClick={() => handleEdit(user)} className="text-blue-500 hover:text-blue-700" whileHover={{ scale: 1.1 }}>
                          <Edit2 size={18} />
                        </motion.button>
                        <motion.button onClick={() => handleDelete(user._id)} className="text-red-500 hover:text-red-700" whileHover={{ scale: 1.1 }}>
                          <Trash2 size={18} />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-700 dark:text-gray-300">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}