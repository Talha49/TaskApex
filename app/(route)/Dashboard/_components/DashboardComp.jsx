'use client'
import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import Image from "next/image";
import { fetchCompleteTasks, fetchTasks, selectFilteredTasks } from "@/lib/Features/UserSlice";
import { Component } from "./Chart";

const DashboardComp = () => {
    const dispatch = useDispatch();
    const filteredTasks = useSelector(selectFilteredTasks);
    const completeTasks = useSelector((state) => state.task.completetasks)


    useEffect(() => {
        // Fetch tasks when the component mounts
        dispatch(fetchTasks());
    }, [dispatch]);

    useEffect(() => {
      dispatch(fetchCompleteTasks())
  }, [dispatch])


    const categoryCounts = useMemo(() => {
        const counts = {};
        filteredTasks.forEach(task => {
          if (task.category) {
            counts[task.category] = (counts[task.category] || 0) + 1;
          }
        });
        return counts;
      }, [filteredTasks]);
    
      // Convert to chart data format
      const chartData = Object.entries(categoryCounts).map(([category, count]) => ({
        category,
        count,
        fill: "#" + Math.floor(Math.random()*16777215).toString(19) // Random color
      }));
     
      

      const categoryCountscompleteTasks = useMemo(() => {
        const counts = {};
        completeTasks.forEach(task => {
          if (task.category) {
            counts[task.category] = (counts[task.category] || 0) + 1;
          }
        });
        return counts;
      }, [completeTasks]);

      const completeTaskschartData = Object.entries(categoryCountscompleteTasks).map(([category, count]) => ({
        category,
        count,
        fill: "#" + Math.floor(Math.random()*16777215).toString(14) // Random color
      }));


     
    return (
        <div>
            <h2 className="text-lg font-semibold leading-tight">Dashboard</h2>
            <div className="mt-6 flex flex-col md:flex-row gap-6 md:gap-10 md:items-center">
            


<div
  class="cursor-pointer group overflow-hidden p-5 duration-1000 hover:duration-1000 relative md:w-48 w-52 h-40 bg-transparent border  rounded-xl"
>
  <div
    class="group-hover:-rotate-45 bg-transparent group-hover:scale-150 -top-12 -left-12 absolute shadow-yellow-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24"
  ></div>
  <div
    class="group-hover:rotate-45 bg-transparent group-hover:scale-150 top-44 left-14 absolute shadow-red-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24"
  ></div>
  <div
    class="group-hover:-rotate-45 bg-transparent group-hover:scale-150 top-24 left-56 absolute shadow-sky-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24"
  ></div>
  <div
    class="group-hover:-rotate-45 bg-transparent group-hover:scale-150 top-12 left-12 absolute shadow-red-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-12 h-12"
  ></div>
  <div
    class="group-hover:rotate-45 bg-transparent group-hover:scale-150 top-12 left-12 absolute shadow-green-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-44 h-44"
  ></div>
  <div
    class="group-hover:rotate-45 bg-transparent group-hover:scale-150 -top-24 -left-12 absolute shadow-sky-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-64 h-64"
  ></div>
  <div
    class="group-hover:-rotate-45 bg-transparent group-hover:scale-150 top-24 left-12 absolute shadow-sky-500 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-4 h-4"
  ></div>
  <div
    class="w-full h-full shadow-xl shadow-neutral-900 p-3 bg-transparent border-e-green-100 opacity-50 rounded-xl flex-col gap-2 flex justify-center"
  >
    <span class="text-amber-900 font-bold text-xl italic">Task Horizon</span>
    <p class="text-amber-900 font-bold">
     {
        filteredTasks.length
     }
    </p>
  </div>
</div>
<div
  class="cursor-pointer group overflow-hidden p-5 duration-1000 hover:duration-1000 relative md:w-48 w-52 h-40 bg-transparent border rounded-xl"
>
  <div
    class="group-hover:-rotate-45 bg-transparent group-hover:scale-150 -top-12 -left-12 absolute shadow-yellow-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24"
  ></div>
  <div
    class="group-hover:rotate-45 bg-transparent group-hover:scale-150 top-44 left-14 absolute shadow-red-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24"
  ></div>
  <div
    class="group-hover:-rotate-45 bg-transparent group-hover:scale-150 top-24 left-56 absolute shadow-sky-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24"
  ></div>
  <div
    class="group-hover:-rotate-45 bg-transparent group-hover:scale-150 top-12 left-12 absolute shadow-red-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-12 h-12"
  ></div>
  <div
    class="group-hover:rotate-45 bg-transparent group-hover:scale-150 top-12 left-12 absolute shadow-green-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-44 h-44"
  ></div>
  <div
    class="group-hover:rotate-45 bg-transparent group-hover:scale-150 -top-24 -left-12 absolute shadow-sky-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-64 h-64"
  ></div>
  <div
    class="group-hover:-rotate-45 bg-transparent group-hover:scale-150 top-24 left-12 absolute shadow-sky-500 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-4 h-4"
  ></div>
  <div
    class="w-full h-full shadow-xl shadow-neutral-900 p-3 bg-transparent border-e-green-100 opacity-50 rounded-xl flex-col gap-2 flex justify-center"
  >
    <span class="text-amber-900 font-bold text-xl italic">Achievement Quotient </span>
    <p class="text-amber-900 font-bold">
     {
        completeTasks.length
     }
    </p>
  </div>
</div>

         </div>

         <h2 className="text-lg font-semibold leading-tight my-6">Charts</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="w-full">
                <Component
data={chartData}
title='Productivity Overview'
subtitle='Task Management Dashboard'
/>                </div>
                <div className="w-full">
                <Component
data={completeTaskschartData}
title='Completion Rate'
subtitle='Percentage of Tasks Completed'
/>                </div>
                </div>
           
        </div>
    );
};

export default DashboardComp;
