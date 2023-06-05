namespace Planner.Model
{
    public class Worker
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Sename { get; set; }
        public string? Position { get; set; }
        public List<ProjectTask>? ProjectTasks { get; set; } = new List<ProjectTask>();
        public List<Project>? Projects { get; set; } = new List<Project>();
    }
}
