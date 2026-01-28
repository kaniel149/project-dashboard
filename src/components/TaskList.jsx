import React from 'react';
function TaskList({ tasks, completed = false }) {
  return (
    <div className="space-y-1">
      {tasks.map((task, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className={completed ? 'text-green-400' : 'text-white/40'}>
            {completed ? '☑' : '☐'}
          </span>
          <span className={`${completed ? 'text-white/50 line-through' : 'text-white/70'}`}>
            {task}
          </span>
        </div>
      ))}
    </div>
  );
}
export default TaskList;
