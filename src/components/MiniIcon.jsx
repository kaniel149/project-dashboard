import React from 'react';

function MiniIcon({ projects, onExpand }) {
  const changesCount = projects.filter(p => p.uncommittedChanges > 0).length;

  return (
    <div
      onClick={onExpand}
      className="w-[60px] h-[60px] bg-glass rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-glass-light transition-all border border-white/10"
    >
      <span className="text-2xl">📊</span>
      {changesCount > 0 && (
        <span className="text-xs text-yellow-400 font-bold">{changesCount}</span>
      )}
    </div>
  );
}

export default MiniIcon;
