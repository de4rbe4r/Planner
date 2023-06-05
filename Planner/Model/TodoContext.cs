using Microsoft.EntityFrameworkCore;
using Planner.Model;

namespace Planner.Model
{
    public class TodoContext : DbContext
    {
        public TodoContext(DbContextOptions<TodoContext> options)
        : base(options)
        {
            Database.EnsureCreated();
        }

        public DbSet<TodoItem> TodoItems { get; set; } = null!;
    }
}
