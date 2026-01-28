import { useState } from 'react';
import ProjectCard from './ProjectCard';
import ProjectExpanded from './ProjectExpanded';

function Dashboard({ projects, onCollapse }) {
  const [expandedProject, setExpandedProject] = useState(null);

  return (
    <div className="w-[420px] h-[550px] bg-glass rounded-2xl border border-glass-border flex flex-col overflow-hidden shadow-2xl">
      {/* Draggable Header */}
      <div className="drag-region flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
        <h1 className="text-white font-semibold flex items-center gap-3 text-lg">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm">
            P
          </div>
          <span>הפרויקטים שלי</span>
        </h1>
        <button
          onClick={onCollapse}
          className="no-drag w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all flex items-center justify-center text-lg"
        >
          –
        </button>
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {expandedProject ? (
          <ProjectExpanded
            project={expandedProject}
            onClose={() => setExpandedProject(null)}
          />
        ) : (
          <>
            {projects.length > 0 && (
              <div className="text-white/40 text-xs px-1 pb-2 border-b border-white/5 mb-3">
                {projects.length} פרויקטים פעילים
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
          <div className="text-white/50 text-center py-16 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
            </div>
            <div>סורק פרויקטים...</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
