using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace DNA_API1.Hubs
{
    public class UserHub : Hub
    {
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