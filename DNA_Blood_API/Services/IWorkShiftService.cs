using System.Collections.Generic;
using System.Threading.Tasks;
using DNA_API1.Models;
using DNA_API1.Repository;
using DNA_API1.ViewModels;

namespace DNA_Blood_API.Services
{
    public interface IWorkShiftService
    {
        Task<IEnumerable<WorkShift>> GetAllAsync();
        Task<WorkShift> GetByIdAsync(int id);
        Task<WorkShift> AddAsync(WorkShiftCreateOrUpdateDTO dto);
        Task<WorkShift> UpdateAsync(int id, WorkShiftCreateOrUpdateDTO dto);
        Task DeleteAsync(int id);
    }
} 