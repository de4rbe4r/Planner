using Microsoft.EntityFrameworkCore;

namespace Planner.Model
{
    public class PlannerContext : DbContext
    {
        public PlannerContext(DbContextOptions<PlannerContext> options) : base(options)
        {
            Database.EnsureCreated();
        }
        public DbSet<Worker> Workers { get; set; } = null!;
        public DbSet<ProjectTask> Tasks { get; set; } = null!;
        public DbSet<Project> Projects { get; set; } = null!;
        }
    }
