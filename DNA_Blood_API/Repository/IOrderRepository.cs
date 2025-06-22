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
    Payment payment,
    List<SampleKit> sampleKits,
    List<(int StaffId, int MedicalStaffId)> sampleTransferInfos);
        Task<ServicePackage> GetServicePackageByIdAsync(int servicePackageId);
        Task<List<OrderHistoryDTO>> GetOrderHistoryByUserIdAsync(int userId);
        Task<IEnumerable<OrderDetailHistoryDTO>> GetOrderDetailsByOrderIdAsync(int orderId, int userId);
        // Cập nhật trạng thái Payment Status.
        Task<Order?> GetOrderWithNavigationByIdAsync(int orderId);
        Task UpdateOrderAsync(Order order);
        Task<List<Order>> GetOrdersWithNavigationAsync();
    }
} 