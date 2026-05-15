const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

// =====================================================
// GET USER NOTIFICATIONS
// =====================================================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error("Fetch Notifications Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =====================================================
// MARK ALL AS READ (MUST BE ABOVE /read/:id)
// =====================================================
router.put("/read-all", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Read-All Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =====================================================
// MARK ONE AS READ
// =====================================================
router.put("/read/:id", authMiddleware, async (req, res) => {
  try {
    // Check ID AND ensure it belongs to the logged-in user
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (err) {
    console.error("Read Single Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;