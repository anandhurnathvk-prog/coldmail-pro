const PREFIX = "coldmail_";

export const Storage = {
  get(key) {
    try { const v = localStorage.getItem(PREFIX + key); return v ? JSON.parse(v) : null; } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch {}
  },
  remove(key) {
    try { localStorage.removeItem(PREFIX + key); } catch {}
  },
  getUsers() { return this.get("users") || {}; },
  setUsers(u) { this.set("users", u); },
  getHistory(uid) { return this.get(`history_${uid}`) || []; },
  setHistory(uid, h) { this.set(`history_${uid}`, h); },
  getSession() { return this.get("session"); },
  setSession(s) { this.set("session", s); },
  clearSession() { this.remove("session"); },
};
