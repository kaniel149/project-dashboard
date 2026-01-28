function MiniIcon({ projects, onExpand }) {
  const changesCount = projects.filter(p => p.uncommittedChanges > 0).length;
  const tasksCount = projects.reduce((acc, p) => acc + (p.remainingTasks?.length || 0), 0);

  return (
    <div
      onClick={onExpand}
      className="drag-region w-[65px] h-[65px] bg-glass rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all border border-glass-border shadow-xl"
    >
      <span className="text-2xl no-drag">📊</span>
      <div className="flex gap-1 mt-1 no-drag">
        {changesCount > 0 && (
          <span className="text-[10px] text-orange-400 font-bold bg-orange-500/20 px-1.5 rounded">
            {changesCount}
          </span>
        )}
        {tasksCount > 0 && (
          <span className="text-[10px] text-yellow-400 font-bold bg-yellow-500/20 px-1.5 rounded">
            {tasksCount}
          </span>
        )}
      </div>
    </div>
  );
}

export default MiniIcon;
