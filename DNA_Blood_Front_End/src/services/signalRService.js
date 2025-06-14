import * as signalR from '@microsoft/signalr';

class SignalRService {
    constructor() {
        this.connection = null;
        this.hubUrl = 'https://localhost:7113/userHub';
        this.isConnecting = false;
    }

    async startConnection() {
        if (this.isConnecting) {
            console.log('Connection already in progress...');
            return;
        }

        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            console.log('Already connected to SignalR');
            return;
        }

        try {
            this.isConnecting = true;
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(this.hubUrl, {
                    accessTokenFactory: () => localStorage.getItem('token'),
                    skipNegotiation: true,
                    transport: signalR.HttpTransportType.WebSockets
                })
                .withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
                .build();

            this.connection.onreconnecting((error) => {
                console.log('Reconnecting to SignalR...', error);
            });

            this.connection.onreconnected((connectionId) => {
                console.log('Reconnected to SignalR with connectionId:', connectionId);
                this.joinUserGroup();
            });

            this.connection.onclose((error) => {
                console.log('SignalR connection closed:', error);
                this.isConnecting = false;
            });

            await this.connection.start();
            console.log('SignalR Connected!');
            await this.joinUserGroup();
        } catch (err) {
            console.error('SignalR Connection Error: ', err);
            this.isConnecting = false;
            throw err;
        } finally {
            this.isConnecting = false;
        }
    }

    async joinUserGroup() {
        if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
            console.log('Cannot join group: Connection not established');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (token) {
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                const userId = tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
                if (userId) {
                    await this.connection.invoke('JoinUserGroup', parseInt(userId));
                    console.log('Joined user group:', userId);
                }
            }
        } catch (err) {
            console.error('Error joining user group:', err);
        }
    }

    async stopConnection() {
        if (!this.connection) {
            console.log('No active connection to stop');
            return;
        }

        try {
            if (this.connection.state === signalR.HubConnectionState.Connected) {
                const token = localStorage.getItem('token');
                if (token) {
                    const tokenData = JSON.parse(atob(token.split('.')[1]));
                    const userId = tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
                    if (userId) {
                        await this.connection.invoke('LeaveUserGroup', parseInt(userId));
                    }
                }
            }
            await this.connection.stop();
            console.log('SignalR Disconnected!');
        } catch (err) {
            console.error('SignalR Disconnection Error: ', err);
        } finally {
            this.connection = null;
            this.isConnecting = false;
        }
    }

    onUserProfileUpdate(callback) {
        if (this.connection) {
            this.connection.on('UserProfileUpdated', (updatedProfile) => {
                console.log('Received profile update:', updatedProfile);
                callback(updatedProfile);
            });
        }
    }

    offUserProfileUpdate() {
        if (this.connection) {
            this.connection.off('UserProfileUpdated');
        }
    }
}

export default new SignalRService(); 