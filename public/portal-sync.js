/* Online account for a Speaker's Gym client portal.
   The portal keeps its own state and rendering; this file adds login, saving to /api/portal,
   a read-only coach view, and the coach-set Week 6 mission. When the online store is not
   configured (or the page is served without the API), the portal keeps its browser-only behaviour.

   Usage from a portal:
     PortalSync.init({ client, storageKey, getState, replaceState, logo, logoutTarget, onChange });
     PortalSync.saved()   -> call after every local save
     PortalSync.isCoach() -> true in the coach view (do not save the student's data)
*/
(function () {
  "use strict";
  const sync = { mode: "starting", role: null, version: 0, updatedAt: null, coach: { missions: {} }, timer: null, saving: false, pending: false };
  let options = null;

  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  async function api(method, action, body) {
    const response = await fetch(`/api/portal?action=${action}&client=${encodeURIComponent(options.client)}`, {
      method, credentials: "same-origin",
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined
    });
    let json = {};
    try { json = await response.json(); } catch {}
    return { status: response.status, json };
  }

  function status(kind) {
    const el = document.querySelector(".ps-status");
    if (!el) return;
    el.dataset.kind = kind;
    el.textContent = { saving: "Saving…", saved: "Saved to your account", retry: "Not saved yet · trying again", coach: "Coach view · read only" }[kind] || "";
  }

  function toast(message) {
    const el = document.querySelector(".ps-toast") || document.body.appendChild(Object.assign(document.createElement("div"), { className: "ps-toast", role: "status" }));
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove("show"), 3200);
  }

  function changed() { options.onChange?.({ role: sync.role, coach: sync.coach, updatedAt: sync.updatedAt }); }

  async function push() {
    if (sync.mode !== "cloud" || sync.role !== "client") return;
    if (sync.saving) { sync.pending = true; return; }
    sync.saving = true; clearTimeout(sync.timer); sync.timer = null;
    try {
      const result = await api("PUT", "state", { version: sync.version, state: options.getState() });
      if (result.status === 200) { sync.version = result.json.version; sync.updatedAt = result.json.updatedAt; status("saved"); }
      else if (result.status === 409) { applyRemote(result.json.state, result.json.version); toast("Updated with newer progress from another device."); }
      else if (result.status === 401) showLogin("Please log in again to keep saving.");
      else throw new Error("save_failed");
    } catch { status("retry"); sync.timer = setTimeout(push, 8000); }
    finally { sync.saving = false; if (sync.pending) { sync.pending = false; push(); } }
  }

  function applyRemote(remote, version) {
    sync.version = version;
    options.replaceState(remote);
    if (sync.role === "client") { try { localStorage.setItem(options.storageKey, JSON.stringify(options.getState())); } catch {} }
    status(sync.role === "coach" ? "coach" : "saved");
    changed();
  }

  function startCloud(data) {
    sync.open = Boolean(data.open);
    sync.editor = sync.role === "coach" || (sync.open && localStorage.getItem("sgCoach") === "1");
    sync.mode = "cloud"; sync.role = data.role; sync.version = data.version || 0; sync.updatedAt = data.updatedAt; sync.coach = data.coach || { missions: {} };
    document.body.classList.remove("ps-locked");
    document.body.classList.add("ps-cloud");
    document.body.classList.toggle("ps-open", sync.open);
    document.body.classList.toggle("ps-coach", sync.role === "coach");
    document.getElementById("psLogin")?.remove();
    if (data.state) applyRemote(data.state, sync.version);
    else if (sync.role === "client") { push(); toast("Your progress is now saved to your account."); changed(); }
    else { options.replaceState(null); changed(); }
    status(sync.role === "coach" ? "coach" : "saved");
    document.querySelectorAll("[data-cloud-copy]").forEach(el => { el.textContent = el.dataset.cloudCopy; });
  }

  function showLogin(message = "") {
    document.body.classList.add("ps-locked");
    if (!document.getElementById("psLogin")) {
      document.body.insertAdjacentHTML("beforeend", `<div class="ps-login" id="psLogin" role="dialog" aria-modal="true" aria-labelledby="psLoginTitle"><form class="ps-login-card" id="psLoginForm">${options.logo ? `<img src="${esc(options.logo)}" alt="">` : ""}<small>THE SPEAKER'S GYM</small><h1 id="psLoginTitle">Welcome back.</h1><p>Enter your password to open your coaching space.</p><label>Password<input type="password" id="psPassword" autocomplete="current-password" required></label><p class="ps-error" id="psError" role="alert"></p><button type="submit">Open my space <span>→</span></button></form></div>`);
    }
    document.getElementById("psError").textContent = message;
    document.getElementById("psPassword").focus();
  }

  document.addEventListener("submit", async event => {
    if (event.target.id !== "psLoginForm") return;
    event.preventDefault();
    const button = event.target.querySelector("button");
    const error = document.getElementById("psError");
    button.disabled = true; error.textContent = "";
    try {
      const result = await api("POST", "login", { client: options.client, password: document.getElementById("psPassword").value });
      if (result.status === 200) { const data = await api("GET", "state"); if (data.status === 200) return startCloud(data.json); }
      error.textContent = result.status === 429 ? "Too many attempts. Please wait 15 minutes." : result.status === 401 ? "That password did not work. Please try again." : "Something went wrong. Please try again.";
    } catch { error.textContent = "We could not reach your account. Check your connection."; }
    button.disabled = false;
  });

  document.addEventListener("click", async event => {
    if (!event.target.closest("[data-ps-logout]")) return;
    try { await api("POST", "logout"); } catch {}
    try { localStorage.removeItem(options.storageKey); } catch {}
    location.reload();
  });

  // Pick up changes from another device when someone comes back to this tab.
  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState !== "visible" || sync.mode !== "cloud" || sync.saving || sync.timer) return;
    try {
      const result = await api("GET", "state");
      if (result.status !== 200) return;
      sync.coach = result.json.coach || sync.coach; sync.updatedAt = result.json.updatedAt;
      if (result.json.version !== sync.version && result.json.state) applyRemote(result.json.state, result.json.version);
      else changed();
    } catch {}
  });

  async function boot() {
    let result;
    try { result = await api("GET", "state"); } catch { result = { status: 0, json: {} }; }
    if (result.status === 200) return startCloud(result.json);
    if (result.status === 401) return showLogin();
    if ([404, 405, 503].includes(result.status)) { sync.mode = "local"; document.body.classList.remove("ps-locked"); return; }
    showLogin("We could not reach your account. Check your connection and try again.");
  }

  window.PortalSync = {
    init(config) {
      options = config;
      try {
        const flag = new URLSearchParams(location.search).get("coach");
        if (flag === "1") localStorage.setItem("sgCoach", "1");
        if (flag === "0") localStorage.removeItem("sgCoach");
      } catch {}
      document.body.classList.add("ps-locked");
      document.body.insertAdjacentHTML("afterbegin", `<div class="ps-coach-banner" role="status"><strong>Coach view.</strong> You are seeing this portal as the student sees it. Changes here are not saved.</div>`);
      document.body.insertAdjacentHTML("beforeend", `<div class="ps-status" aria-live="polite"></div>`);
      const target = config.logoutTarget && document.querySelector(config.logoutTarget);
      if (target) target.insertAdjacentHTML("beforeend", `<button type="button" class="ps-logout ${esc(config.logoutClass || "")}" data-ps-logout>Log out</button>`);
      boot();
    },
    saved() {
      if (sync.mode !== "cloud" || sync.role !== "client") return;
      clearTimeout(sync.timer); sync.timer = setTimeout(push, 700); status("saving");
    },
    isCoach: () => sync.role === "coach",
    // True for the coach who may write the Week 6 mission. In open mode, visit the portal once with ?coach=1.
    canSetMissions: () => sync.role === "coach" || (sync.open && localStorage.getItem("sgCoach") === "1"),
    isCloud: () => sync.mode === "cloud",
    coach: () => sync.coach,
    updatedAt: () => sync.updatedAt,
    async saveCoachMission(week, text) {
      const missions = { ...(sync.coach.missions || {}), [week]: String(text || "").trim() };
      const result = await api("PUT", "coach", { coach: { ...sync.coach, missions } });
      if (result.status !== 200) throw new Error("coach_save_failed");
      sync.coach = { ...sync.coach, missions };
      changed();
    },
    toast
  };
})();
