import * as signalR from '@microsoft/signalr';

class SignalRService {
    constructor() {
        this.connection = null;
        this.hubUrl = 'https://localhost:7113/userHub';
        this.isConnecting = false;
        this.profileUpdateCallback = null;
        this.eventCallbacks = {}; // Sửa thành object chứa mảng callback
    }

    async startConnection() {
        console.log('[SignalR] startConnection called');
        if (this.isConnecting) {
            console.log('[SignalR] Đang trong quá trình kết nối...');
            return;
        }
        if (this.connection &&
            (this.connection.state === signalR.HubConnectionState.Connected ||
             this.connection.state === signalR.HubConnectionState.Connecting)) {
            console.log('[SignalR] Đã kết nối hoặc đang kết nối');
            return;
        }
        try {
            this.isConnecting = true;
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(this.hubUrl, {
                    accessTokenFactory: () => {
                        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
                        console.log('[SignalR] accessTokenFactory called, token:', token);
                        return token;
                    },
                    skipNegotiation: true,
                    transport: signalR.HttpTransportType.WebSockets
                })
                .withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
                .build();

            this.connection.onreconnecting((error) => {
                console.log('[SignalR] Reconnecting to SignalR...', error);
            });

            this.connection.onreconnected((connectionId) => {
    console.log('[SignalR] Reconnected to SignalR with connectionId:', connectionId);
    this.joinUserGroup();
    Object.entries(this.eventCallbacks).forEach(([eventName, callbacks]) => {
        callbacks.forEach(callback => {
            this.connection.off(eventName, callback);
            this.connection.on(eventName, callback);
        });
    });
    if (this.profileUpdateCallback) {
        this.connection.off('UserProfileUpdated');
        this.connection.on('UserProfileUpdated', this.profileUpdateCallback);
    }
});

            this.connection.onclose((error) => {
                console.log('[SignalR] SignalR connection closed:', error);
                this.isConnecting = false;
            });

            await this.connection.start();
            console.log('[SignalR] Connected!');
            if (this.connection.state === signalR.HubConnectionState.Connected) {
                await this.joinUserGroup();
            } else {
                const checkInterval = setInterval(async () => {
                    if (this.connection.state === signalR.HubConnectionState.Connected) {
                        clearInterval(checkInterval);
                        await this.joinUserGroup();
                    }
                }, 100);
            }
            Object.entries(this.eventCallbacks).forEach(([eventName, callbacks]) => {
    callbacks.forEach(callback => {
        this.connection.off(eventName, callback);
        this.connection.on(eventName, callback);
    });
});
            if (this.profileUpdateCallback) {
                this.connection.off('UserProfileUpdated');
                this.connection.on('UserProfileUpdated', this.profileUpdateCallback);
            }
        } catch (err) {
            console.error('[SignalR] Connection Error: ', err);
            this.isConnecting = false;
            throw err;
        } finally {
            this.isConnecting = false;
        }
    }

    async joinUserGroup() {
        if (!this.connection) {
            console.log('[SignalR] Không có connection để join group');
            return;
        }
        console.log('[SignalR] Trạng thái connection:', this.connection.state);
        if (this.connection.state !== signalR.HubConnectionState.Connected) {
            console.log('[SignalR] Không thể join group: Connection chưa Connected');
            return;
        }
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            if (token) {
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                const userId = tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
                console.log('[SignalR] userId FE join group:', userId);
                if (userId) {
                    await this.connection.invoke('JoinUserGroup', parseInt(userId));
                    console.log('[SignalR] Đã join user group:', userId);
                }
            }
        } catch (err) {
            console.error('[SignalR] Lỗi khi join user group:', err);
        }
    }

    async stopConnection() {
        console.log('[SignalR] stopConnection called');
        if (!this.connection) {
            console.log('[SignalR] Không có connection để ngắt');
            return;
        }
        if (this.connection.state !== signalR.HubConnectionState.Connected &&
            this.connection.state !== signalR.HubConnectionState.Connecting) {
            console.log('[SignalR] Connection không ở trạng thái Connected hoặc Connecting');
            return;
        }
        try {
            if (this.connection.state === signalR.HubConnectionState.Connected) {
                const token = sessionStorage.getItem('token') || localStorage.getItem('token');
                if (token) {
                    const tokenData = JSON.parse(atob(token.split('.')[1]));
                    const userId = tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
                    if (userId) {
                        try {
                            await this.connection.invoke('LeaveUserGroup', parseInt(userId));
                            console.log('[SignalR] Left user group:', userId);
                        } catch (err) {
                            console.warn('[SignalR] LeaveUserGroup failed (may be disconnecting):', err);
                        }
                    }
                }
            }
            await this.connection.stop();
            console.log('[SignalR] Đã ngắt kết nối!');
        } catch (err) {
            console.error('[SignalR] Disconnection Error: ', err);
        } finally {
            this.connection = null;
            this.isConnecting = false;
        }
    }

    onUserProfileUpdate(callback) {
        this.profileUpdateCallback = callback;
        if (this.connection) {
            this.connection.off('UserProfileUpdated');
            this.connection.on('UserProfileUpdated', callback);
        }
    }

    offUserProfileUpdate() {
        this.profileUpdateCallback = null;
        if (this.connection) {
            this.connection.off('UserProfileUpdated');
        }
    }

    on(eventName, callback) {
        console.log('[SignalR] Registering event:', eventName, callback);
        if (!this.eventCallbacks[eventName]) this.eventCallbacks[eventName] = [];
        if (!this.eventCallbacks[eventName].includes(callback)) {
            this.eventCallbacks[eventName].push(callback);
            if (this.connection) {
                this.connection.on(eventName, callback);
            } else {
                this.startConnection().then(() => {
                    this.connection.on(eventName, callback);
                });
            }
        }
    }

    off(eventName, callback) {
        console.log('[SignalR] Unregistering event:', eventName, callback);
        if (this.eventCallbacks[eventName]) {
            this.eventCallbacks[eventName] = this.eventCallbacks[eventName].filter(cb => cb !== callback);
            if (this.eventCallbacks[eventName].length === 0) {
                delete this.eventCallbacks[eventName];
            }
        }
        if (this.connection) {
            this.connection.off(eventName, callback);
        }
    }

    async joinAdminGroup() {
        if (!this.connection) return;
        if (this.connection.state !== signalR.HubConnectionState.Connected) return;
        try {
            await this.connection.invoke('JoinAdminGroup');
            console.log('[SignalR] Admin joined Admin group');
        } catch (err) {
            console.error('[SignalR] Error joining Admin group:', err);
        }
    }
}

export default new SignalRService(); 