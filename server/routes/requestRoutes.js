const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Request = require("../models/Request");
const User = require("../models/user");
const Notification = require("../models/Notification");

const {
  ROLES,
  analyticsRoles,
  canReviewRequest,
  normalizeRole
} = require("../utils/roles");

const router = express.Router();

const VALID_PRIORITIES = ["low", "medium", "high"];

// 🔹 POPULATE REQUEST
const populateRequest = (query) =>
  query
    .populate("createdBy", "name email role")
    .populate("assignedTo", "name email role")
    .populate("history.by", "name email role");

// 🔹 ASSIGNMENT RULES
const canAssignToRole = (actorRole, assigneeRole) => {
  if (actorRole === ROLES.EMPLOYEE) return assigneeRole === ROLES.APPROVER;
  if (actorRole === ROLES.APPROVER) return assigneeRole === ROLES.EMPLOYEE;
  return false;
};

// 🔹 VIEW RULES
const canViewRequest = (user, request) => {
  if (user.role === ROLES.ADMIN) return true;
  const isCreator = request.createdBy?.toString() === user.id;
  const isAssignee = request.assignedTo?.toString() === user.id;
  if (user.role === ROLES.EMPLOYEE) return isCreator;
  return isCreator || isAssignee;
};

// =====================================================
// CREATE REQUEST / TASK
// =====================================================
router.post("/create", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === ROLES.ADMIN) {
      return res.status(403).json({ message: "Administrators cannot create operational tasks." });
    }

    const { title, description, assignedTo, priority, deadline } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Title is required." });
    }

    let resolvedAssignee = assignedTo;

    if (!resolvedAssignee && req.user.role === ROLES.EMPLOYEE) {
      const approver = await User.findOne({ role: ROLES.APPROVER, isActive: true }).select("_id");
      if (!approver) return res.status(400).json({ message: "No approver available." });
      resolvedAssignee = approver._id;
    }

    if (!resolvedAssignee) return res.status(400).json({ message: "Assignee is required." });

    const assignee = await User.findById(resolvedAssignee).select("_id role");
    if (!assignee) return res.status(404).json({ message: "Assignee not found." });

    const assigneeRole = normalizeRole(assignee.role);

    if (!canAssignToRole(req.user.role, assigneeRole)) {
      return res.status(403).json({
        message: req.user.role === ROLES.EMPLOYEE
          ? "Requests must be sent to an approver."
          : "Tasks must be assigned to employees."
      });
    }

    const request = await Request.create({
      title: title.trim(),
      description,
      createdBy: req.user.id,
      assignedTo: resolvedAssignee,
      priority: VALID_PRIORITIES.includes(priority) ? priority : "medium",
      deadline: deadline || undefined
    });

    // =====================================================
    // NOTIFICATIONS
    // =====================================================

    // 🔹 TASK ASSIGNED
    if (req.user.role === ROLES.APPROVER) {
      await Notification.create({
        userId: resolvedAssignee,
        title: "New Task Assigned",
        message: `A new task was assigned: ${title}`,
        type: "info",
        link: `/dashboard?highlight=${request._id}` // <--- FLUID NOTIFICATION LINK
      });
    }

    // 🔹 EMPLOYEE REQUEST
    if (req.user.role === ROLES.EMPLOYEE) {
      await Notification.create({
        userId: resolvedAssignee,
        title: "New Employee Request",
        message: "A new employee request was submitted.",
        type: "warning",
        link: `/dashboard?highlight=${request._id}` // <--- FLUID NOTIFICATION LINK
      });
    }

    const populatedRequest = await populateRequest(Request.findById(request._id));
    return res.status(201).json(populatedRequest);

  } catch (err) {
    console.log("REQUEST ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

// =====================================================
// REVIEW REQUEST
// =====================================================
const reviewRequest = async (req, res, status) => {
  try {
    const { remark = "" } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) return res.status(404).json({ message: "Request not found" });
    if (!canReviewRequest(req.user, request)) return res.status(403).json({ message: "Not authorized" });
    if (request.status !== "pending") return res.status(409).json({ message: "Request already reviewed" });

    request.status = status;
    request.history.push({
      action: status,
      by: req.user.id,
      remark: remark.trim(),
      at: new Date()
    });

    await request.save();

    // =====================================================
    // DYNAMIC NOTIFICATION
    // =====================================================
    await Notification.create({
      userId: request.createdBy,
      title: status === "approved" ? "Request Approved" : "Request Rejected",
      message: status === "approved" ? "Your request has been approved." : "Your request has been rejected.",
      type: status === "approved" ? "success" : "error",
      link: `/dashboard?highlight=${request._id}` // <--- FLUID NOTIFICATION LINK
    });

    const populatedRequest = await populateRequest(Request.findById(request._id));
    return res.json(populatedRequest);

  } catch (err) {
    console.log(`${status.toUpperCase()} ERROR:`, err);
    return res.status(500).json({ error: err.message });
  }
};

router.put("/approve/:id", authMiddleware, (req, res) => { reviewRequest(req, res, "approved"); });
router.put("/reject/:id", authMiddleware, (req, res) => { reviewRequest(req, res, "rejected"); });

// =====================================================
// GET MY REQUESTS (Employee)
// =====================================================
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const requests = await populateRequest(
      Request.find({
        $or: [
          { createdBy: req.user.id },
          { assignedTo: req.user.id }
        ]
      }).sort({ createdAt: -1 })
    );
    res.json(requests);
  } catch (err) {
    console.error("Fetch My Requests Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =====================================================
// GET ASSIGNED REQUESTS (Approver)
// =====================================================
router.get("/assigned", authMiddleware, async (req, res) => {
  try {
    const requests = await populateRequest(
      Request.find({ assignedTo: req.user.id }).sort({ createdAt: -1 })
    );
    res.json(requests);
  } catch (err) {
    console.error("Fetch Assigned Requests Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =====================================================
// GET ALL REQUESTS (Admin)
// =====================================================
router.get("/all", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.APPROVER) {
      return res.status(403).json({ message: "Admin or Approver access required" });
    }
    const requests = await populateRequest(
      Request.find().sort({ createdAt: -1 })
    );
    res.json(requests);
  } catch (err) {
    console.error("Fetch All Requests Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =====================================================
// GET SPECIFIC REQUEST
// =====================================================
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const request = await populateRequest(Request.findById(req.params.id));
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (!canViewRequest(req.user, request)) {
      return res.status(403).json({ message: "Not authorized to view this request" });
    }
    res.json(request);
  } catch (err) {
    console.error("Fetch Request Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;