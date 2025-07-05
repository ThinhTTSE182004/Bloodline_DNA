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
     List<Participant> participants,
    Order order,
    List<OrderDetail> details,
    List<Sample> samples,
    Payment payment,
    List<SampleKit> sampleKits,
    List<(int StaffId, int MedicalStaffId)> sampleTransferInfos,
    Delivery? delivery = null,
    List<DeliveryTask>? deliveryTasks = null);
        Task<ServicePackage> GetServicePackageByIdAsync(int servicePackageId);
        Task<List<OrderHistoryDTO>> GetOrderHistoryByUserIdAsync(int userId);
        Task<IEnumerable<OrderDetailHistoryDTO>> GetOrderDetailsByOrderIdAsync(int orderId, int userId);
        // Cập nhật trạng thái Payment Status.
        Task<Order?> GetOrderWithNavigationByIdAsync(int orderId);
        Task UpdateOrderAsync(Order order);
        Task<List<Order>> GetOrdersWithNavigationAsync();
        Task<bool> OrderExistsForUserAsync(int orderId, int userId);
        Task<Order?> GetOrderByIdAndUserIdAsync(int orderId, int userId);
        Task<List<Order>> GetOrdersByPaymentStatusAsync(string paymentStatus);
        Task<List<Order>> GetAllOrdersAsync();
    }
} 