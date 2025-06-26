using DNA_API1.Models;
using DNA_API1.Repository;
using System;
using System.Threading.Tasks;

namespace DNA_API1.Services
{
    public interface IStaffAssignmentService
    {
        Task<(int medicalStaffId, int staffId)> AutoAssignStaffAndMedicalForOrderAsync(
            DateTime bookingDate,
            string serviceName,
            int medicalProcessingTime,
            int staffProcessingTime
        );
    }
} 