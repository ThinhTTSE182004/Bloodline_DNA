using System.Collections.Generic;
using System.Threading.Tasks;
using DNA_API1.Models;
using DNA_API1.Repository;
using DNA_Blood_API.Services;
using DNA_API1.ViewModels;

namespace DNA_Blood_API.Services
{
    public class WorkShiftService : IWorkShiftService
    {
        private readonly IRepository<WorkShift> _workShiftRepository;
        public WorkShiftService(IRepository<WorkShift> workShiftRepository)
        {
            _workShiftRepository = workShiftRepository;
        }
        public async Task<IEnumerable<WorkShift>> GetAllAsync()
        {
            return await _workShiftRepository.GetAllAsync();
        }
        public async Task<WorkShift> GetByIdAsync(int id)
        {
            return await _workShiftRepository.GetByIdAsync(id);
        }
        public async Task<WorkShift> AddAsync(WorkShiftCreateOrUpdateDTO dto)
        {
            var entity = new WorkShift
            {
                ShiftName = dto.ShiftName,
                StartTime = TimeOnly.Parse(dto.StartTime),
                EndTime = TimeOnly.Parse(dto.EndTime),
                Description = dto.Description
            };
            return await _workShiftRepository.AddAsync(entity);
        }
        public async Task<WorkShift> UpdateAsync(int id, WorkShiftCreateOrUpdateDTO dto)
        {
            var entity = await _workShiftRepository.GetByIdAsync(id);
            if (entity == null) throw new System.Exception("WorkShift not found");
            entity.ShiftName = dto.ShiftName;
            entity.StartTime = TimeOnly.Parse(dto.StartTime);
            entity.EndTime = TimeOnly.Parse(dto.EndTime);
            entity.Description = dto.Description;
            return await _workShiftRepository.UpdateAsync(entity);
        }
        public async Task DeleteAsync(int id)
        {
            await _workShiftRepository.DeleteAsync(id);
        }
    }
} 