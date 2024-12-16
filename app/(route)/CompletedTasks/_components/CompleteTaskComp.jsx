"use client"
import { fetchCompleteTasks } from '@/lib/Features/UserSlice'
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

const CompleteTaskComp = () => {
    const dispatch = useDispatch()
    const completeTasks = useSelector((state) => state.task.completetasks)
    const status = useSelector((state) => state.task.status)
    const error = useSelector((state) => state.task.error)

    useEffect(() => {
        dispatch(fetchCompleteTasks())
    }, [dispatch])

    if (status === 'loading') {
        return <div>Loading...</div>
    }

    if (status === 'failed') {
        return <div>Error: {error}</div>
    }

    return (
        <div className=''>
            <h2 className='py-8 font-semibold font-serif ' >Tasks Conquered</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {completeTasks?.map((task) => (
          <div
            key={task.id}
            className="block w-full rounded-lg border border-success-600 bg-transparent text-surface shadow-secondary-1 dark:bg-surface-dark dark:text-white flex flex-col"
          >
            <div className="p-4 flex-grow flex flex-col">
            <h5 className="mb-2 text-xl font-medium leading-tight text-success-600 ">
                {task.emojiIcon}
              </h5>              <h5 className="mb-2 text-lg font-medium leading-tight text-success-600 border-e-2 shadow-sm p-2">
                {task.title}
              </h5>
              <p
                className="text-sm text-success-600 overflow-y-auto scrollbar-hide border-e-2 shadow-sm p-2 flex-grow"
                style={{ maxHeight: "150px" }}
              >
                {task.description}
              </p>
              <p className="text-sm text-gray-500 mt-2">Category: {task.category}</p>
            </div>
          
          </div>
        ))}
      </div>
        </div>
    )
}

export default CompleteTaskComp