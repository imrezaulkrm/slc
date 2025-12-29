// Temporary in-memory notification system
const notifications = [];

module.exports = {
  sendNotification(toUserIds, message) {
    toUserIds.forEach(id => {
      notifications.push({ userId: id, message, createdAt: new Date() });
    });
  },
  getUserNotifications(userId) {
    return notifications.filter(n => n.userId === userId);
  }
};
