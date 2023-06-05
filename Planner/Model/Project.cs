namespace Planner.Model
{
    public class Project
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public List<Worker>? Workers { get; set; } = new List<Worker>();
        public List<ProjectTask>? ProjectTasks { get; set; } = new List<ProjectTask>();

    }
}
