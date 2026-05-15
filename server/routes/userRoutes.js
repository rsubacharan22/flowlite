const express = require('express');
const bcrypt = require('bcryptjs');

const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/user');
const { ROLES, normalizeRole } = require('../utils/roles');

const router = express.Router();

// ── Existing: get assignable users for dropdowns ───────────────────────────────
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const assignableRoles = {
      [ROLES.EMPLOYEE]: [ROLES.APPROVER],
      [ROLES.APPROVER]: [ROLES.EMPLOYEE],
      [ROLES.ADMIN]: [ROLES.APPROVER, ROLES.EMPLOYEE]
    };

    const allowedRoles = assignableRoles[req.user.role] || [];

    const users = await User.find({
      _id: { $ne: req.user.id },
      isActive: { $ne: false }
    })
      .select('_id name email role')
      .sort({ name: 1 });

    const assignableUsers = users
      .map((user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: normalizeRole(user.role)
      }))
      .filter((user) => allowedRoles.includes(user.role));

    return res.json(assignableUsers);
  } catch (err) {
    console.log('USER FETCH ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ── Admin: list ALL users ──────────────────────────────────────────────────────
router.get('/admin/users', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const users = await User.find({})
      .select('_id name email role isActive createdAt')
      .sort({ createdAt: -1 });

    return res.json(
      users.map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: normalizeRole(u.role),
        isActive: u.isActive !== false,
        createdAt: u.createdAt
      }))
    );
  } catch (err) {
    console.log('ADMIN USER LIST ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ── Admin: create user ─────────────────────────────────────────────────────────
router.post('/admin/users', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const { name, email, password, role } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role: normalizeRole(role),
      isActive: true
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: normalizeRole(user.role),
      isActive: true,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.log('ADMIN CREATE USER ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ── Admin: update role ─────────────────────────────────────────────────────────
router.patch('/admin/users/:id/role', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot change your own role.' });
    }

    const { role } = req.body;
    const normalizedRole = normalizeRole(role);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: normalizedRole },
      { new: true }
    ).select('_id name email role isActive createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: normalizeRole(user.role),
      isActive: user.isActive !== false,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.log('ADMIN ROLE UPDATE ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ── Admin: toggle active status ────────────────────────────────────────────────
router.patch('/admin/users/:id/status', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot deactivate your own account.' });
    }

    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: Boolean(isActive) },
      { new: true }
    ).select('_id name email role isActive createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: normalizeRole(user.role),
      isActive: user.isActive !== false,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.log('ADMIN STATUS UPDATE ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ── Admin: delete user ─────────────────────────────────────────────────────────
router.delete('/admin/users/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.log('ADMIN DELETE USER ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ── Profile: update name / email ───────────────────────────────────────────────
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Name is required.' });
    }

    const updates = { name: name.trim() };
    if (email?.trim()) {
      const existing = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: req.user.id }
      });
      if (existing) {
        return res.status(400).json({ message: 'This email is already in use.' });
      }
      updates.email = email.toLowerCase().trim();
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true })
      .select('_id name email role');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: normalizeRole(user.role)
    });
  } catch (err) {
    console.log('PROFILE UPDATE ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ── Profile: change password ───────────────────────────────────────────────────
router.put('/profile/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.log('PASSWORD CHANGE ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
