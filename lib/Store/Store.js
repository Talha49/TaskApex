import { configureStore } from "@reduxjs/toolkit";
import userReducer from '../Features/UserSlice'


const store =configureStore({
    reducer:{
        task: userReducer
    }
})



export default store