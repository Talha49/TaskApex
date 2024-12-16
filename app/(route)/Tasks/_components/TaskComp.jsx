"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineLinearScale } from "react-icons/md";
import { FaTimes, FaTrashAlt, FaUserEdit } from "react-icons/fa";
import { IoCloudDoneOutline } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import CreateTaskDialog from "@/app/_components/CreateTaskDialog/CreateTaskDialog";
import {
  deleteTasks,
  fetchTasks,
  selectFilteredTasks,
  setEditingTask,
  setSearchQuery,
  storeCompleteTasks,
} from "@/lib/Features/UserSlice";

const taskVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95 }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

const TaskComp = () => {
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.task.tasks);
  const taskStatus = useSelector((state) => state.task.status);
  const error = useSelector((state) => state.task.error);
  const [saveTask, setSaveTask] = useState();
  const [showModal, setShowModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [selectedTask, setSelectedTask] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [isSelectMultiple, setIsSelectMultiple] = useState(false);
  const filteredTasks = useSelector(selectFilteredTasks);
  const searchQuery = useSelector((state) => state.task.searchQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);


  useEffect(() => {
    if (taskStatus === "idle") {
      dispatch(fetchTasks());
    }
  }, [taskStatus, dispatch]);

  useEffect(() => {
    setSaveTask(tasks);
    setSelectedTask([]);
  }, [tasks]);

  const handleEdit = (task) => {
    dispatch(setEditingTask(task));
    handleCloseModal();
  };

  const handleOpenModal = (event, task) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const modalWidth = 200;
    const modalHeight = 120;

    let top = rect.bottom + window.scrollY;
    let left = rect.left + window.scrollX;

    if (left + modalWidth > window.innerWidth) {
      left = window.innerWidth - modalWidth - 10;
    }
    if (top + modalHeight > window.innerHeight) {
      top = rect.top - modalHeight + window.scrollY;
    }

    setModalPosition({ top, left });
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTask(null);
  };

  const handleDelete = async (taskId) => {
    try {
      await dispatch(deleteTasks(taskId));
      if (showModal) handleCloseModal();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleTaskSelection = (taskId) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleMultipleDelete = async () => {
    if (isSelectMultiple && selectedTasks.length > 0) {
      try {
        await dispatch(deleteTasks(selectedTasks));
        setSelectedTasks([]);
        setIsSelectMultiple(false);
      } catch (error) {
        console.error("Error deleting tasks:", error);
      }
    }
  };

  const handleCompleteTask = async (task) => {
    try {
      if (!task || !task.id) {
        throw new Error("Task data is missing or invalid");
      }
      await dispatch(deleteTasks(task.id)).unwrap();
      await dispatch(storeCompleteTasks(task)).unwrap();
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  const handleSelectAll = () => {
    setSelectedTasks(
      selectedTasks.length === filteredTasks.length
        ? []
        : filteredTasks.map((task) => task.id)
    );
  };

  const handleSearch = (e) => {
    dispatch(setSearchQuery(e.target.value));
  };

  if (taskStatus === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (taskStatus === "failed") {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-9 px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-6 z-10 px-4 rounded-lg shadow-sm"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold text-2xl tracking-wider text-gray-700 dark:text-gray-200">
            All Tasks
          </h2>
          <CreateTaskDialog />
        </div>

        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <input
                type="text"
                className={`w-full py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 
                  focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none
                  transition-all duration-200 text-gray-700 dark:text-gray-200 ${
                    isSearchFocused ? "shadow-lg" : ""
                  }`}
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {searchQuery && (
                  <button
                    onClick={() => dispatch(setSearchQuery(""))}
                    className="hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href=""
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 
                hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <Image src="/filter.svg" width={18} height={18} alt="Filter" />
              <span className="text-gray-700 dark:text-gray-200">Filter</span>
            </Link>

            {filteredTasks.length > 1 && (
              <Button
                onClick={() => {
                  setIsSelectMultiple(!isSelectMultiple);
                  setSelectedTasks([]);
                }}
                variant={isSelectMultiple ? "destructive" : "secondary"}
                className="transition-all duration-200"
              >
                {isSelectMultiple ? "Cancel" : "Delete Multiple"}
              </Button>
            )}

            {isSelectMultiple && (
              <>
                <Button
                  onClick={handleSelectAll}
                  variant="outline"
                  className="transition-all duration-200"
                >
                  {selectedTasks.length === filteredTasks.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
                <Button
                  onClick={handleMultipleDelete}
                  disabled={selectedTasks.length === 0}
                  variant="destructive"
                  className="transition-all duration-200"
                >
                  Delete Selected ({selectedTasks.length})
                </Button>
              </>
            )}
          </div>
        </div>

        <p className="text-end text-sm text-gray-500 dark:text-gray-400 mt-4">
          Total Tasks: {filteredTasks.length}
        </p>
      </motion.div>

      {/* Replace the task card section in your code with this updated version */}
<motion.div
  layout
  className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
>
  <AnimatePresence>
    {filteredTasks?.map((task) => (
      <motion.div
        key={task.id}
        variants={taskVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        layout
        className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 
          shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col min-h-[400px]"
      >
        {/* Header Section */}
        <div className="border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex justify-between items-center">
          {isSelectMultiple && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center"
            >
              <input
                type="checkbox"
                checked={selectedTasks.includes(task.id)}
                onChange={() => handleTaskSelection(task.id)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </motion.div>
          )}
          <div className="flex-grow" />
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-200"
            onClick={(e) => handleOpenModal(e, task)}
          >
            <MdOutlineLinearScale className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content Section - Flex Grow to Take Available Space */}
        <div className="flex-grow flex flex-col p-6 gap-4">
          <div className="text-2xl">{task.emojiIcon}</div>
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border border-gray-100 
            dark:border-gray-800 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
            {task.title}
          </h5>
          <div className="flex-grow overflow-hidden">
            <div className="h-full">
              <p className="text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800 
                rounded-lg p-3 bg-gray-50 dark:bg-gray-800 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500 
                scrollbar-track-gray-200 dark:scrollbar-track-gray-700 h-full max-h-[150px]">
                {task.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-auto">
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
              {task.category}
            </span>
          </div>
        </div>

        {/* Footer Section - Always at Bottom */}
        <button
          onClick={() => handleCompleteTask(task)}
          disabled
          className="w-full mt-auto border-t border-gray-100 dark:border-gray-800 px-6 py-3 flex items-center gap-3 
            text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          <IoCloudDoneOutline className="w-5 h-5" />
          <span>Mark as Complete</span>
        </button>
      </motion.div>
    ))}
  </AnimatePresence>
</motion.div>


      <AnimatePresence>
        {showModal && selectedTask && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed z-50 bg-white dark:bg-gray-900 w-[200px] rounded-xl shadow-lg border 
              border-gray-200 dark:border-gray-800 overflow-hidden"
            style={{
              top: `${modalPosition.top}px`,
              left: `${modalPosition.left}px`,
            }}
          >
            <div className="p-4">
              <div className="flex justify-end mb-4">
                <button
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-200"
                  onClick={handleCloseModal}
                >
                  <FaTimes className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleDelete(selectedTask.id)}
                  className="flex items-center gap-3 w-full p-2 text-red-600 dark:text-red-400 
                    hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                >
                  <FaTrashAlt className="w-4 h-4" />
                  <span>Delete task</span>
                </button>
                <button
                  onClick={() => handleEdit(selectedTask)}
                  className="flex items-center gap-3 w-full p-2 text-gray-700 dark:text-gray-200 
                    hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                >
<FaUserEdit className="w-4 h-4" />
                  <span>Edit task</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center p-8 mt-8"
        >
          <div className="w-48 h-48 mb-6 opacity-50">
            <Image
              src="/empty-tasks.svg"
              width={192}
              height={192}
              alt="No tasks found"
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
            {searchQuery ? "No matching tasks found" : "No tasks yet"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
            {searchQuery
              ? "Try adjusting your search or filters"
              : "Start by creating your first task"}
          </p>
          <CreateTaskDialog />
        </motion.div>
      )}

      {/* Task Count Badge - Fixed Position */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-6 right-6"
      >
        <div className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-full shadow-lg">
          <span className="font-medium">{filteredTasks.length}</span>
          <span className="ml-1 text-sm">
            {filteredTasks.length === 1 ? "Task" : "Tasks"}
          </span>
        </div>
      </motion.div>

      {/* Keyboard Shortcuts Modal */}
      <div className="fixed bottom-6 left-28">
        <button
          onClick={() => setShowShortcuts(true)}
          className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 
            text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full shadow-lg transition-colors duration-200"
        >
          <span className="text-sm">⌘K</span>
        </button>
      </div>
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Keyboard Shortcuts
                </h3>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <FaTimes className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">New Task</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">⌘ + N</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Search</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">⌘ + K</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Toggle Theme</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">⌘ + T</kbd>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Custom Styles */}
      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 7px;
          height: 12px;
          background: linear-gradient(to right, #e0e7ff 0%, #c7d2fe 100%);
        }

        .dark .scrollbar-thin::-webkit-scrollbar {
          background: linear-gradient(to right, #1e1b4b 0%, #312e81 100%);
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: linear-gradient(to right, #6366f1 0%, #4f46e5 100%);
          border-radius: 10px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to right, #4f46e5 0%, #4338ca 100%);
        }

        .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to right, #818cf8 0%, #6366f1 100%);
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: linear-gradient(to right, #f1f5f9 0%, #e2e8f0 100%);
          border-radius: 10px;
        }

        .dark .scrollbar-thin::-webkit-scrollbar-track {
          background: linear-gradient(to right, #1e293b 0%, #0f172a 100%);
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .loading-shimmer {
          animation: shimmer 2s infinite linear;
          background: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
          background-size: 1000px 100%;
        }

        .dark .loading-shimmer {
          background: linear-gradient(to right, #1a1a1a 0%, #2a2a2a 20%, #1a1a1a 40%, #1a1a1a 100%);
        }
      `}</style>
    </div>
  );
};

export default TaskComp;