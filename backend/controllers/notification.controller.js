const Notification = require('../models/notification.model');

// Get notifications
exports.getNotifications = async (req, res) => {
  try {
    const User = require('../models/user.model');
    const currentUser = await User.findById(req.userId);
    
    const notifications = await Notification.find({ user: req.userId })
      .populate('from', 'username fullName avatar')
      .populate('post', 'images')
      .sort({ createdAt: -1 })
      .limit(50);

    const formattedNotifications = notifications.map(notif => {
      const isFollowing = notif.from && currentUser.following.includes(notif.from._id.toString());
      
      return {
        id: notif._id,
        type: notif.type,
        user: {
          username: notif.from?.username || 'Unknown',
          fullName: notif.from?.fullName || 'Unknown User',
          avatar: notif.from?.avatar || 'https://via.placeholder.com/100',
          isFollowing: isFollowing
        },
        from: notif.from?._id,
        postId: notif.post?._id,
        text: notif.text,
        postImage: notif.post?.images?.[0],
        time: notif.createdAt,
        read: notif.read
      };
    });

    res.json(formattedNotifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.userId, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};
