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
    public class ProjectsController : ControllerBase
    {
        private readonly PlannerContext _context;

        public ProjectsController(PlannerContext context)
        {
            _context = context;
        }

        // GET: api/Projects
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
        {
          if (_context.Projects == null)
          {
              return NotFound();
          }
            return await _context.Projects.Include(p => p.Workers).AsNoTracking().ToListAsync();
        }

        // GET: api/Projects/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetProject(int id)
        {
          if (_context.Projects == null)
          {
              return NotFound();
          }
            var project = await _context.Projects.Include(p => p.Workers).FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound();
            }

            return project;
        }

        // GET: api/Projects/find/title
        [HttpGet("find/{title}")]
        public async Task<ActionResult<IEnumerable<Project>>> GetProject(string title)
        {
            if (_context.Projects == null)
            {
                return NotFound();
            }

            return await _context.Projects.Include(p => p.Workers).Where(p => p.Title.Contains(title)).ToListAsync();

        }

        // PUT: api/Projects/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProject(int id, Project project)
        {
            if (id != project.Id)
            {
                return BadRequest();
            }

            Project projectDB = await _context.Projects.Include(p => p.Workers).FirstOrDefaultAsync(p => p.Id == project.Id);
            projectDB!.Title = project.Title;
            projectDB.Description = project.Description;   

            // Удаление работников, которые существуют в projectDB, но нет в списке работников project
            projectDB.Workers!.Where(worker => !project.Workers!.Any(w => w.Id == worker.Id)).ToList().ForEach(worker => projectDB.Workers!.Remove(worker));

            // Добавление работников, которые есть в новом списке project, но не существуют в projectDB
            List<Worker> newWorkers = project.Workers!.Where(worker => !projectDB.Workers!.Any(w => w.Id == worker.Id)).ToList();
            foreach (Worker worker in newWorkers)
            {
                projectDB.Workers!.Add(_context.Workers!.FirstOrDefault(w => w.Id == worker.Id));

            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProjectExists(id))
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

        // POST: api/Projects
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Project>> PostProject(Project project)
        {
          
          if (_context.Projects == null)
          {
              return Problem("Entity set 'PlannerContext.Projects'  is null.");
          }

            if (_context.Projects.FirstOrDefault(p => p.Title == project.Title ) != null)
            {
                return Problem("Данный проект уже существует");
            }

            Project projectDB = new Project { Title = project.Title, Description = project.Description };
            _context.Projects.Add(projectDB);
            foreach (Worker worker in project.Workers!)
            {
                Worker workerFromDb = _context.Workers.First(w => w.Id == worker.Id);
                workerFromDb.Projects!.Add(projectDB);
            }

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
        }

        // DELETE: api/Projects/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            if (_context.Projects == null)
            {
                return NotFound();
            }
            var project = await _context.Projects.FindAsync(id);
            if (project == null)
            {
                return NotFound();
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProjectExists(int id)
        {
            return (_context.Projects?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
