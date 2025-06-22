using DNA_API1.Repository;
using DNA_API1.ViewModels;

namespace DNA_API1.Services
{
    public class StaffScheduleService : IStaffScheduleService
    {
        private readonly IStaffScheduleRepository _staffScheduleRepository;

        public StaffScheduleService(IStaffScheduleRepository staffScheduleRepository)
        {
            _staffScheduleRepository = staffScheduleRepository;
        }

        public async Task<StaffScheduleDTO?> GetStaffScheduleDetailAsync(int staffId, DateTime date)
        {
            return await _staffScheduleRepository.GetStaffScheduleDetailAsync(staffId, date);
        }

        public async Task<StaffScheduleDTO?> GetMedicalStaffScheduleDetailAsync(int medicalStaffId, DateTime date)
        {
            return await _staffScheduleRepository.GetMedicalStaffScheduleDetailAsync(medicalStaffId, date);
        }

        public async Task<List<TimeSlotDTO>> GetStaffBusyTimeSlotsWithDetailsAsync(int staffId, DateTime date)
        {
            return await _staffScheduleRepository.GetStaffBusyTimeSlotsWithDetailsAsync(staffId, date);
        }

        public async Task<List<TimeSlotDTO>> GetMedicalStaffBusyTimeSlotsWithDetailsAsync(int medicalStaffId, DateTime date)
        {
            return await _staffScheduleRepository.GetMedicalStaffBusyTimeSlotsWithDetailsAsync(medicalStaffId, date);
        }
    }
} 