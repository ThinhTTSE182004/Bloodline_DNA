namespace DNA_Blood_API.ViewModels
{
    public class AdminDashboardResultDTO
    {
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public string MostUsedService { get; set; }
        public double AverageSatisfaction { get; set; }
    }
} 