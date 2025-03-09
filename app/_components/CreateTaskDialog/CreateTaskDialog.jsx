"use client";
import React, { useEffect, useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import {
  createTask,
  setEditingTask,
  updateTask,
} from "@/lib/Features/UserSlice";
import EmojiPicker from "emoji-picker-react";
import { useSession } from "next-auth/react";

const CreateTaskDialog = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);
  const [emojiIcon, setEmojiIcon] = useState("😊");
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [category, setCategory] = useState("");
  const dispatch = useDispatch();
  const editingTask = useSelector((state) => state.task.editingTask);
  const {data:session} = useSession()

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setEmojiIcon(editingTask.emojiIcon);
      setCategory(editingTask.category);
      setOpen(true);
    }
  }, [editingTask]);

  const handleSubmit = () => {
    if (!title || !description || !category) {
      alert("All fields are required.");
      return;
    }
  
    const taskData = { title, description, emojiIcon, category: [category] , userId: session?.user?.id  // Add the userId here
    };
  
    if (editingTask && editingTask._id) {
      // Use _id for updating the task
      dispatch(
        updateTask({
          id: editingTask._id, // Use _id here
          updateFields: taskData,
        })
      );
      console.log("SIS", editingTask._id) 
    } else {
      dispatch(createTask(taskData));
    }
  
    handleClose();
  };
  

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setOpen(false);
    setOpenEmojiPicker("");
    setCategory("");
    dispatch(setEditingTask(null));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="transparent"
          className="flex gap-2 border items-center"
        >
          <IoCreateOutline size={25} /> Create
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editingTask ? "Update Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4 ">
          <div className="mt-5">
            <button
              onClick={() => {
                setOpenEmojiPicker(!openEmojiPicker);
              }}
            >
              {emojiIcon}
            </button>
            <div className="absolute">
              <EmojiPicker
                onEmojiClick={(e) => {
                  setEmojiIcon(e.emoji);
                  setOpenEmojiPicker(false);
                  console.log(e.emoji);
                }}
                open={openEmojiPicker}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="title" className="text-left">
              UserID
            </Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={session?.user?.id}
              onChange={(e) => setTitle(e.target.value)}
              readOnly
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
            <label
              htmlFor="categories"
              className="text-left font-medium "
            >
              Categories
            </label>
            <select
              id="categories"
              value={category} onChange={(e) => setCategory(e.target.value)}
              className="p-2  rounded shadow-sm  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
                  <option value="" disabled selected hidden>Select</option>
              <option value="Home" className=" ">Home</option>
              <option value="Office" className=" ">Office</option>
              <option value="College" className="">College</option>
              <option value="Personal" className="">Personal</option>
              <option value="Study" className="">Study</option>

             </select>
          </div>
        </div>
        <DialogFooter className="">
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              disabled={!(title && description && category)}
              type="submit"
              onClick={handleSubmit}
            >
              {editingTask ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;
