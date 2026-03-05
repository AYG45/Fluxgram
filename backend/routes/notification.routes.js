const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const auth = require('../middleware/auth');

// GET /api/notifications - Get all notifications (protected)
router.get('/', auth, notificationController.getNotifications);

// PUT /api/notifications/:id/read - Mark notification as read (protected)
router.put('/:id/read', auth, notificationController.markAsRead);

// PUT /api/notifications/read/all - Mark all as read (protected)
router.put('/read/all', auth, notificationController.markAllAsRead);

module.exports = router;
