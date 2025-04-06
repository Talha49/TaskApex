import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Fetch tasks for a tenant
export const fetchTasks = createAsyncThunk("tasks/fetchTasks", async (tenantId, { rejectWithValue }) => {
  try {
    const res = await fetch("/api/Tasks/GetTask", {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return await res.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// Create a new task
export const createTask = createAsyncThunk("tasks/createTask", async (taskData, { rejectWithValue }) => {
  try {
    const res = await fetch("/api/Tasks/CreateTask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
    if (!res.ok) throw new Error("Failed to create task");
    return await res.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// Update a task
export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, updateFields }, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/Tasks/UpdateTask", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updateFields }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete tasks (single or multiple)
export const deleteTasks = createAsyncThunk("tasks/deleteTasks", async (taskIds, { rejectWithValue }) => {
  try {
    const res = await fetch("/api/Tasks/DeleteTask", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskIds: Array.isArray(taskIds) ? taskIds : [taskIds] }),
    });
    if (!res.ok) throw new Error("Failed to delete tasks");
    return taskIds; // Return the IDs to remove from state
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// Selector for filtered tasks
export const selectFilteredTasks = (state) => {
  const { tasks, searchQuery } = state.task;
  if (!searchQuery) return tasks;
  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
};

const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    tasks: [],
    status: "idle",
    error: null,
    editingTask: null,
    searchQuery: "",
  },
  reducers: {
    setEditingTask: (state, action) => {
      state.editingTask = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Create Task
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Update Task
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((task) => task._id === action.payload._id);
        if (index !== -1) state.tasks[index] = action.payload;
        state.editingTask = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete Tasks
      .addCase(deleteTasks.fulfilled, (state, action) => {
        const deletedIds = Array.isArray(action.payload) ? action.payload : [action.payload];
        state.tasks = state.tasks.filter((task) => !deletedIds.includes(task._id));
      })
      .addCase(deleteTasks.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setEditingTask, setSearchQuery } = taskSlice.actions;
export default taskSlice.reducer;