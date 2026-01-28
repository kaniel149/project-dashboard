import { useState } from 'react';
import ProjectCard from './ProjectCard';
import ProjectExpanded from './ProjectExpanded';

function Dashboard({ projects, onCollapse }) {
  const [expandedProject, setExpandedProject] = useState(null);

  return (
    <div className="w-[400px] h-[520px] bg-glass rounded-2xl border border-glass-border flex flex-col overflow-hidden shadow-2xl">
      {/* Draggable Header */}
      <div className="drag-region flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <h1 className="text-white font-semibold flex items-center gap-2 text-lg">
          <span>📊</span>
          <span>הפרויקטים שלי</span>
        </h1>
        <button
          onClick={onCollapse}
          className="no-drag w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all flex items-center justify-center"
        >
          −
        </button>
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {expandedProject ? (
          <ProjectExpanded
            project={expandedProject}
            onClose={() => setExpandedProject(null)}
          />
        ) : (
          <>
            {projects.length > 0 && (
              <div className="text-white/40 text-xs px-1 mb-1">
                {projects.length} פרויקטים • ממוינים לפי פעילות אחרונה
              </div>
            )}
            {projects.map((project) => (
              <ProjectCard
                key={project.path}
                project={project}
                onClick={() => setExpandedProject(project)}
              />
            ))}
          </>
        )}

        {projects.length === 0 && (
          <div className="text-white/50 text-center py-12 flex flex-col items-center gap-3">
            <div className="text-4xl">🔍</div>
            <div>סורק פרויקטים...</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
