using System;

namespace DNA_API1.ViewModels
{
    public class OrderDetailHistoryDTO
    {
        // 1. Thông tin đơn hàng
        public int OrderId { get; set; }
        public DateTime? CreateAt { get; set; }
        public string OrderStatus { get; set; } = null!;

        // 2. Thông tin dịch vụ xét nghiệm
        public string ServiceName { get; set; } = null!;
        public string TestType { get; set; } = null!;
        public string SampleType { get; set; } = null!;
        public decimal Price { get; set; }

        // 3. Thông tin người tham gia
        public string ParticipantName { get; set; } = null!;
        public string Sex { get; set; } = null!;
        public int? BirthYear { get; set; }
        public string Relationship { get; set; } = null!;
        public string? NameRelation { get; set; }

        // 4. Tiến trình mẫu
        public string CollectionMethod { get; set; } = null!;
        public DateOnly? CollectedDate { get; set; }
        public DateOnly? ReceivedDate { get; set; }
        public string SampleStatus { get; set; } = null!;

        // 5. Thông tin thanh toán
        public string PaymentMethod { get; set; } = null!;
        public string PaymentStatus { get; set; } = null!;
        public DateTime? PaymentDate { get; set; }
        public decimal Total { get; set; }

        // 6. Thông tin giao hàng
        public string? DeliveryAddress { get; set; }
        public string? DeliveryStatus { get; set; }
        public DateOnly? DeliveryDate { get; set; }
        public string? DeliveryNote { get; set; }

        // 7. Thông tin phân công giao hàng
        public int? AssignedStaffId { get; set; }
        public string? AssignedStaffName { get; set; }
        public DateTime? TaskAssignedAt { get; set; }
        public string? DeliveryTaskStatus { get; set; }
        public string? DeliveryTaskNote { get; set; }
        public DateOnly? TaskCompleteAt { get; set; }

        // 8. Kết quả xét nghiệm
        public string? ResultStatus { get; set; }
        public string? ResultFileUrl { get; set; }
    }
} 