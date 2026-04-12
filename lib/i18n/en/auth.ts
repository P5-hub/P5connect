export const auth = {
  login: {
    portalTitle: "P5 Partner Portal",
    portalDesc:
      "Welcome to the P5connect portal. Please sign in with your login number and password.",
    loginNr: "Login number",
    loginNrPlaceholder: "e.g. 2612400162",
    password: "Password",
    passwordPlaceholder: "Enter password",
    submit: "Log in",
    securityNote: "Your sign-in is encrypted and secure.",
    footerLine1: "© {year} P5connect. All rights reserved.",
    footerLine2: "Sony Partner Program Switzerland",
    legalImprint: "Legal notice",
    legalPrivacy: "Privacy policy",
    forgotPassword: "Forgot password?",
    error: {
      unknownLogin: "Unknown login number.",
      failed: "Login failed.",
      noEmail: "No email address is stored for this user.",
      invalidCredentials: "Invalid login credentials.",
    },
  },

  password: {
    pageTitle: "🔒 Change password",
    pageDescription:
      "Change the password for your currently signed-in account here.",
    securityTitle: "Security details",
    securityDescription:
      "After the change, you will be signed out automatically and must sign in again with the new password.",
    notesTitle: "Notes",
    noteMinLength: "Use at least 8 characters.",
    noteLoggedInOnly: "This page is only intended for signed-in users.",
    noteForgotPassword:
      "If you forgot your password, please use the “Forgot password” function on the login page.",
    newPassword: "New password",
    confirmPassword: "Confirm password",
    submit: "Change password",
    submitting: "⏳ Changing password...",
    successChanged: "Password changed successfully. You are being signed in again...",
    notLoggedIn: "You are not signed in.",
    errorMismatch: "The passwords do not match.",
    errorMinLength: "The password must be at least 8 characters long.",
  },

  reset: {
    title: "Set new password",
    loading: "Checking link...",
    newPassword: "New password",
    confirm: "Confirm password",
    submit: "Change password",
    requestNew: "Request a new reset link",
    invalidLink: "Reset link is invalid.",
    expired: "The reset link has expired or is invalid.",
    mismatch: "The passwords do not match.",
    short: "The password must be at least 8 characters long.",
    success: "Password set successfully.",
    requestTitle: "Reset password",
    requestDesc:
      "Please enter your login number. You will receive an email to reset your password.",
    mailSent:
      "If the user exists, an email to reset the password has been sent.",
    send: "Send reset email",
    backToLogin: "Back to login",
  },

  navigation: {
    changePassword: "Change password",
  },

  common: {
    save: "Save",
    cancel: "Cancel",
    show: "Show",
    hide: "Hide",
  },
} as const;