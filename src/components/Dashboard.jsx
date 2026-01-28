import React, { useState } from 'react';
import ProjectCard from './ProjectCard';
import ProjectExpanded from './ProjectExpanded';

function Dashboard({ projects, onCollapse }) {
  const [expandedProject, setExpandedProject] = useState(null);

  return (
    <div className="w-[380px] h-[500px] bg-glass rounded-2xl border border-white/10 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h1 className="text-white font-semibold flex items-center gap-2">
          <span>📊</span> Projects
        </h1>
        <div className="flex gap-2">
          <button
            onClick={onCollapse}
            className="text-white/60 hover:text-white transition-colors"
          >
            −
          </button>
        </div>
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {expandedProject ? (
          <ProjectExpanded
            project={expandedProject}
            onClose={() => setExpandedProject(null)}
          />
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project.path}
              project={project}
              onClick={() => setExpandedProject(project)}
            />
          ))
        )}

        {projects.length === 0 && (
          <div className="text-white/50 text-center py-8">
            סורק פרויקטים...
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
