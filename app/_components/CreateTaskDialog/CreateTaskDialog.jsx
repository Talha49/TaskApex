"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IoCreateOutline } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import { createTask, setEditingTask, updateTask } from "../../../lib/Features/UserSlice";

export default function CreateTaskDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emojiIcon, setEmojiIcon] = useState("😊");
  const [category, setCategory] = useState("");
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const editingTask = useSelector((state) => state.task.editingTask);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setEmojiIcon(editingTask.emojiIcon);
      setCategory(editingTask.category[0] || ""); // Assuming single category for simplicity
      setOpen(true);
    }
  }, [editingTask]);

  const handleSubmit = async () => {
    if (!title || !description || !category) {
      alert("All fields are required.");
      return;
    }

    const taskData = {
      title,
      description,
      emojiIcon,
      category: [category], // Keep as array for schema consistency
      tenantId: session?.user?.tenantId, // Use tenantId instead of userId
    };

    try {
      if (editingTask) {
        await dispatch(updateTask({ id: editingTask._id, updateFields: taskData })).unwrap();
      } else {
        await dispatch(createTask(taskData)).unwrap();
      }
      handleClose();
    } catch (error) {
      console.error("Error submitting task:", error);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setEmojiIcon("😊");
    setCategory("");
    setOpen(false);
    setOpenEmojiPicker(false);
    dispatch(setEditingTask(null));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="transparent" className="flex gap-2 border items-center">
          <IoCreateOutline size={25} /> Create
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editingTask ? "Update Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="mt-5">
            <button onClick={() => setOpenEmojiPicker(!openEmojiPicker)}>
              {emojiIcon}
            </button>
            {openEmojiPicker && (
              <div className="absolute">
                <EmojiPicker
                  onEmojiClick={(e) => {
                    setEmojiIcon(e.emoji);
                    setOpenEmojiPicker(false);
                  }}
                  open={openEmojiPicker}
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="tenantId" className="text-left">
              Tenant ID
            </Label>
            <Input
              id="tenantId"
              value={session?.user?.tenantId || ""}
              readOnly
              className="bg-gray-100 dark:bg-gray-800"
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="title" className="text-left">
              Title
            </Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="description" className="text-left">
              Description
            </Label>
            <textarea
              id="description"
              placeholder="Enter task description"
              className="w-full h-24 px-3 py-2 text-base border rounded-lg focus:outline-none focus:shadow-md"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="categories" className="text-left font-medium">
              Category
            </Label>
            <select
              id="categories"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>
                Select
              </option>
              {["Home", "Office", "College", "Personal", "Study"].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button disabled={!title || !description || !category} onClick={handleSubmit}>
            {editingTask ? "Update Task" : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}