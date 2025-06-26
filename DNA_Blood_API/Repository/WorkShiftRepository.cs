using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using DNA_API1.Repository;
using DNA_API1.Models;
using Microsoft.EntityFrameworkCore;

namespace DNA_Blood_API.Repository
{
    public class WorkShiftRepository : IRepository<WorkShift>
    {
        private readonly BloodlineDnaContext _context;
        public WorkShiftRepository(BloodlineDnaContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<WorkShift>> GetAllAsync()
        {
            return await _context.WorkShifts.ToListAsync();
        }
        public async Task<WorkShift> GetByIdAsync(int id)
        {
            return await _context.WorkShifts.FindAsync(id);
        }
        public async Task<WorkShift> AddAsync(WorkShift entity)
        {
            _context.WorkShifts.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }
        public async Task<WorkShift> UpdateAsync(WorkShift entity)
        {
            _context.WorkShifts.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }
        public async Task DeleteAsync(int id)
        {
            var ws = await _context.WorkShifts.FindAsync(id);
            if (ws != null)
            {
                _context.WorkShifts.Remove(ws);
                await _context.SaveChangesAsync();
            }
        }
        public async Task<IEnumerable<WorkShift>> FindAsync(Expression<Func<WorkShift, bool>> predicate)
        {
            return await _context.WorkShifts.Where(predicate).ToListAsync();
        }
        public async Task<bool> ExistsAsync(Expression<Func<WorkShift, bool>> predicate)
        {
            return await _context.WorkShifts.AnyAsync(predicate);
        }
    }
} 