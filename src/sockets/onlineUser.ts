const onlineUsers = new Map<number, string>();

export function addOnlineUser(userId: number, socketId: string) {
    onlineUsers.set(userId, socketId);
}
export function removeOnlineUser(userId: number) {
    onlineUsers.delete(userId);
}
export function isUserOnline(userId: number): boolean {
    return onlineUsers.has(userId);
}
export function getOnlineUserIds(): number[] {
    return Array.from(onlineUsers.keys());
}
