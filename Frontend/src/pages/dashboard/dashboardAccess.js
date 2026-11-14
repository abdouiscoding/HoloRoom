const rolePermissions = {
  ADMIN: ["overview", "users", "products", "ar", "marketing", "featured", "support", "logs", "orders"],
  PRODUCT_MANAGER: ["products", "ar"],
  MARKETING_MANAGER: ["marketing", "featured"],
  SUPPORT_MANAGER: ["support"],
  ORDERS_MANAGER: ["orders"],
  USER: [],
};

const defaultRoutes = {
  ADMIN: "/dashboard/overview",
  PRODUCT_MANAGER: "/dashboard/products",
  MARKETING_MANAGER: "/dashboard/marketing",
  SUPPORT_MANAGER: "/dashboard/support",
  ORDERS_MANAGER: "/dashboard/orders",
};

// Creational pattern — Factory: build a dashboard access profile from a verified role.
export const createDashboardAccess = (role) => {
  const permissions = rolePermissions[role] || [];

  return {
    permissions,
    defaultRoute: defaultRoutes[role] || null,
    canAccess: (page) => permissions.includes(page),
  };
};

export const isDashboardRole = (role) =>
  Object.prototype.hasOwnProperty.call(rolePermissions, role);
