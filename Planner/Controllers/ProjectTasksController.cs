using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Planner.Model;

namespace Planner.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectTasksController : ControllerBase
    {
        private readonly PlannerContext _context;

        public ProjectTasksController(PlannerContext context)
        {
            _context = context;
        }

        // GET: api/ProjectTasks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectTask>>> GetTasks()
        {
          if (_context.Tasks == null)
          {
              return NotFound();
          }
            return await _context.Tasks.Include(p => p.Project).Include(p => p.Workers).ToListAsync();
        }

        // GET: api/ProjectTasks/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectTask>> GetProjectTask(int id)
        {
          if (_context.Tasks == null)
          {
              return NotFound();
          }
            var projectTask = await _context.Tasks.Include(p => p.Workers).Include(p => p.Project).FirstOrDefaultAsync(p => p.Id == id);

            if (projectTask == null)
            {
                return NotFound();
            }

            return projectTask;
        }

        // GET: api/ProjectTasks/projectId/5
        [HttpGet("byProjectId/{id}")]
        public async Task<ActionResult<IEnumerable<ProjectTask>>> GetProjectTasks(int id)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            var projectTasks = await _context.Tasks.Include(p => p.Workers).Where(p => p.ProjectId == id).ToListAsync();

            if (projectTasks == null)
            {
                return NotFound();
            }

            return projectTasks;
        }

        // PUT: api/ProjectTasks/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProjectTask(int id, ProjectTask projectTask)
        {
            if (id != projectTask.Id)
            {
                return BadRequest();
            }

            ProjectTask projectTaskDB = await _context.Tasks.Include(p => p.Workers).FirstOrDefaultAsync(p => p.Id == projectTask.Id);
            projectTaskDB!.Title = projectTask.Title;
            projectTaskDB.Description = projectTask.Description;
            projectTaskDB.IsCompleted = projectTask.IsCompleted;

            // Удаление работников, которые существуют в projectDB, но нет в списке работников project
            projectTaskDB.Workers!.Where(worker => !projectTask.Workers!.Any(w => w.Id == worker.Id)).ToList().ForEach(worker => projectTaskDB.Workers!.Remove(worker));

            // Добавление работников, которые есть в новом списке project, но не существуют в projectDB
            List<Worker> newWorkers = projectTask.Workers!.Where(worker => !projectTaskDB.Workers!.Any(w => w.Id == worker.Id)).ToList();
            foreach (Worker worker in newWorkers)
            {
                projectTaskDB.Workers!.Add(_context.Workers!.FirstOrDefault(w => w.Id == worker.Id));

            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProjectTaskExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // GET: api/ProjectTasks/find/title
        [HttpGet("find/{title}")]
        public async Task<ActionResult<IEnumerable<ProjectTask>>> GetProjectTask(string title)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }

            return await _context.Tasks.Include(p => p.Workers).Where(p => p.Title!.Contains(title)).ToListAsync();

        }

        // POST: api/ProjectTasks
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<ProjectTask>> PostProjectTask(ProjectTask projectTask)
        {
          if (_context.Tasks == null)
          {
              return Problem("Entity set 'PlannerContext.Tasks'  is null.");
          }
            Project project = await _context.Projects.FirstAsync(p => p.Id == projectTask.ProjectId);
            ProjectTask projectTaskDB = new ProjectTask { Title = projectTask.Title, Description = projectTask.Description, CreatedDate = DateTime.Now, ProjectId = project.Id, Project = project};
            _context.Tasks.Add(projectTaskDB);

            foreach (Worker worker in projectTask.Workers!)
            {
                Worker workerFromDb = _context.Workers.First(w => w.Id == worker.Id);
                workerFromDb.ProjectTasks!.Add(projectTaskDB);
            }

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProjectTask), new { id = projectTask.Id }, projectTask);
        }

        // DELETE: api/ProjectTasks/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProjectTask(int id)
        {
            if (_context.Tasks == null)
            {
                return NotFound();
            }
            var projectTask = await _context.Tasks.FindAsync(id);
            if (projectTask == null)
            {
                return NotFound();
            }

            _context.Tasks.Remove(projectTask);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProjectTaskExists(int id)
        {
            return (_context.Tasks?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
