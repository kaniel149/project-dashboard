function isHebrew(text) {
  return /[\u0590-\u05FF]/.test(text);
}

function TaskList({ tasks, completed = false }) {
  return (
    <div className="space-y-1.5">
      {tasks.map((task, i) => {
        const dir = isHebrew(task) ? 'rtl' : 'ltr';
        return (
          <div
            key={i}
            className="flex items-start gap-2 text-sm"
            style={{ direction: dir }}
          >
            <div className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center flex-shrink-0 ${
              completed
                ? 'bg-green-500/20 text-green-400'
                : 'bg-white/10 text-white/30'
            }`}>
              {completed ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
              )}
            </div>
            <span className={completed ? 'text-white/40 line-through' : 'text-white/70'}>
              {task}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default TaskList;
