using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using DNA_API1.Models;
using DNA_API1.Repository;
using Microsoft.EntityFrameworkCore;

namespace DNA_Blood_API.Repository
{
    public class ShiftAssignmentRepository : IRepository<ShiftAssignment>
    {
        private readonly BloodlineDnaContext _context;
        public ShiftAssignmentRepository(BloodlineDnaContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<ShiftAssignment>> GetAllAsync()
        {
            return await _context.ShiftAssignments.Include(sa => sa.User).Include(sa => sa.Shift).ToListAsync();
        }
        public async Task<ShiftAssignment> GetByIdAsync(int id)
        {
            return await _context.ShiftAssignments.Include(sa => sa.User).Include(sa => sa.Shift).FirstOrDefaultAsync(sa => sa.AssignmentId == id);
        }
        public async Task<ShiftAssignment> AddAsync(ShiftAssignment entity)
        {
            _context.ShiftAssignments.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }
        public async Task<ShiftAssignment> UpdateAsync(ShiftAssignment entity)
        {
            _context.ShiftAssignments.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }
        public async Task DeleteAsync(int id)
        {
            var sa = await _context.ShiftAssignments.FindAsync(id);
            if (sa != null)
            {
                _context.ShiftAssignments.Remove(sa);
                await _context.SaveChangesAsync();
            }
        }
        public async Task<IEnumerable<ShiftAssignment>> FindAsync(Expression<Func<ShiftAssignment, bool>> predicate)
        {
            return await _context.ShiftAssignments.Where(predicate).ToListAsync();
        }
        public async Task<bool> ExistsAsync(Expression<Func<ShiftAssignment, bool>> predicate)
        {
            return await _context.ShiftAssignments.AnyAsync(predicate);
        }
    }
} 