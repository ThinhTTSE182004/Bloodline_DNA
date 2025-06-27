using System;
using System.Linq;
using System.Threading.Tasks;
using DNA_API1.Models;
using DNA_Blood_API.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace DNA_Blood_API.Repository
{
    public class DashboardRepository : IDashboardRepository
    {
        private readonly BloodlineDnaContext _context;
        public DashboardRepository(BloodlineDnaContext context)
        {
            _context = context;
        }

        public async Task<AdminDashboardResultDTO> GetDashboardStatsAsync(DateTime? from, DateTime? to)
        {
            var orders = _context.Orders.AsQueryable();
            var payments = _context.Payments.AsQueryable();
            var orderDetails = _context.OrderDetails.Include(od => od.ServicePackage).Include(od => od.Order).AsQueryable();
            var feedbacks = _context.Feedbacks.AsQueryable();

            if (from.HasValue)
            {
                orders = orders.Where(o => o.CreateAt >= from.Value);
                payments = payments.Where(p => p.PaymentDate >= from.Value);
                orderDetails = orderDetails.Where(od => od.Order.CreateAt >= from.Value);
                feedbacks = feedbacks.Where(f => f.CreateAt >= from.Value);
            }
            if (to.HasValue)
            {
                orders = orders.Where(o => o.CreateAt <= to.Value);
                payments = payments.Where(p => p.PaymentDate <= to.Value);
                orderDetails = orderDetails.Where(od => od.Order.CreateAt <= to.Value);
                feedbacks = feedbacks.Where(f => f.CreateAt <= to.Value);
            }

            var totalRevenue = await payments.SumAsync(p => (decimal?)p.Total) ?? 0;
            var totalOrders = await orders.CountAsync();
            var mostUsedService = await orderDetails
                .GroupBy(od => od.ServicePackage.ServiceName)
                .OrderByDescending(g => g.Count())
                .Select(g => g.Key)
                .FirstOrDefaultAsync() ?? string.Empty;
            var avgSatisfaction = await feedbacks.AverageAsync(f => (double?)f.Rating) ?? 0;

            return new AdminDashboardResultDTO
            {
                TotalRevenue = totalRevenue,
                TotalOrders = totalOrders,
                MostUsedService = mostUsedService,
                AverageSatisfaction = avgSatisfaction
            };
        }
    }
} 