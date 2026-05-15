const ROLES = {
  EMPLOYEE: 'employee',
  APPROVER: 'approver',
  ADMIN: 'admin'
};

const VALID_ROLES = Object.values(ROLES);

const normalizeRole = (role) => {
  if (role === 'user') {
    return ROLES.EMPLOYEE;
  }

  return VALID_ROLES.includes(role) ? role : ROLES.EMPLOYEE;
};

const canReviewRequest = (user, request) => {
  if (!user || !request) {
    return false;
  }

  // Admin is governance-only: cannot approve/reject requests
  // Only the specifically assigned approver can review
  return (
    user.role === ROLES.APPROVER &&
    request.assignedTo?.toString() === user.id
  );
};

const analyticsRoles = [ROLES.APPROVER, ROLES.ADMIN];

module.exports = {
  ROLES,
  VALID_ROLES,
  analyticsRoles,
  canReviewRequest,
  normalizeRole
};
