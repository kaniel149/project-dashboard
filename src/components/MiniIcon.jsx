function MiniIcon({ projects, onExpand }) {
  const changesCount = projects.filter(p => p.uncommittedChanges > 0).length;
  const tasksCount = projects.reduce((acc, p) => acc + (p.remainingTasks?.length || 0), 0);
  const hasAlerts = changesCount > 0 || tasksCount > 0;

  return (
    <div
      onClick={onExpand}
      className="drag-region w-[70px] h-[70px] bg-glass rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all border border-glass-border shadow-2xl relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-50"></div>

      {/* Icon */}
      <div className="no-drag relative z-10 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
        P
      </div>

      {/* Badges */}
      {hasAlerts && (
        <div className="no-drag flex gap-1 mt-1.5 relative z-10">
          {changesCount > 0 && (
            <div className="text-[10px] text-orange-300 font-semibold bg-orange-500/30 px-1.5 py-0.5 rounded-md min-w-[18px] text-center">
              {changesCount}
            </div>
          )}
          {tasksCount > 0 && (
            <div className="text-[10px] text-yellow-300 font-semibold bg-yellow-500/30 px-1.5 py-0.5 rounded-md min-w-[18px] text-center">
              {tasksCount}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MiniIcon;
