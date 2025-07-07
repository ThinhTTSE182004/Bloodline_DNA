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