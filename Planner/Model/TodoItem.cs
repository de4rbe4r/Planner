namespace Planner.Model
{
    public class TodoItem
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public bool IsComplete { get; set; }
        public TodoItem(string name = "Новая задача")
        {
            Name = name;
        }
    }
}
