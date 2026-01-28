function ProjectExpanded({ project, onClose }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
      <button onClick={onClose} className="text-white">✕</button>
      <span className="text-white">{project.name}</span>
    </div>
  );
}
export default ProjectExpanded;
