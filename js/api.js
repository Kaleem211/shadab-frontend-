/* =========================================================
   API CLIENT — talks to the real backend (Node + Express +
   SQLite + Gmail) instead of localStorage for anything that
   needs to be real: accounts, email OTPs, orders, admin data.

   IMPORTANT: set API_BASE_URL below to your deployed backend's
   URL once it's live on Render, e.g.
     const API_BASE_URL = "https://shadab-backend.onrender.com/api";
   Until you do, auth/orders/admin will show a clear error
   instead of silently failing.
   ========================================================= */
(function () {
  "use strict";

  const API_BASE_URL = "https://shadab-backend.onrender.com/api";

  function getToken() {
    try { return localStorage.getItem("shadab_auth_token"); } catch (e) { return null; }
  }
  function setToken(t) {
    try {
      if (t) localStorage.setItem("shadab_auth_token", t);
      else localStorage.removeItem("shadab_auth_token");
    } catch (e) {}
  }

  async function request(path, { method = "GET", body, auth = false, admin = false } = {}) {
    if (API_BASE_URL.includes("PASTE_YOUR_RENDER_BACKEND_URL_HERE")) {
      throw new Error("Backend not connected yet — set API_BASE_URL in js/api.js to your deployed Render URL.");
    }
    const headers = { "Content-Type": "application/json" };
    if (auth) {
      const token = getToken();
      if (token) headers["Authorization"] = "Bearer " + token;
    }
    if (admin) {
      const adminPw = sessionStorage.getItem("shadab_admin_session_pw");
      if (adminPw) headers["X-Admin-Password"] = adminPw;
    }
    let res;
    try {
      res = await fetch(API_BASE_URL + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (networkErr) {
      throw new Error("Couldn't reach the server. Check your internet connection and try again.");
    }
    let data = {};
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) throw new Error(data.error || "Something went wrong.");
    return data;
  }

  window.ShadabAPI = {
    getToken, setToken,

    // Auth
    signup: (payload) => request("/auth/signup", { method: "POST", body: payload }),
    resendSignupOtp: (email) => request("/auth/signup/resend", { method: "POST", body: { email } }),
    verifySignup: (email, otp) => request("/auth/signup/verify", { method: "POST", body: { email, otp } }),
    login: (identifier, password) => request("/auth/login", { method: "POST", body: { identifier, password } }),
    forgotPassword: (email) => request("/auth/forgot-password", { method: "POST", body: { email } }),
    resendForgotOtp: (email) => request("/auth/forgot-password/resend", { method: "POST", body: { email } }),
    verifyForgotOtp: (email, otp) => request("/auth/forgot-password/verify", { method: "POST", body: { email, otp } }),
    resetPassword: (email, resetToken, newPassword) =>
      request("/auth/reset-password", { method: "POST", body: { email, resetToken, newPassword } }),
    me: () => request("/auth/me", { auth: true }),
    updateMe: (username) => request("/auth/me", { method: "PATCH", body: { username }, auth: true }),

    // Orders
    placeOrder: (order) => request("/orders", { method: "POST", body: order, auth: true }),
    myOrders: () => request("/orders/mine", { auth: true }),
    allOrders: () => request("/orders", { admin: true }),
    markDelivered: (id) => request(`/orders/${id}/deliver`, { method: "PATCH", admin: true }),
    clearAllOrders: () => request("/orders", { method: "DELETE", admin: true }),

    // Menu
    getMenuOverrides: () => request("/menu"),
    upsertMenuItem: (id, item) => request(`/menu/${id}`, { method: "PUT", body: item, admin: true }),
    deleteMenuItem: (id) => request(`/menu/${id}`, { method: "DELETE", admin: true }),
    restoreMenu: () => request("/menu", { method: "DELETE", admin: true }),

    // Settings
    getSettings: () => request("/settings"),
    updateSettings: (closingTime) => request("/settings", { method: "PUT", body: { closingTime }, admin: true }),
  };
})();
