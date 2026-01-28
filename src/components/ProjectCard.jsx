function ProjectCard({ project, onClick }) {
  return (
    <div onClick={onClick} className="bg-white/5 rounded-xl p-3 cursor-pointer hover:bg-white/10 border border-white/5">
      <span className="text-white">{project.name}</span>
    </div>
  );
}
export default ProjectCard;
