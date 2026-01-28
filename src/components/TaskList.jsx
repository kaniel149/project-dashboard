// Detect if text is Hebrew
function isHebrew(text) {
  return /[\u0590-\u05FF]/.test(text);
}

function TaskList({ tasks, completed = false }) {
  return (
    <div className="space-y-2">
      {tasks.map((task, i) => {
        const dir = isHebrew(task) ? 'rtl' : 'ltr';
        return (
          <div
            key={i}
            className={`flex items-start gap-2 text-sm rounded-lg p-2 ${
              completed ? 'bg-green-500/5' : 'bg-white/5'
            }`}
            style={{ direction: dir }}
          >
            <span className={`mt-0.5 ${completed ? 'text-green-400' : 'text-white/30'}`}>
              {completed ? '✓' : '○'}
            </span>
            <span className={completed ? 'text-white/50 line-through' : 'text-white/80'}>
              {task}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default TaskList;
