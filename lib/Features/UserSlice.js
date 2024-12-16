// lib/Features/taskSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const res = await fetch('/api/Tasks/GetTask');
  if (res.ok) {
    const data = await res.json();
    return data;
  } else {
    throw new Error('Failed to fetch tasks');
  }
});

export const createTask = createAsyncThunk('tasks/createTask', async (taskData, {dispatch}) => {
  console.log('Creating task with data:', taskData);
  const res = await fetch('/api/Tasks/CreateTask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });
  if (res.ok) {
    const data = await res.json();
    console.log('Created task:', data);
    return data;
  } else {
    throw new Error('Failed to create task');
  }
});



export const deleteTasks = createAsyncThunk('tasks/deleteTasks', async (taskIds) => {
  const res = await fetch('/api/Tasks/DeleteTask', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ taskIds: Array.isArray(taskIds) ? taskIds : [taskIds] }),
  });
  if (res.ok) {
    return taskIds;
  } else {
    throw new Error('Failed to delete task(s)');
  }
});

export const updateTask = createAsyncThunk('tasks/updateTask', async ({ id, updateFields }) => {
  console.log('Updating task:', id, updateFields);
  const res = await fetch('/api/Tasks/UpdateTask', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({id, ...updateFields}),
  });
  if (res.ok) {
    const data = await res.json();
    console.log('Updated task:', data);
    return data;
  } else {
    throw new Error('Failed to update task');
  }
});
export const selectFilteredTasks = (state) => {
  const { tasks, searchQuery } = state.task;
  if (!searchQuery) return tasks;
  return tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
}


export const storeCompleteTasks = createAsyncThunk(
  'tasks/storeCompleteTask',
  async (taskdata) => {
    const res = await fetch('/api/Tasks/TaskComplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskdata }),
    });
    if (!res.ok) {
      throw new Error('Failed to store complete task');
    }
    return await res.json();
  }
);


export const fetchCompleteTasks = createAsyncThunk('tasks/fetchCompleteTasks',async() =>{

    const  res = await fetch('/api/Tasks/GetTaskComplete')
    if (res.ok) {
    const data = await res.json();
    console.log('Fetched complete tasks:', data);
    return data;
    } else {
    throw new Error('Failed to fetch complete tasks');
    }


} )



const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    completetasks:[],
    status: 'idle',
    error: null,
    editingTask:null,
    searchQuery: '',
  },
  reducers:{
            setEditingTask: (state,action) => {
              state.editingTask = action.payload
            },
            setSearchQuery: (state, action) => {
              state.searchQuery = action.payload;
            },
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
        console.log('Task added to state:', action.payload); // Add this line
      })
      .addCase(deleteTasks.fulfilled, (state, action) => {
        const deletedIds = Array.isArray(action.payload) ? action.payload : [action.payload];
        state.tasks = state.tasks.filter(task => !deletedIds.includes(task.id));
      })
      .addCase(updateTask.fulfilled, (state,action) => {
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      state.editingTask = null;
      })
      .addCase(storeCompleteTasks.fulfilled, (state, action) => {
        console.log('Task completed and stored:', action.payload);
      })
      .addCase(storeCompleteTasks.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(fetchCompleteTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCompleteTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.completetasks = action.payload;
      })
      .addCase(fetchCompleteTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
  },
});



export const {setEditingTask,setSearchQuery} = taskSlice.actions




export default taskSlice.reducer;

