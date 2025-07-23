using Microsoft.AspNetCore.SignalR;

namespace DNA_API1.Hubs
{
    public class UserHub : Hub
    {
        public async Task JoinUserGroup(int userId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
        }

        public async Task LeaveUserGroup(int userId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User_{userId}");
        }
        public async Task JoinAdminGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admin");
        }

        // Method để gửi notification cho customer khi có kết quả mới
        public async Task SendResultNotification(int userId, string orderId, string message)
        {
            await Clients.Group($"User_{userId}").SendAsync("ReceiveResultNotification", orderId, message);
        }

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"[SignalR] New connection: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            Console.WriteLine($"[SignalR] Disconnected: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }
    }
} 