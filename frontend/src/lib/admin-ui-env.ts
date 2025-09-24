export const isAdminUiUsingCdn = (): boolean => {
  return process.env.ADMIN_UI_USE_CDN === "true";
};