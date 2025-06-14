using DNA_API1.Models;
using DNA_API1.ViewModels;

namespace DNA_API1.Repository
{
    public interface IOrderRepository
    {
        Task<TestType> GetTestTypeByNameAsync(string name);
        Task<SampleType> GetSampleTypeByNameAsync(string name);
        Task<CollectionMethod> GetCollectionMethodByNameAsync(string name);
        Task<int> CreateOrderWithDetailsAsync(
            Participant participant,
            Order order,
            List<OrderDetail> details,
            List<Sample> samples,
            Payment payment);
        Task<List<User>> GetAvailableMedicalStaffAsync(string specialization, int maxOrdersPerDay);
        Task<List<User>> GetAvailableStaffAsync(int maxOrdersPerDay);
        Task<int> GetStaffOrderCountAsync(int staffId, DateTime date);
        Task<ServicePackage> GetServicePackageByIdAsync(int servicePackageId);
    }
} 