export const adminAccount = {
  button: "🔐 Login / Password",
  modalTitle: "Change login / password",
  currentLogin: "Current login / login no. *",
  currentLoginPlaceholder: "e.g. VAdminP5 or dealer login no.",
  newLogin: "New login (optional)",
  newLoginPlaceholder: "Leave empty if login should remain unchanged",
  newLoginHint: "Allowed: letters, numbers, “-”, “_”.",
  newPassword: "New password *",
  newPasswordPlaceholder: "At least 6 characters",
  generatePassword: "Generate random password",
  passwordGenerated: "Random password generated.",
  passwordGeneratedCopied: "Random password generated and copied.",
  loginRequired: "Login / login no. is required.",
  passwordMinLength: "The new password must be at least 6 characters long.",
  invalidLoginFormat:
    "New login may only contain letters, numbers, '-' and '_'.",
  updateFailed: "Unknown error while updating.",
  requestFailed: "Error while sending request.",
  successDefault: "Access updated successfully.",
  successLogin: "Login updated successfully.",
  successPassword: "Password updated successfully.",
  successLoginAndPassword: "Login and password updated successfully.",
  reloginNow: "You will now be signed in again...",
  logoutRunning: "Signing out...",
  confirmTitle: "Confirm change",
  confirmLoginChange:
    'You are changing the login from "{old}" to "{new}". Continue?',
  confirmPasswordChange:
    "You are setting a new password. Continue?",
  confirmLoginAndPasswordChange:
    'You are changing the login from "{old}" to "{new}" and also setting a new password. Continue?',
} as const;