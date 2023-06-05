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
    public class WorkersController : ControllerBase
    {
        private readonly PlannerContext _context;

        public WorkersController(PlannerContext context)
        {
            _context = context;
        }

        // GET: api/Workers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Worker>>> GetWorkers()
        {
          if (_context.Workers == null)
          {
              return NotFound();
          }
            return await _context.Workers.Include(w => w.Projects).AsNoTracking().ToListAsync();
        }
        // GET: api/Workers/5

        [HttpGet("{id}")]
        public async Task<ActionResult<Worker>> GetWorker(int id)
        {
            if (_context.Workers == null)
            {
                return NotFound();
            }
            var worker = await _context.Workers.Include(w => w.Projects).FirstOrDefaultAsync(w => w.Id == id);

            if (worker == null)
            {
                return NotFound();
            }

            return worker;
        }

        // GET: api/Workers/find/name/sename/position
        [HttpGet("find/{queryString}")]
        public async Task<ActionResult<IEnumerable<Worker>>> GetWorker(string queryString)
        {
          if (_context.Workers == null)
          {
              return NotFound();
          }
            var values = queryString.Split(',');
            string caseType = "";
            if (values[0] != "") caseType += "name;";
            if (values[1] != "") caseType += "sename;";
            if (values[2] != "") caseType += "position;";

            switch (caseType)
            {
                case "name;":
                    return await _context.Workers.Include(w => w.Projects).Where(w => w.Name!.Contains(values[0])).ToListAsync();
                case "sename;":
                    return await _context.Workers.Include(w => w.Projects).Where(w => w.Sename!.Contains(values[1])).ToListAsync();
                case "position;":
                    return await _context.Workers.Include(w => w.Projects).Where(w => w.Position!.Contains(values[2])).ToListAsync();
                case "name;sename;":
                    return await _context.Workers.Include(w => w.Projects).Where(w => w.Name!.Contains(values[0]) && w.Sename!.Contains(values[1])).ToListAsync();
                case "name;position;":
                    return await _context.Workers.Include(w => w.Projects).Where(w => w.Name!.Contains(values[0]) && w.Position!.Contains(values[2])).ToListAsync();
                case "sename;position;":
                    return await _context.Workers.Include(w => w.Projects).Where(w => w.Sename!.Contains(values[1]) && w.Position!.Contains(values[2])).ToListAsync();
                case "name;sename;position;":
                    return await _context.Workers.Include(w => w.Projects).Where(w => w.Name!.Contains(values[0]) && w.Sename!.Contains(values[1]) && w.Position!.Contains(values[2])).ToListAsync();
                default:
                    return NotFound();
            }
        }

        // PUT: api/Workers/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]

        public async Task<IActionResult> PutWorker(int id, Worker worker)
        {
            if (id != worker.Id)
            {
                return BadRequest();
            }

            _context.Entry(worker).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WorkerExists(id))
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

        // POST: api/Workers
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Worker>> PostWorker(Worker worker)
        {
          if (_context.Workers == null)
          {
              return Problem("Entity set 'PlannerContext.Workers'  is null.");
          }
            if (_context.Workers.FirstOrDefault(w => w.Name == worker.Name && w.Sename == worker.Sename && w.Position == worker.Position) != null)
            {
                return Problem("Данный работник уже существует");
            }

            _context.Workers.Add(worker);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetWorker), new { id = worker.Id }, worker);
        }

        // DELETE: api/Workers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorker(int id)
        {
            if (_context.Workers == null)
            {
                return NotFound();
            }
            var worker = await _context.Workers.FindAsync(id);
            if (worker == null)
            {
                return NotFound();
            }

            _context.Workers.Remove(worker);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool WorkerExists(int id)
        {
            return (_context.Workers?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
