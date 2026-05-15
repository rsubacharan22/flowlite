export const ROLES = {
  EMPLOYEE: 'employee',
  APPROVER: 'approver',
  ADMIN: 'admin'
};

const VALID_ROLES = Object.values(ROLES);

export const normalizeRole = (role) => {
  if (role === 'user') {
    return ROLES.EMPLOYEE;
  }

  return VALID_ROLES.includes(role) ? role : ROLES.EMPLOYEE;
};

export const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      return null;
    }

    const parsedUser = JSON.parse(storedUser);
    const user = {
      ...parsedUser,
      role: normalizeRole(parsedUser?.role)
    };

    localStorage.setItem('user', JSON.stringify(user));

    return user;
  } catch (err) {
    localStorage.removeItem('user');
    return null;
  }
};

export const setSession = ({ token, user }) => {
  const normalizedUser = {
    ...user,
    role: normalizeRole(user?.role)
  };

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(normalizedUser));

  return normalizedUser;
};

export const updateStoredUser = (updates) => {
  try {
    const current = getStoredUser();
    if (!current) return null;
    const updated = { ...current, ...updates };
    localStorage.setItem('user', JSON.stringify(updated));
    return updated;
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const canReview = (user) => (
  user?.role === ROLES.APPROVER
);

export const canAccessAnalytics = (user) => (
  user?.role === ROLES.APPROVER || user?.role === ROLES.ADMIN
);

export const canManageUsers = (user) => user?.role === ROLES.ADMIN;
