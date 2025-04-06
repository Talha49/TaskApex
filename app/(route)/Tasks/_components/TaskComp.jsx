"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineLinearScale } from "react-icons/md";
import { FaTimes, FaTrashAlt, FaUserEdit } from "react-icons/fa";
import { IoCloudDoneOutline } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import CreateTaskDialog from "../../../_components/CreateTaskDialog/CreateTaskDialog";
import {
  fetchTasks,
  deleteTasks,
  setSearchQuery,
  selectFilteredTasks,
  setEditingTask,
} from "../../../../lib/Features/UserSlice";

const taskVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export default function Tasks() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.task.tasks);
  const taskStatus = useSelector((state) => state.task.status);
  const filteredTasks = useSelector(selectFilteredTasks);
  const searchQuery = useSelector((state) => state.task.searchQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSelectMultiple, setIsSelectMultiple] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/Auth");
    } else if (status === "authenticated" && taskStatus === "idle") {
      dispatch(fetchTasks(session.user.tenantId));
    }
  }, [status, taskStatus, dispatch, router, session]);

  const handleSearch = (e) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleTaskSelection = (taskId) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    setSelectedTasks(
      selectedTasks.length === filteredTasks.length
        ? []
        : filteredTasks.map((task) => task._id)
    );
  };

  const handleMultipleDelete = async () => {
    if (isSelectMultiple && selectedTasks.length > 0) {
      try {
        await dispatch(deleteTasks(selectedTasks)).unwrap();
        setSelectedTasks([]);
        setIsSelectMultiple(false);
      } catch (error) {
        console.error("Error deleting tasks:", error);
      }
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await dispatch(deleteTasks(taskId)).unwrap();
      handleCloseModal();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
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

  if (taskStatus === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
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
              {searchQuery && (
                <button
                  onClick={() => dispatch(setSearchQuery(""))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
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
                  {selectedTasks.length === filteredTasks.length ? "Deselect All" : "Select All"}
                </Button>
                <Button
                  onClick={handleMultipleDelete}
                  disabled={selectedTasks.length === 0 || session?.user?.role !== "admin"}
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

      <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredTasks.map((task) => (
            <motion.div
              key={task._id}
              variants={taskVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 
                shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col min-h-[400px]"
            >
              <div className="border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex justify-between items-center">
                {isSelectMultiple && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task._id)}
                      onChange={() => handleTaskSelection(task._id)}
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

              <div className="flex-grow flex flex-col p-6 gap-4">
                <div className="text-2xl">{task.emojiIcon}</div>
                <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border border-gray-100 
                  dark:border-gray-800 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                  {task.title}
                </h5>
                <div className="flex-grow overflow-hidden">
                  <p className="text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800 
                    rounded-lg p-3 bg-gray-50 dark:bg-gray-800 overflow-y-auto scrollbar-thin max-h-[150px]">
                    {task.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-auto">
                  {task.category.map((cat) => (
                    <span key={cat} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <button
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
            style={{ top: `${modalPosition.top}px`, left: `${modalPosition.left}px` }}
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
                {session?.user?.role === "admin" && (
                  <button
                    onClick={() => handleDelete(selectedTask._id)}
                    className="flex items-center gap-3 w-full p-2 text-red-600 dark:text-red-400 
                      hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                  >
                    <FaTrashAlt className="w-4 h-4" />
                    <span>Delete task</span>
                  </button>
                )}
                {(session?.user?.role === "admin" || selectedTask.createdBy._id === session?.user?.id) && (
                  <button
                    onClick={() => dispatch(setEditingTask(selectedTask))}
                    className="flex items-center gap-3 w-full p-2 text-gray-700 dark:text-gray-200 
                      hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                  >
                    <FaUserEdit className="w-4 h-4" />
                    <span>Edit task</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center p-8 mt-8"
        >
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
            {searchQuery ? "No matching tasks found" : "No tasks yet"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
            {searchQuery ? "Try adjusting your search" : "Start by creating your first task"}
          </p>
          <CreateTaskDialog />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-6 right-6"
      >
        <div className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-full shadow-lg">
          <span className="font-medium">{filteredTasks.length}</span>
          <span className="ml-1 text-sm">{filteredTasks.length === 1 ? "Task" : "Tasks"}</span>
        </div>
      </motion.div>
    </div>
  );
}