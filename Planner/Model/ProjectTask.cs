namespace Planner.Model
{
    public class ProjectTask
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; } 
        public DateTime CreatedDate { get; set; }
        public bool IsCompleted { get; set; }
        public int ProjectId { get; set; }
        public Project? Project { get; set; }
        public List<Worker>? Workers { get; set; } = new List<Worker>();
    }
}
