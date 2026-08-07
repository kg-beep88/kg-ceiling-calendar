"use strict";

const BUILT_IN_CONFIG = {
  GOOGLE_CLIENT_ID: "1003316566308-c54h3bdag8bf6jocsc6g17rgb4kj098n.apps.googleusercontent.com",
  CALENDAR_ID: "161afc2b39c63d9e0cb766d21e1b544e9c7d3d03fcdce363bf1f194a79ad034e@group.calendar.google.com",
  GOOGLE_SCOPE: "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.calendarlist.readonly",
  AUTO_REFRESH_SECONDS: 60,
  TIME_ZONE: "Asia/Singapore",
  UTC_OFFSET: "+08:00",
  HISTORY_START: "2026-01-01",
  HISTORY_END: "2051-01-01"
};

const RAW_CONFIG = window.KG_CONFIG || {};
const CONFIG = { ...BUILT_IN_CONFIG, ...RAW_CONFIG };

// Self-heal when an old cached config.js still contains the setup placeholder.
if (!String(CONFIG.GOOGLE_CLIENT_ID || "").trim() || String(CONFIG.GOOGLE_CLIENT_ID).includes("PASTE")) {
  CONFIG.GOOGLE_CLIENT_ID = BUILT_IN_CONFIG.GOOGLE_CLIENT_ID;
}
if (!String(CONFIG.CALENDAR_ID || "").trim() || String(CONFIG.CALENDAR_ID).includes("PASTE_KG_WORK") || CONFIG.CALENDAR_ID === "primary") {
  CONFIG.CALENDAR_ID = BUILT_IN_CONFIG.CALENDAR_ID;
}
if (!String(CONFIG.GOOGLE_SCOPE || "").trim()) CONFIG.GOOGLE_SCOPE = BUILT_IN_CONFIG.GOOGLE_SCOPE;
const API_BASE = "https://www.googleapis.com/calendar/v3";
const APP_MARKER = "#KGCEILING";
const DATA_HEADER = "[KG CEILING APP DATA / KG 天花应用资料]";

const FALLBACK_GOOGLE_EVENT_COLOURS = [
  { id: "1",  name: "Lavender / 淡紫",  background: "#a4bdfc", foreground: "#1d1d1d" },
  { id: "2",  name: "Sage / 鼠尾草绿", background: "#7ae7bf", foreground: "#1d1d1d" },
  { id: "3",  name: "Grape / 葡萄紫",   background: "#dbadff", foreground: "#1d1d1d" },
  { id: "4",  name: "Flamingo / 粉红",  background: "#ff887c", foreground: "#1d1d1d" },
  { id: "5",  name: "Banana / 香蕉黄",  background: "#fbd75b", foreground: "#1d1d1d" },
  { id: "6",  name: "Tangerine / 橙色", background: "#ffb878", foreground: "#1d1d1d" },
  { id: "7",  name: "Peacock / 蓝绿",   background: "#46d6db", foreground: "#1d1d1d" },
  { id: "8",  name: "Graphite / 灰色",  background: "#e1e1e1", foreground: "#1d1d1d" },
  { id: "9",  name: "Blueberry / 蓝色", background: "#5484ed", foreground: "#ffffff" },
  { id: "10", name: "Basil / 深绿色",   background: "#51b749", foreground: "#ffffff" },
  { id: "11", name: "Tomato / 红色",    background: "#dc2127", foreground: "#ffffff" }
];

const GOOGLE_COLOUR_NAMES = {
  "1": "Lavender / 淡紫",
  "2": "Sage / 鼠尾草绿",
  "3": "Grape / 葡萄紫",
  "4": "Flamingo / 粉红",
  "5": "Banana / 香蕉黄",
  "6": "Tangerine / 橙色",
  "7": "Peacock / 蓝绿",
  "8": "Graphite / 灰色",
  "9": "Blueberry / 蓝色",
  "10": "Basil / 深绿色",
  "11": "Tomato / 红色"
};

let googleEventColours = FALLBACK_GOOGLE_EVENT_COLOURS.map((colour) => ({ ...colour }));
let calendarDefaultColour = {
  id: "default",
  name: "Calendar default / 日历默认",
  background: "#0f766e",
  foreground: "#ffffff"
};

const el = {};
let tokenClient = null;
let accessToken = "";
let tokenExpiresAt = 0;
let tokenRefreshPromise = null;
let tokenRefreshResolve = null;
let tokenRefreshReject = null;
let tokenRequestInteractive = false;
let tokenRenewTimer = null;
const TOKEN_RENEW_EARLY_MS = 5 * 60 * 1000;
const TOKEN_MIN_VALIDITY_MS = 90 * 1000;
const TOKEN_RETRY_DELAY_MS = 60 * 1000;
let events = [];
let monthAnchor = startOfMonth(new Date());
let selectedDate = dateKey(new Date());
let autoRefreshTimer = null;
let toastTimer = null;
let currentModalEvent = null;
let lastAddressSearch = "";
let searchRequestNumber = 0;
let historyEventsCache = [];
let historyEventsFetchedAt = 0;
const HISTORY_CACHE_MS = 5 * 60 * 1000;
let lastFormStartDate = "";
let nativeDragData = null;
let touchDragState = null;
let touchDragGhost = null;
let touchDragTarget = null;
let suppressChipClickUntil = 0;
let pendingHistoryCopyEvent = null;

window.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  bindEvents();
  renderColourPicker("default");
  renderAll();
  loadCachedEvents();
  waitForGoogleIdentity();
  registerServiceWorker();
}

function cacheElements() {
  const ids = [
    "connectionBadge", "connectBtn", "refreshBtn", "welcomeCard", "prevMonthBtn",
    "todayBtn", "nextMonthBtn", "monthTitle", "openGoogleBtn", "settingsBtn",
    "calendarGrid", "selectedDateTitle", "addJobBtn", "whatsAppDayBtn", "syncMessage", "dayJobs",
    "floatingAddBtn", "addressSearchForm", "addressSearchInput", "addressSearchBtn",
    "jobModal", "jobModalTitle", "closeModalBtn", "jobForm", "eventId", "continueGroupId", "addressInput",
    "dateInput", "endDateInput", "startTimeInput", "endTimeInput", "allDayInput", "continueJobInput",
    "continuePeriodsWrap", "continuePeriodsList", "addContinuePeriodBtn", "contactInput",
    "lockInput", "idFirmInput", "idNameInput", "installerNameInput", "amendCeilingInput",
    "amendCeilingDetailInput", "amendPartitionInput", "amendPartitionDetailInput",
    "amendPelmetInput", "amendPelmetDetailInput", "amendTimberOtherInput", "amendTimberOtherDetailInput", "amendRemarkInput",
    "deliveryDateInput", "deliveryMaterialsInput", "deliveryRemarkInput", "billingNumberInput",
    "colourPicker", "deleteJobBtn", "cancelBtn",
    "saveJobBtn", "searchModal", "closeSearchBtn", "historySearchForm",
    "historySearchInput", "historySearchBtn", "historySearchStatus",
    "historySearchResults", "doneSearchBtn", "copyDateModal", "copyDateInput", "closeCopyDateBtn",
    "cancelCopyDateBtn", "confirmCopyDateBtn", "whatsAppPreviewModal", "whatsAppPreviewTitle",
    "closeWhatsAppPreviewBtn", "whatsAppPreviewText", "clearWhatsAppPreviewBtn",
    "cancelWhatsAppPreviewBtn", "copyWhatsAppPreviewBtn", "settingsModal", "closeSettingsBtn",
    "calendarIdText", "resetCacheBtn", "doneSettingsBtn", "toast"
  ];
  ids.forEach((id) => { el[id] = document.getElementById(id); });
}

function bindEvents() {
  el.connectBtn.addEventListener("click", connectGoogleCalendar);
  el.refreshBtn.addEventListener("click", () => refreshEvents(true));
  el.prevMonthBtn.addEventListener("click", () => changeMonth(-1));
  el.nextMonthBtn.addEventListener("click", () => changeMonth(1));
  el.todayBtn.addEventListener("click", goToday);
  el.openGoogleBtn.addEventListener("click", () => window.open("https://calendar.google.com/calendar/u/0/r", "_blank", "noopener"));
  el.settingsBtn.addEventListener("click", openSettings);
  el.addressSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    startAddressSearch(el.addressSearchInput.value);
  });
  el.historySearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    startAddressSearch(el.historySearchInput.value);
  });
  el.closeSearchBtn.addEventListener("click", closeSearchModal);
  el.doneSearchBtn.addEventListener("click", closeSearchModal);
  el.searchModal.addEventListener("click", (event) => {
    if (event.target === el.searchModal) closeSearchModal();
  });
  el.closeCopyDateBtn.addEventListener("click", closeCopyDateModal);
  el.cancelCopyDateBtn.addEventListener("click", closeCopyDateModal);
  el.confirmCopyDateBtn.addEventListener("click", confirmHistoryCopyDate);
  el.copyDateModal.addEventListener("click", (event) => {
    if (event.target === el.copyDateModal) closeCopyDateModal();
  });
  el.addJobBtn.addEventListener("click", () => openJobModal());
  el.whatsAppDayBtn.addEventListener("click", shareSelectedDayToWhatsApp);
  el.floatingAddBtn.addEventListener("click", () => openJobModal());
  el.closeModalBtn.addEventListener("click", closeJobModal);
  el.cancelBtn.addEventListener("click", closeJobModal);
  el.jobForm.addEventListener("submit", saveJob);
  el.deleteJobBtn.addEventListener("click", deleteCurrentJob);
  el.allDayInput.addEventListener("change", updateTimeFieldState);
  el.continueJobInput.addEventListener("change", () => updateContinueJobState(true));
  el.addContinuePeriodBtn.addEventListener("click", () => addContinuePeriodRow());
  el.dateInput.addEventListener("change", handleStartDateChange);
  el.endDateInput.addEventListener("change", handleEndDateChange);
  document.addEventListener("pointermove", handleTouchDragMove, { passive: false });
  document.addEventListener("pointerup", handleTouchDragEnd, { passive: false });
  document.addEventListener("pointercancel", cancelTouchDrag, { passive: false });
  el.closeWhatsAppPreviewBtn.addEventListener("click", closeWhatsAppPreview);
  el.cancelWhatsAppPreviewBtn.addEventListener("click", closeWhatsAppPreview);
  el.clearWhatsAppPreviewBtn.addEventListener("click", () => {
    el.whatsAppPreviewText.value = "";
    el.whatsAppPreviewText.focus();
  });
  el.copyWhatsAppPreviewBtn.addEventListener("click", copyWhatsAppPreviewText);
  el.whatsAppPreviewModal.addEventListener("click", (event) => {
    if (event.target === el.whatsAppPreviewModal) closeWhatsAppPreview();
  });
  el.settingsModal.addEventListener("click", (event) => {
    if (event.target === el.settingsModal) closeSettings();
  });
  el.jobModal.addEventListener("click", (event) => {
    if (event.target === el.jobModal) closeJobModal();
  });
  el.closeSettingsBtn.addEventListener("click", closeSettings);
  el.doneSettingsBtn.addEventListener("click", closeSettings);
  el.resetCacheBtn.addEventListener("click", resetAppCache);
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!el.jobModal.hidden) closeJobModal();
    else if (!el.copyDateModal.hidden) closeCopyDateModal();
    else if (!el.searchModal.hidden) closeSearchModal();
    else if (!el.whatsAppPreviewModal.hidden) closeWhatsAppPreview();
    else if (!el.settingsModal.hidden) closeSettings();
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && isConnected()) refreshEvents(false);
  });
  window.addEventListener("focus", () => {
    if (isConnected()) refreshEvents(false);
  });
  window.addEventListener("online", () => {
    if (isConnected()) refreshEvents(false);
  });
}

function waitForGoogleIdentity(attempt = 0) {
  if (window.google?.accounts?.oauth2) {
    initTokenClient();
    return;
  }
  if (attempt > 80) {
    setSyncMessage("Google sign-in could not load. Check your internet. / 谷歌登录无法加载，请检查网络。", true);
    return;
  }
  setTimeout(() => waitForGoogleIdentity(attempt + 1), 100);
}

function initTokenClient() {
  const clientId = String(CONFIG.GOOGLE_CLIENT_ID || "").trim();
  if (!clientId || clientId.includes("PASTE_")) {
    setSyncMessage("Google Client ID is missing in config.js. / config.js 缺少谷歌客户端 ID。", true);
    el.connectBtn.disabled = true;
    return;
  }

  const calendarId = String(CONFIG.CALENDAR_ID || "").trim();
  if (!calendarId || calendarId.includes("PASTE_KG_WORK")) {
    setSyncMessage("Paste the shared KG Work Calendar ID into config.js first. / 请先把共享 KG Work 日历 ID 粘贴到 config.js。", true);
    el.connectBtn.disabled = true;
    return;
  }

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: CONFIG.GOOGLE_SCOPE || "https://www.googleapis.com/auth/calendar.events",
    callback: handleGoogleTokenResponse,
    error_callback: handleGoogleTokenClientError
  });
}

async function connectGoogleCalendar() {
  if (!tokenClient) {
    showToast("Google sign-in is still loading. / 谷歌登录仍在加载。", true);
    return;
  }

  setConnectionState("busy");
  try {
    await requestGoogleAccessToken({ interactive: true });
    el.welcomeCard.hidden = true;
    showToast("Google Calendar connected. Automatic renewal is on while this page stays open. / 谷歌日历已连接；此页面保持开启时会自动续期。", false);
    await loadGoogleColourSettings();
    await refreshEvents(true);
  } catch (error) {
    if (!isConnected()) setConnectionState("off");
    setSyncMessage(`Connection failed: ${error.message}. / 连接失败：${error.message}`, true);
  }
}

function requestGoogleAccessToken({ interactive = false } = {}) {
  if (!tokenClient) {
    return Promise.reject(new Error("Google sign-in is still loading / 谷歌登录仍在加载"));
  }
  if (tokenRefreshPromise) return tokenRefreshPromise;

  tokenRequestInteractive = Boolean(interactive);
  if (interactive || !accessToken) setConnectionState("busy");

  tokenRefreshPromise = new Promise((resolve, reject) => {
    tokenRefreshResolve = resolve;
    tokenRefreshReject = reject;
  });
  const pendingPromise = tokenRefreshPromise;

  try {
    // Empty prompt asks Google to reuse the existing account and permission when possible.
    // 空白 prompt 会尽量沿用现有账号和已同意的权限，不重复要求用户操作。
    tokenClient.requestAccessToken({ prompt: "" });
  } catch (error) {
    finishTokenRequest(false, error);
  }
  return pendingPromise;
}

function handleGoogleTokenResponse(response) {
  if (response?.error || !response?.access_token) {
    finishTokenRequest(false, new Error(response?.error || "No access token returned"));
    return;
  }

  accessToken = response.access_token;
  tokenExpiresAt = Date.now() + (Number(response.expires_in || 3600) * 1000);
  setConnectionState("on");
  el.welcomeCard.hidden = true;
  startAutoRefresh();
  scheduleTokenRenewal();
  finishTokenRequest(true, accessToken);
}

function handleGoogleTokenClientError(error) {
  const message = error?.message || error?.type || "Google authorization could not continue";
  finishTokenRequest(false, new Error(message));
}

function finishTokenRequest(success, value) {
  const resolve = tokenRefreshResolve;
  const reject = tokenRefreshReject;
  const wasInteractive = tokenRequestInteractive;

  tokenRefreshPromise = null;
  tokenRefreshResolve = null;
  tokenRefreshReject = null;
  tokenRequestInteractive = false;

  if (success) {
    if (resolve) resolve(value);
    return;
  }

  const error = value instanceof Error ? value : new Error(String(value || "Google authorization failed"));
  if (accessToken && Date.now() < tokenExpiresAt) {
    setConnectionState("on");
    scheduleTokenRenewal(TOKEN_RETRY_DELAY_MS);
  } else {
    disconnectForExpiredToken({ notify: wasInteractive });
  }
  if (reject) reject(error);
}

function scheduleTokenRenewal(delayOverride = null) {
  clearTokenRenewTimer();
  if (!accessToken || !tokenExpiresAt) return;

  const calculatedDelay = tokenExpiresAt - Date.now() - TOKEN_RENEW_EARLY_MS;
  const delay = delayOverride == null
    ? Math.max(15000, calculatedDelay)
    : Math.max(15000, Number(delayOverride));

  tokenRenewTimer = window.setTimeout(async () => {
    tokenRenewTimer = null;
    if (!accessToken) return;
    if (document.hidden) {
      scheduleTokenRenewal(30000);
      return;
    }
    try {
      await requestGoogleAccessToken({ interactive: false });
    } catch (error) {
      console.warn("Automatic Google token renewal did not complete:", error);
    }
  }, delay);
}

function clearTokenRenewTimer() {
  if (tokenRenewTimer) window.clearTimeout(tokenRenewTimer);
  tokenRenewTimer = null;
}

async function ensureGoogleAccessToken() {
  if (!accessToken) {
    throw new Error("Google Calendar is not connected / 谷歌日历未连接");
  }
  if (Date.now() + TOKEN_MIN_VALIDITY_MS < tokenExpiresAt) return accessToken;

  try {
    return await requestGoogleAccessToken({ interactive: false });
  } catch (error) {
    // If a short amount of valid time remains, allow this request to use it.
    if (accessToken && Date.now() < tokenExpiresAt) return accessToken;
    throw error;
  }
}

function isConnected() {
  // Keep the UI connected while the page is open. apiFetch renews an expiring token.
  return Boolean(accessToken);
}

function setConnectionState(state) {
  const connected = state === "on";
  const busy = state === "busy";
  el.connectBtn.disabled = busy;
  el.refreshBtn.disabled = !connected;
  el.addJobBtn.disabled = !connected;
  el.whatsAppDayBtn.disabled = !connected;
  el.floatingAddBtn.disabled = !connected;
  el.addressSearchBtn.disabled = !connected;

  el.connectionBadge.className = "statusBadge";
  if (connected) {
    el.connectionBadge.classList.add("statusOn");
    el.connectionBadge.textContent = "Connected · Auto renew / 已连接 · 自动续期";
    el.connectBtn.innerHTML = '<span class="btnIcon" aria-hidden="true">G</span><span>Connected while page is open<br><small>页面开启时保持连接</small></span>';
  } else if (busy) {
    el.connectionBadge.classList.add("statusBusy");
    el.connectionBadge.textContent = "Connecting / 连接中";
  } else {
    el.connectionBadge.classList.add("statusOff");
    el.connectionBadge.textContent = "Not connected / 未连接";
    el.connectBtn.innerHTML = '<span class="btnIcon" aria-hidden="true">G</span><span>Connect Google Calendar<br><small>连接谷歌日历</small></span>';
  }
}

function disconnectForExpiredToken({ notify = true } = {}) {
  accessToken = "";
  tokenExpiresAt = 0;
  clearTokenRenewTimer();
  setConnectionState("off");
  stopAutoRefresh();
  setSyncMessage("Automatic Google reconnect could not complete. Click Connect once. / 谷歌自动重连未能完成，请点击连接一次。", true);
  if (notify) showToast("Please reconnect Google Calendar once. / 请重新连接谷歌日历一次。", true);
}

async function loadGoogleColourSettings() {
  try {
    const [colourData, calendarListData] = await Promise.all([
      apiFetch("/colors"),
      apiFetch("/users/me/calendarList?showHidden=true&minAccessRole=reader")
    ]);

    if (colourData?.event && typeof colourData.event === "object") {
      googleEventColours = Object.entries(colourData.event)
        .map(([id, definition]) => ({
          id: String(id),
          name: GOOGLE_COLOUR_NAMES[String(id)] || `Google colour ${id} / 谷歌颜色 ${id}`,
          background: definition?.background || "#e1e1e1",
          foreground: definition?.foreground || "#1d1d1d"
        }))
        .sort((a, b) => Number(a.id) - Number(b.id));
    }

    const items = Array.isArray(calendarListData?.items) ? calendarListData.items : [];
    const configuredId = String(CONFIG.CALENDAR_ID || "primary");
    const activeCalendar = configuredId === "primary"
      ? items.find((item) => item.primary)
      : items.find((item) => item.id === configuredId);

    if (activeCalendar) {
      const calendarPalette = colourData?.calendar?.[String(activeCalendar.colorId || "")];
      calendarDefaultColour = {
        id: "default",
        name: "Calendar default / 日历默认",
        background: activeCalendar.backgroundColor || calendarPalette?.background || calendarDefaultColour.background,
        foreground: activeCalendar.foregroundColor || calendarPalette?.foreground || calendarDefaultColour.foreground
      };
    }

    renderAll();
  } catch (error) {
    // Keep the official fallback palette if Google colour metadata cannot be loaded.
    console.warn("Google colour palette could not be loaded:", error);
  }
}

async function apiFetch(pathOrUrl, options = {}) {
  if (!isConnected()) {
    disconnectForExpiredToken();
    throw new Error("Google Calendar is not connected / 谷歌日历未连接");
  }

  try {
    await ensureGoogleAccessToken();
  } catch (error) {
    disconnectForExpiredToken();
    throw new Error(`Google automatic reconnect failed: ${error.message} / 谷歌自动重连失败：${error.message}`);
  }

  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${API_BASE}${pathOrUrl}`;
  let response = await googleAuthorizedFetch(url, options);

  if (response.status === 401) {
    // The token may have expired earlier than its stated time. Renew once and retry
    // the exact same API request without changing the calendar payload.
    tokenExpiresAt = 0;
    try {
      await requestGoogleAccessToken({ interactive: false });
      response = await googleAuthorizedFetch(url, options);
    } catch (error) {
      disconnectForExpiredToken();
      throw new Error(`Google automatic reconnect failed: ${error.message} / 谷歌自动重连失败：${error.message}`);
    }
  }

  if (response.status === 401) {
    disconnectForExpiredToken();
    throw new Error("Google session expired / 谷歌连接已过期");
  }

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.error?.message || JSON.stringify(body);
    } catch {
      detail = await response.text();
    }
    throw new Error(detail || `Google API error ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

function googleAuthorizedFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {})
    }
  });
}

async function refreshEvents(showSuccess) {
  if (!isConnected()) return;
  setSyncMessage("Syncing with Google Calendar… / 正在与谷歌日历同步……", false);
  el.refreshBtn.disabled = true;

  try {
    const range = visibleCalendarRange();
    const params = new URLSearchParams({
      timeMin: calendarBoundaryString(dateKey(range.start)),
      timeMax: calendarBoundaryString(dateKey(range.end)),
      timeZone: CONFIG.TIME_ZONE || "Asia/Singapore",
      singleEvents: "true",
      orderBy: "startTime",
      showDeleted: "false",
      maxResults: "2500"
    });
    const calendarId = encodeURIComponent(CONFIG.CALENDAR_ID || "primary");
    const data = await apiFetch(`/calendars/${calendarId}/events?${params.toString()}`);
    const items = Array.isArray(data.items) ? data.items : [];
    await synchronizeVisibleDescriptions(items);
    events = items;
    invalidateHistoryCache();
    saveCachedEvents();
    renderAll();
    const nowText = new Intl.DateTimeFormat([], {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: CONFIG.TIME_ZONE || "Asia/Singapore"
    }).format(new Date());
    setSyncMessage(`Synced at ${nowText}. Google Calendar dates and times are shown in Singapore time. / 已于 ${nowText} 同步，日期和时间以新加坡时间显示。`, false);
    if (showSuccess) showToast("Calendar is up to date. / 日历已更新。", false);
  } catch (error) {
    setSyncMessage(`Sync failed: ${error.message} / 同步失败：${error.message}`, true);
  } finally {
    el.refreshBtn.disabled = !isConnected();
  }
}



async function synchronizeVisibleDescriptions(items) {
  const calendarId = encodeURIComponent(CONFIG.CALENDAR_ID || "primary");
  let updatedCount = 0;
  const maximumUpdates = 12;

  for (const event of items) {
    if (updatedCount >= maximumUpdates) break;
    const ownedByApp = event?.extendedProperties?.private?.kgCeilingApp === "1"
      || String(event.description || "").includes(APP_MARKER)
      || String(event.description || "").includes(DATA_HEADER);
    if (!ownedByApp || !event.id) continue;

    const data = jobDataWithEventTiming(event);
    const expected = buildDescription(data);
    if (String(event.description || "") === expected) continue;

    try {
      await apiFetch(`/calendars/${calendarId}/events/${encodeURIComponent(event.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: expected })
      });
      event.description = expected;
      updatedCount += 1;
    } catch {
      // Timing and layout syncing should not stop the main calendar refresh.
    }
  }
}

function jobDataWithEventTiming(event) {
  const data = parseEventData(event);
  const range = eventDateRange(event);
  data.date = range.start;
  data.endDate = range.end || range.start;
  data.allDay = Boolean(event.start?.date);
  if (!data.allDay && event.start?.dateTime) {
    data.startTime = timeInputValueInCalendarZone(new Date(event.start.dateTime));
    data.endTime = event.end?.dateTime
      ? timeInputValueInCalendarZone(new Date(event.end.dateTime))
      : "";
  } else {
    data.startTime = "";
    data.endTime = "";
  }
  return data;
}

function startAutoRefresh() {
  stopAutoRefresh();
  const seconds = Math.max(30, Number(CONFIG.AUTO_REFRESH_SECONDS || 60));
  autoRefreshTimer = window.setInterval(() => {
    if (!document.hidden && isConnected()) refreshEvents(false);
  }, seconds * 1000);
}

function stopAutoRefresh() {
  if (autoRefreshTimer) window.clearInterval(autoRefreshTimer);
  autoRefreshTimer = null;
}

function loadCachedEvents() {
  try {
    const cached = JSON.parse(localStorage.getItem("kgCeilingEventsCache") || "[]");
    if (Array.isArray(cached)) {
      events = cached;
      renderAll();
      if (events.length) {
        setSyncMessage("Showing the last saved view. Connect to update it. / 正在显示上次资料，请连接后更新。", false);
      }
    }
  } catch {
    // Ignore damaged local cache.
  }
}

function saveCachedEvents() {
  try {
    localStorage.setItem("kgCeilingEventsCache", JSON.stringify(events));
  } catch {
    // Storage can be unavailable in private browsing.
  }
}

function setSyncMessage(message, isError) {
  el.syncMessage.textContent = message;
  el.syncMessage.classList.toggle("error", Boolean(isError));
}

function renderAll() {
  renderMonthTitle();
  renderCalendar();
  renderSelectedDateTitle();
  renderDayJobs();
}

function renderMonthTitle() {
  // Keep the calendar header simple: MM/YYYY only.
  el.monthTitle.textContent = `${String(monthAnchor.getMonth() + 1).padStart(2, "0")}/${monthAnchor.getFullYear()}`;
}

function renderSelectedDateTitle() {
  // One date format everywhere in the app: DD/MM/YYYY.
  el.selectedDateTitle.textContent = formatDateShort(selectedDate);
}

function renderCalendar() {
  el.calendarGrid.innerHTML = "";
  const range = visibleCalendarRange();
  const cursor = new Date(range.start);
  const todayKey = dateKey(new Date());

  for (let i = 0; i < 42; i += 1) {
    const key = dateKey(cursor);
    const cell = document.createElement("div");
    cell.className = "dayCell";
    cell.dataset.date = key;
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("tabindex", "0");
    cell.setAttribute("aria-label", cursor.toLocaleDateString());
    if (cursor.getMonth() !== monthAnchor.getMonth()) cell.classList.add("outsideMonth");
    if (key === selectedDate) cell.classList.add("selected");
    if (key === todayKey) cell.classList.add("today");

    const number = document.createElement("span");
    number.className = "dayNumber";
    number.textContent = String(cursor.getDate());
    cell.appendChild(number);

    const stack = document.createElement("div");
    stack.className = "eventStack";
    const dayEvents = eventsForDate(key);
    dayEvents.slice(0, 4).forEach((calendarEvent) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "eventChip";
      chip.dataset.eventId = calendarEvent.id || "";
      chip.dataset.sourceDate = key;
      chip.draggable = isConnected();
      const colour = eventColour(calendarEvent);
      chip.style.background = colour.background;
      chip.style.color = colour.foreground;
      chip.textContent = eventChipLabel(calendarEvent, key);
      chip.title = "Click to edit. Drag to move. / 点击编辑，拖动更改日期。";
      chip.addEventListener("click", (clickEvent) => {
        clickEvent.stopPropagation();
        if (Date.now() < suppressChipClickUntil) return;
        openJobModal(calendarEvent);
      });
      chip.addEventListener("dragstart", (dragEvent) => beginNativeDrag(dragEvent, calendarEvent.id, key));
      chip.addEventListener("dragend", finishNativeDrag);
      chip.addEventListener("pointerdown", (pointerEvent) => beginTouchDrag(pointerEvent, calendarEvent.id, key, chip));
      stack.appendChild(chip);
    });
    if (dayEvents.length > 4) {
      const more = document.createElement("span");
      more.className = "moreEvents";
      more.textContent = `+${dayEvents.length - 4} more / 还有`;
      stack.appendChild(more);
    }
    cell.appendChild(stack);
    cell.addEventListener("click", () => selectDate(key));
    cell.addEventListener("keydown", (keyEvent) => {
      if (keyEvent.key === "Enter" || keyEvent.key === " ") {
        keyEvent.preventDefault();
        selectDate(key);
      }
    });
    cell.addEventListener("dragover", handleCalendarDragOver);
    cell.addEventListener("dragenter", handleCalendarDragEnter);
    cell.addEventListener("dragleave", handleCalendarDragLeave);
    cell.addEventListener("drop", handleCalendarDrop);
    el.calendarGrid.appendChild(cell);
    cursor.setDate(cursor.getDate() + 1);
  }
}

function beginNativeDrag(event, eventId, sourceDate) {
  if (!isConnected() || !eventId) {
    event.preventDefault();
    return;
  }
  nativeDragData = { eventId, sourceDate };
  event.currentTarget.classList.add("dragging");
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", JSON.stringify(nativeDragData));
  }
}

function finishNativeDrag(event) {
  event.currentTarget.classList.remove("dragging");
  nativeDragData = null;
  clearDragHighlights();
}

function handleCalendarDragOver(event) {
  if (!nativeDragData) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
}

function handleCalendarDragEnter(event) {
  if (!nativeDragData) return;
  event.preventDefault();
  event.currentTarget.classList.add("dragOver");
}

function handleCalendarDragLeave(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    event.currentTarget.classList.remove("dragOver");
  }
}

function handleCalendarDrop(event) {
  event.preventDefault();
  const cell = event.currentTarget;
  cell.classList.remove("dragOver");
  let data = nativeDragData;
  if (!data && event.dataTransfer) {
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch {
      data = null;
    }
  }
  if (!data?.eventId || !cell.dataset.date) return;
  moveEventByDrag(data.eventId, data.sourceDate, cell.dataset.date);
}

function beginTouchDrag(event, eventId, sourceDate, chip) {
  if (event.pointerType === "mouse" || !isConnected() || !eventId) return;
  cancelTouchDrag();
  touchDragState = {
    pointerId: event.pointerId,
    eventId,
    sourceDate,
    chip,
    startX: event.clientX,
    startY: event.clientY,
    active: false,
    timer: window.setTimeout(() => activateTouchDrag(event.clientX, event.clientY), 420)
  };
}

function activateTouchDrag(x, y) {
  if (!touchDragState) return;
  touchDragState.active = true;
  touchDragState.chip.classList.add("dragging");
  document.body.classList.add("touchDragging");
  touchDragGhost = touchDragState.chip.cloneNode(true);
  touchDragGhost.className = "eventChip touchDragGhost";
  touchDragGhost.removeAttribute("draggable");
  document.body.appendChild(touchDragGhost);
  positionTouchGhost(x, y);
  updateTouchDragTarget(x, y);
  if (navigator.vibrate) navigator.vibrate(35);
}

function handleTouchDragMove(event) {
  if (!touchDragState || event.pointerId !== touchDragState.pointerId) return;
  const distance = Math.hypot(event.clientX - touchDragState.startX, event.clientY - touchDragState.startY);
  if (!touchDragState.active) {
    if (distance > 12) cancelTouchDrag();
    return;
  }
  event.preventDefault();
  positionTouchGhost(event.clientX, event.clientY);
  updateTouchDragTarget(event.clientX, event.clientY);
}

function positionTouchGhost(x, y) {
  if (!touchDragGhost) return;
  touchDragGhost.style.left = `${x + 12}px`;
  touchDragGhost.style.top = `${y + 12}px`;
}

function updateTouchDragTarget(x, y) {
  const node = document.elementFromPoint(x, y);
  const nextTarget = node?.closest?.(".dayCell") || null;
  if (touchDragTarget === nextTarget) return;
  if (touchDragTarget) touchDragTarget.classList.remove("dragOver");
  touchDragTarget = nextTarget;
  if (touchDragTarget) touchDragTarget.classList.add("dragOver");
}

function handleTouchDragEnd(event) {
  if (!touchDragState || event.pointerId !== touchDragState.pointerId) return;
  if (!touchDragState.active) {
    cancelTouchDrag();
    return;
  }
  event.preventDefault();
  const { eventId, sourceDate } = touchDragState;
  const targetDate = touchDragTarget?.dataset?.date || "";
  suppressChipClickUntil = Date.now() + 700;
  cancelTouchDrag();
  if (targetDate) moveEventByDrag(eventId, sourceDate, targetDate);
}

function cancelTouchDrag() {
  if (touchDragState?.timer) window.clearTimeout(touchDragState.timer);
  if (touchDragState?.chip) touchDragState.chip.classList.remove("dragging");
  if (touchDragGhost) touchDragGhost.remove();
  if (touchDragTarget) touchDragTarget.classList.remove("dragOver");
  touchDragState = null;
  touchDragGhost = null;
  touchDragTarget = null;
  document.body.classList.remove("touchDragging");
}

function clearDragHighlights() {
  document.querySelectorAll(".dayCell.dragOver").forEach((cell) => cell.classList.remove("dragOver"));
}

async function moveEventByDrag(eventId, sourceDate, targetDate) {
  if (!isConnected()) {
    disconnectForExpiredToken();
    return;
  }
  const calendarEvent = events.find((item) => item.id === eventId);
  if (!calendarEvent) {
    showToast("Job could not be found. Refresh and try again. / 找不到工作，请刷新后再试。", true);
    return;
  }
  if (!targetDate || sourceDate === targetDate) {
    selectDate(targetDate || sourceDate);
    return;
  }

  const range = eventDateRange(calendarEvent);
  const grabbedOffset = Math.max(0, daysBetweenKeys(range.start, sourceDate));
  const newStartDate = addDaysKey(targetDate, -grabbedOffset);
  const shifted = shiftedEventTimes(calendarEvent, newStartDate);
  const calendarId = encodeURIComponent(CONFIG.CALENDAR_ID || "primary");

  setSyncMessage("Moving job in Google Calendar… / 正在谷歌日历移动工作……", false);
  try {
    await apiFetch(`/calendars/${calendarId}/events/${encodeURIComponent(eventId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(shifted)
    });
    selectedDate = targetDate;
    monthAnchor = startOfMonth(dateFromKey(targetDate));
    showToast("Job moved to the new date. / 工作已移动到新日期。", false);
    await refreshEvents(false);
  } catch (error) {
    showToast(`Move failed: ${error.message} / 移动失败：${error.message}`, true);
    setSyncMessage("Move failed. Refresh and try again. / 移动失败，请刷新后再试。", true);
  }
}

function shiftedEventTimes(event, newStartDate) {
  const range = eventDateRange(event);
  const daySpan = Math.max(0, daysBetweenKeys(range.start, range.end));
  if (event.start?.date) {
    return {
      start: { date: newStartDate },
      end: { date: addDaysKey(newStartDate, daySpan + 1) }
    };
  }

  const originalStart = new Date(event.start?.dateTime);
  const originalEnd = event.end?.dateTime
    ? new Date(event.end.dateTime)
    : new Date(originalStart.getTime() + 60 * 60 * 1000);
  const durationMs = Math.max(60 * 1000, originalEnd.getTime() - originalStart.getTime());
  const startTime = timeInputValueInCalendarZone(originalStart);
  const newStartText = calendarDateTimeString(newStartDate, startTime);
  const newStartMs = Date.parse(newStartText);
  const newEnd = new Date(newStartMs + durationMs);
  const timeZone = CONFIG.TIME_ZONE || "Asia/Singapore";

  return {
    start: { dateTime: newStartText, timeZone },
    end: { dateTime: calendarDateTimeFromDate(newEnd), timeZone }
  };
}


function renderDayJobs() {
  el.dayJobs.innerHTML = "";
  const dayEvents = eventsForDate(selectedDate);
  el.whatsAppDayBtn.disabled = !isConnected() || dayEvents.length === 0;
  if (!dayEvents.length) {
    const empty = document.createElement("div");
    empty.className = "emptyState";
    empty.innerHTML = isConnected()
      ? "<strong>No job on this date / 此日期没有工作</strong>Press Add Job to create one. / 点击新增工作建立项目。"
      : "<strong>Connect Google Calendar / 连接谷歌日历</strong>Your jobs will appear here. / 工作会显示在这里。";
    el.dayJobs.appendChild(empty);
    return;
  }

  dayEvents.forEach((event) => {
    const data = parseEventData(event);
    const card = document.createElement("article");
    card.className = `jobCard jobCardAddressOnly${data.deliverySent ? " jobCardDeliverySent" : ""}`;

    const strip = document.createElement("div");
    strip.className = "jobColour";
    strip.style.background = eventColour(event).background;

    const info = document.createElement("div");
    info.className = "jobInfo";
    const title = document.createElement("h3");
    title.textContent = data.address || event.summary || "Untitled job / 未命名工作";
    info.appendChild(title);

    const actions = document.createElement("div");
    actions.className = "jobActions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "miniBtn";
    editBtn.title = "Edit / 编辑";
    editBtn.setAttribute("aria-label", "Edit / 编辑");
    editBtn.innerHTML = "✎ <span>Edit<br><small>编辑</small></span>";
    editBtn.disabled = !isConnected();
    editBtn.addEventListener("click", () => openJobModal(event));

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "miniBtn";
    copyBtn.title = "Copy / 复制";
    copyBtn.setAttribute("aria-label", "Copy / 复制");
    copyBtn.innerHTML = "⧉ <span>Copy<br><small>复制</small></span>";
    copyBtn.disabled = !isConnected();
    copyBtn.addEventListener("click", () => openJobModal(event, true));

    const whatsAppBtn = document.createElement("button");
    whatsAppBtn.type = "button";
    whatsAppBtn.className = "miniBtn miniWhatsAppBtn";
    whatsAppBtn.title = "WhatsApp Copy Site / 复制单个工地";
    whatsAppBtn.setAttribute("aria-label", "WhatsApp Copy Site / 复制单个工地");
    whatsAppBtn.innerHTML = "⧉ <span>WhatsApp Copy<br><small>复制单个工地</small></span>";
    whatsAppBtn.addEventListener("click", () => shareSiteToWhatsApp(event));

    let deliveryBtn = null;
    const hasDelivery = Boolean(data.deliveryDate || data.deliveryMaterials || data.deliveryRemark);
    if (hasDelivery) {
      deliveryBtn = document.createElement("button");
      deliveryBtn.type = "button";
      deliveryBtn.className = `miniBtn miniDeliveryBtn${data.deliverySent ? " sent" : ""}`;
      deliveryBtn.title = data.deliverySent ? "Delivery sent — click to undo / 已送货 — 点击取消" : "Mark delivery sent / 标记已送货";
      deliveryBtn.setAttribute("aria-label", deliveryBtn.title);
      deliveryBtn.innerHTML = data.deliverySent
        ? "✓ <span>Sent<br><small>已送货</small></span>"
        : "🚚 <span>Delivery<br><small>点已送货</small></span>";
      deliveryBtn.disabled = !isConnected();
      deliveryBtn.addEventListener("click", () => toggleDeliverySent(event));
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "miniBtn miniDeleteBtn";
    deleteBtn.title = "Delete / 删除";
    deleteBtn.setAttribute("aria-label", "Delete / 删除");
    deleteBtn.innerHTML = "🗑 <span>Delete<br><small>删除</small></span>";
    deleteBtn.disabled = !isConnected();
    deleteBtn.addEventListener("click", () => deleteEventFromCard(event));

    actions.append(editBtn, copyBtn, whatsAppBtn);
    if (deliveryBtn) actions.appendChild(deliveryBtn);
    actions.appendChild(deleteBtn);
    card.append(strip, info, actions);
    el.dayJobs.appendChild(card);
  });
}

async function toggleDeliverySent(event) {
  if (!event?.id || !isConnected()) return;
  const data = parseEventData(event);
  const hasDelivery = Boolean(data.deliveryDate || data.deliveryMaterials || data.deliveryRemark);
  if (!hasDelivery) {
    showToast("No delivery is entered for this site. / 此工地没有填写送货资料。", true);
    return;
  }

  data.deliverySent = !Boolean(data.deliverySent);
  setSyncMessage(data.deliverySent
    ? "Marking delivery as sent... / 正在标记已送货……"
    : "Changing delivery back to not sent... / 正在取消已送货……");

  try {
    await apiFetch(`/calendars/${encodeURIComponent(activeCalendarId())}/events/${encodeURIComponent(event.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: buildDescription(data),
        extendedProperties: { private: buildPrivateProperties(data) }
      })
    });
    historyEventsFetchedAt = 0;
    showToast(data.deliverySent
      ? "Delivery marked sent. / 已标记送货完成。"
      : "Delivery changed back to not sent. / 已取消送货完成。", false);
    await refreshEvents(false);
  } catch (error) {
    showToast(`Delivery update failed: ${error.message} / 更新送货状态失败：${error.message}`, true);
    setSyncMessage("Delivery update failed. Refresh and try again. / 送货状态更新失败，请刷新后再试。", true);
  }
}

function amendmentLabels(data) {
  const labels = [];
  const add = (enabled, label, detail) => {
    const cleanDetail = String(detail || "").trim();
    if (!enabled && !cleanDetail) return;
    labels.push(cleanDetail ? `${label}: ${cleanDetail}` : label);
  };
  add(data.amendCeiling, "Ceiling / 天花", data.amendCeilingDetail);
  add(data.amendPartition, "Partition / 隔墙", data.amendPartitionDetail);
  add(data.amendPelmet, "Pelmet / Box Up / L Box / 窗帘盒 / 包箱 / L Box", data.amendPelmetDetail);
  add(data.amendTimberOther, "Add Timber Support / Other / 加木支撑 / 其他", data.amendTimberOtherDetail);
  return labels;
}

function buildTrackingTags(data) {
  const wrap = document.createElement("div");
  wrap.className = "statusTags";
  const add = (text, className = "") => {
    const tag = document.createElement("span");
    tag.className = `statusTag ${className}`.trim();
    tag.textContent = text;
    wrap.appendChild(tag);
  };
  if (data.continueJob) add(`Continue job${data.continueSequence > 1 ? ` #${data.continueSequence}` : ""} / 继续工作`, "info");
  if (data.deliveryDate || data.deliveryMaterials) {
    add(`Delivery${data.deliveryDate ? `: ${formatDateShort(data.deliveryDate)}` : ""} / 送货`, "good");
  }
  if (data.billingNumber) add(`Billing #${data.billingNumber} / 开单号码`, "good");
  return wrap;
}

function shareSiteToWhatsApp(event) {
  if (!event) return;
  openWhatsAppPreview(buildWhatsAppSiteMessage(event), "Site message / 单个工地信息");
}

function shareSelectedDayToWhatsApp() {
  const dayEvents = eventsForDate(selectedDate);
  if (!dayEvents.length) {
    showToast("No jobs on this date. / 这个日期没有工作。", true);
    return;
  }

  const headingDate = formatDateLongBilingual(selectedDate);
  const blocks = dayEvents.map((event, index) => buildWhatsAppSiteMessage(event, index + 1, true));
  const text = [
    `*KG CEILING DAILY WORK / KG 天花每日工作*`,
    `*Date / 日期:* ${headingDate}`,
    `*Total sites / 工地数量:* ${dayEvents.length}`,
    "",
    blocks.join("\n\n------------------------------\n\n")
  ].join("\n");
  openWhatsAppPreview(text, "Daily message / 当天全部信息");
}

function buildWhatsAppSiteMessage(event, number = 0, compactHeading = false) {
  const data = parseEventData(event);
  const range = eventDateRange(event);
  const lines = [];
  const address = data.address || event.summary || event.location || "No address / 没有地址";

  if (number) lines.push(`*${number}. ${address}*`);
  else {
    lines.push(`*KG CEILING SITE DETAIL / KG 天花工地资料*`);
    lines.push(`*Address / 地址:* ${address}`);
  }

  const dateText = range.start === range.end
    ? formatDateLongBilingual(range.start)
    : `${formatDateLongBilingual(range.start)} → ${formatDateLongBilingual(range.end)}`;
  lines.push(`*Work date / 工作日期:* ${dateText}`);
  lines.push(`*Time / 时间:* ${eventTimeLabel(event)}`);

  if (data.continueJob) {
    lines.push(`*Continue job / 继续工作:* Yes / 是${data.continueSequence > 1 ? ` (#${data.continueSequence})` : ""}`);
  }
  if (data.contact) lines.push(`*ID Name / ID 联系人姓名:* ${data.contact}`);
  if (data.lock) lines.push(`*Lock / 门锁:* ${data.lock}`);
  if (data.idFirm) lines.push(`*ID Firm / ID 公司:* ${data.idFirm}`);
  if (data.idName) {
    lines.push(`*Sales Person / 销售人员:* ${data.idName}`);
    lines.push("");
  }
  if (data.installerName) lines.push(`*Installer / 安装人员:* ${data.installerName}`);

  const amendments = amendmentLabels(data);
  if (amendments.length) {
    lines.push(`*Job Scope / 工作范围:*`);
    amendments.forEach((item) => lines.push(`- ${item}`));
  }
  if (data.amendRemark) {
    lines.push(`*Remark / 备注:* ${data.amendRemark}`);
    lines.push("");
  }

  return lines.join("\n").trimEnd();
}

function formatDateLongBilingual(key) {
  // Kept as a compatibility helper for older code, but display only DD/MM/YYYY.
  return formatDateShort(key);
}

function openWhatsAppPreview(text, title = "WhatsApp Preview / WhatsApp 预览") {
  const clean = String(text || "").trim();
  if (!clean) return;
  el.whatsAppPreviewTitle.textContent = title;
  el.whatsAppPreviewText.value = clean;
  el.whatsAppPreviewModal.hidden = false;
  document.body.style.overflow = "hidden";
  window.setTimeout(() => {
    el.whatsAppPreviewText.focus();
    el.whatsAppPreviewText.setSelectionRange(0, 0);
  }, 0);
}

function closeWhatsAppPreview() {
  el.whatsAppPreviewModal.hidden = true;
  document.body.style.overflow = "";
}

async function copyWhatsAppPreviewText() {
  const text = String(el.whatsAppPreviewText.value || "");
  if (!text.trim()) {
    showToast("Nothing to copy. / 没有内容可以复制。", true);
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied. Paste it into WhatsApp yourself. / 已复制，请自己粘贴到 WhatsApp。", false);
  } catch {
    el.whatsAppPreviewText.focus();
    el.whatsAppPreviewText.select();
    const copied = document.execCommand && document.execCommand("copy");
    showToast(copied ? "Copied. / 已复制。" : "Select the text and copy it manually. / 请选择文字后手动复制。", !copied);
  }
}

function startAddressSearch(rawTerm) {
  const term = String(rawTerm || "").trim();
  if (!isConnected()) {
    showToast("Connect Google Calendar first. / 请先连接谷歌日历。", true);
    return;
  }
  if (!term) {
    showToast("Type something to search. / 请输入搜索内容。", true);
    return;
  }
  lastAddressSearch = term;
  el.addressSearchInput.value = term;
  el.historySearchInput.value = term;
  openSearchModal();
  searchAddressHistory(term);
}

function openSearchModal() {
  el.searchModal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeSearchModal() {
  el.searchModal.hidden = true;
  if (el.jobModal.hidden && el.settingsModal.hidden) document.body.style.overflow = "";
}

async function searchAddressHistory(term) {
  const requestNumber = ++searchRequestNumber;
  el.historySearchBtn.disabled = true;
  el.historySearchStatus.classList.remove("error");
  el.historySearchStatus.textContent = `Searching KG Work for “${term}”… / 正在 KG Work 搜索“${term}”……`;
  el.historySearchResults.innerHTML = "";

  try {
    const foundEvents = await fetchAllAddressEvents(term);
    if (requestNumber !== searchRequestNumber) return;
    renderAddressHistory(foundEvents, term);
  } catch (error) {
    if (requestNumber !== searchRequestNumber) return;
    el.historySearchStatus.classList.add("error");
    el.historySearchStatus.textContent = `Search failed: ${error.message} / 搜索失败：${error.message}`;
  } finally {
    if (requestNumber === searchRequestNumber) el.historySearchBtn.disabled = false;
  }
}

async function fetchAllAddressEvents(term) {
  const all = await fetchAllHistoryEvents();
  return all
    .map((event) => ({ event, score: searchEventScore(event, term) }))
    .filter((item) => item.score >= 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return eventStartMs(b.event) - eventStartMs(a.event);
    })
    .map((item) => item.event);
}

function eventSearchAddress(event) {
  const data = parseEventData(event);
  return normalizeSearchText(data.address || event.summary || event.location || "");
}

function searchEventScore(event, term) {
  const tokens = parseSearchTokens(term);
  const haystack = buildEventSearchText(event);
  if (!tokens.length || !tokens.every((token) => haystack.includes(token))) return -1;

  const address = eventSearchAddress(event);
  const query = normalizeSearchText(term);
  let score = 0;

  // Full address phrase matches are strongest, followed by token-level address matches.
  if (query && address === query) score += 100000;
  else if (query && address.startsWith(query)) score += 50000;
  else if (query && address.includes(query)) score += 25000;

  tokens.forEach((token) => {
    if (address === token) score += 5000;
    else if (address.startsWith(token)) score += 2500;
    else if (address.includes(token)) score += 1000;
    else score += 10;
  });

  return score;
}

function invalidateHistoryCache() {
  historyEventsCache = [];
  historyEventsFetchedAt = 0;
}

async function fetchAllHistoryEvents(force = false) {
  if (!force && historyEventsCache.length && Date.now() - historyEventsFetchedAt < HISTORY_CACHE_MS) {
    return historyEventsCache;
  }

  const calendarId = encodeURIComponent(CONFIG.CALENDAR_ID || "primary");
  const startDate = String(CONFIG.HISTORY_START || "2026-01-01");
  const endDate = String(CONFIG.HISTORY_END || "2051-01-01");
  const all = [];
  let pageToken = "";

  do {
    const params = new URLSearchParams({
      timeMin: calendarBoundaryString(startDate),
      timeMax: calendarBoundaryString(endDate),
      timeZone: CONFIG.TIME_ZONE || "Asia/Singapore",
      singleEvents: "true",
      orderBy: "startTime",
      showDeleted: "false",
      maxResults: "2500"
    });
    if (pageToken) params.set("pageToken", pageToken);
    const data = await apiFetch(`/calendars/${calendarId}/events?${params.toString()}`);
    all.push(...(Array.isArray(data?.items) ? data.items : []));
    pageToken = data?.nextPageToken || "";
  } while (pageToken && all.length < 20000);

  historyEventsCache = all;
  historyEventsFetchedAt = Date.now();
  return all;
}

function parseSearchTokens(term) {
  const matches = String(term || "").match(/"[^"]+"|'[^']+'|\S+/g) || [];
  return matches
    .map((token) => token.replace(/^["']|["']$/g, ""))
    .map(normalizeSearchText)
    .filter(Boolean);
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u3400-\u9fff]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function buildEventSearchText(event) {
  const data = parseEventData(event);
  const range = eventDateRange(event);
  const colour = eventColour(event);
  const values = [
    event.summary,
    event.location,
    event.description,
    data.address,
    data.contact,
    data.lock,
    data.idFirm,
    data.idName,
    data.installerName,
    data.amendCeiling ? "ceiling 天花" : "",
    data.amendCeilingDetail,
    data.amendPartition ? "partition 隔墙" : "",
    data.amendPartitionDetail,
    data.amendPelmet ? "pelmet box up l box 窗帘盒 包箱" : "",
    data.amendPelmetDetail,
    data.amendTimberOther ? "add timber support other 加木支撑 其他" : "",
    data.amendTimberOtherDetail,
    data.amendRemark,
    data.deliveryDate,
    data.deliveryMaterials,
    data.deliveryRemark,
    data.billingNumber,
    data.continueJob ? "continue job 继续工作" : "",
    range.start,
    range.end,
    range.start ? formatDateShort(range.start) : "",
    range.end ? formatDateShort(range.end) : "",
    eventTimeLabel(event),
    colour?.name,
    event.colorId
  ];
  return normalizeSearchText(values.filter(Boolean).join(" "));
}


function renderAddressHistory(foundEvents, term) {
  el.historySearchResults.innerHTML = "";
  if (!foundEvents.length) {
    el.historySearchStatus.textContent = `No matching job detail found for “${term}”. / 找不到与“${term}”相符的工作资料。`;
    const empty = document.createElement("div");
    empty.className = "historyEmpty";
    empty.innerHTML = "<strong>No matching job / 找不到工作</strong><br>Try fewer words, a shorter number, a name, job scope, delivery or billing number. / 请减少关键词，或输入较短号码、姓名、工作范围、送货或开单号码。";
    el.historySearchResults.appendChild(empty);
    return;
  }

  const groups = new Map();
  foundEvents.forEach((event) => {
    const data = parseEventData(event);
    const address = data.address || event.summary || event.location || "Untitled job / 未命名工作";
    const key = normalizeAddress(address);
    const score = searchEventScore(event, term);
    if (!groups.has(key)) groups.set(key, { address, events: [], score });
    const group = groups.get(key);
    group.events.push(event);
    group.score = Math.max(group.score, score);
  });

  const sortedGroups = Array.from(groups.values()).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const newestA = Math.max(...a.events.map(eventStartMs));
    const newestB = Math.max(...b.events.map(eventStartMs));
    return newestB - newestA;
  });

  el.historySearchStatus.textContent = `${foundEvents.length} matching record(s), ${sortedGroups.length} site(s) found. Address matches are shown first. / 找到 ${foundEvents.length} 条相符记录、${sortedGroups.length} 个工地。地址相符结果优先显示。`;
  sortedGroups.forEach((group) => el.historySearchResults.appendChild(buildHistoryGroup(group)));
}

function buildHistoryGroup(group) {
  const sorted = [...group.events].sort((a, b) => eventStartMs(b) - eventStartMs(a));
  const records = sorted.map((event) => ({ event, data: parseEventData(event) }));
  const workDates = uniqueDateValues(records.flatMap(({ event }) => eventDateKeys(event)));
  const deliveries = records
    .filter(({ data }) => data.deliveryDate || data.deliveryMaterials)
    .map(({ data, event }) => ({ date: data.deliveryDate || eventDateKey(event), materials: data.deliveryMaterials, remark: data.deliveryRemark }))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const billingNumbers = Array.from(new Set(records.map(({ data }) => data.billingNumber).filter(Boolean)));
  const latestId = records.find(({ data }) => data.idFirm || data.contact || data.idName)?.data || {};
  const installerNames = Array.from(new Set(records.map(({ data }) => data.installerName).filter(Boolean)));
  const amendments = Array.from(new Set(records.flatMap(({ data }) => amendmentLabels(data))));
  const continueRecords = records.filter(({ data }) => data.continueJob).length;

  const groupEl = document.createElement("section");
  groupEl.className = "historyGroup";

  const head = document.createElement("div");
  head.className = "historyGroupHead";
  const headText = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = group.address;
  const subtitle = document.createElement("p");
  subtitle.textContent = `${records.length} job record(s) / ${records.length} 条工作记录`;
  headText.append(title, subtitle);
  head.appendChild(headText);

  const deliveryText = deliveries.length
    ? deliveries.map((item) => `${item.date ? formatDateShort(item.date) : "No date / 无日期"}: ${item.materials || "Material not entered / 未填写材料"}${item.remark ? ` — ${item.remark}` : ""}`).join("\n")
    : "None / 无";

  const summary = document.createElement("div");
  summary.className = "historySummaryGrid";
  summary.append(
    makeHistorySummary("Work dates / 工作日期", formatDateList(workDates)),
    makeHistorySummary("Installer / 安装人员", installerNames.length ? installerNames.join(", ") : "None / 无"),
    makeHistorySummary("Job Scope / 工作范围", amendments.length ? amendments.join(", ") : "None / 无"),
    makeHistorySummary("Deliver / 送货", deliveryText),
    makeHistorySummary("Billing number / 开单号码", billingNumbers.length ? billingNumbers.join(", ") : "None / 无"),
    makeHistorySummary("ID details / ID 资料", [
      `Firm / 公司: ${latestId.idFirm || "None / 无"}`,
      `ID Name / ID 联系人姓名: ${latestId.contact || "None / 无"}`,
      `Sales Person / 销售人员: ${latestId.idName || "None / 无"}`
    ].join("\n")),
    makeHistorySummary("Continue job / 继续工作", continueRecords ? `${continueRecords} continuing period record(s) / ${continueRecords} 条继续工作记录` : "No / 否")
  );

  const list = document.createElement("div");
  list.className = "historyEventList";
  records.forEach(({ event, data }) => list.appendChild(buildHistoryEventRow(event, data)));

  groupEl.append(head, summary, list);
  return groupEl;
}

function makeHistorySummary(label, value) {
  const item = document.createElement("div");
  item.className = "historySummaryItem";
  const strong = document.createElement("strong");
  strong.textContent = label;
  const span = document.createElement("span");
  span.textContent = value || "None recorded / 没有记录";
  item.append(strong, span);
  return item;
}

function buildHistoryEventRow(event, data) {
  const row = document.createElement("div");
  row.className = "historyEventRow";

  const dateWrap = document.createElement("div");
  dateWrap.className = "historyEventDate";
  dateWrap.textContent = formatEventDateRangeBilingual(event);
  const time = document.createElement("small");
  time.textContent = eventTimeLabel(event);
  dateWrap.appendChild(time);

  const details = document.createElement("div");
  details.className = "historyEventDetails";
  const tags = buildTrackingTags(data);
  if (tags.childElementCount) details.appendChild(tags);
  const lines = [];
  if (data.contact) lines.push(`ID Name / ID 联系人姓名: ${data.contact}`);
  if (data.lock) lines.push(`Lock / 门锁: ${data.lock}`);
  if (data.idFirm) lines.push(`ID Firm / ID 公司: ${data.idFirm}`);
  if (data.idName) lines.push(`Sales Person / 销售人员: ${data.idName}`);
  if (data.installerName) lines.push(`Installer / 安装人员: ${data.installerName}`);
  const amendments = amendmentLabels(data);
  if (amendments.length) lines.push(`Job Scope / 工作范围: ${amendments.join("; ")}`);
  if (data.amendRemark) lines.push(`Remark / 备注: ${data.amendRemark}`);
  if (data.deliveryDate) lines.push(`Delivery date / 送货日期: ${formatDateBilingual(data.deliveryDate)}`);
  if (data.deliveryMaterials) lines.push(`Delivery material / 送货材料: ${data.deliveryMaterials}`);
  if (data.deliveryRemark) lines.push(`Delivery remark / 送货备注: ${data.deliveryRemark}`);
  if (data.billingNumber) lines.push(`Billing number / 开单号码: ${data.billingNumber}`);
  lines.push(`Colour / 颜色: ${eventColour(event).name}`);
  if (lines.length) {
    const p = document.createElement("p");
    p.textContent = lines.join("\n");
    details.appendChild(p);
  }

  const actions = document.createElement("div");
  actions.className = "historyEventActions";

  const edit = document.createElement("button");
  edit.type = "button";
  edit.className = "btn btnSecondary historyEditBtn";
  edit.textContent = "Edit / 编辑";
  edit.addEventListener("click", () => editEventFromHistory(event));

  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "btn btnPrimary historyCopyBtn";
  copy.textContent = "Copy / 复制";
  copy.addEventListener("click", () => openHistoryCopyDate(event));

  actions.append(edit, copy);
  row.append(dateWrap, details, actions);
  return row;
}

function openHistoryCopyDate(event) {
  pendingHistoryCopyEvent = event;
  el.copyDateInput.value = selectedDate || dateKey(new Date());
  el.copyDateModal.hidden = false;
  document.body.style.overflow = "hidden";
  setTimeout(() => el.copyDateInput.focus(), 50);
}

function closeCopyDateModal() {
  el.copyDateModal.hidden = true;
  pendingHistoryCopyEvent = null;
  if (el.jobModal.hidden && el.searchModal.hidden && el.settingsModal.hidden && el.whatsAppPreviewModal.hidden) {
    document.body.style.overflow = "";
  }
}

function confirmHistoryCopyDate() {
  const event = pendingHistoryCopyEvent;
  const targetDate = el.copyDateInput.value;
  if (!event) {
    closeCopyDateModal();
    return;
  }
  if (!targetDate) {
    showToast("Choose a date to copy this work to. / 请选择要复制工作的日期。", true);
    el.copyDateInput.focus();
    return;
  }

  // openJobModal(..., true) already makes a safe new copy: no Google event ID is reused,
  // and fillJobForm preserves the original number of work days from the new start date.
  pendingHistoryCopyEvent = null;
  el.copyDateModal.hidden = true;
  closeSearchModal();
  selectedDate = targetDate;
  openJobModal(event, true);
  showToast("Copy ready. Check the details, then save. / 复制已准备好，请检查资料后保存。", false);
}

async function editEventFromHistory(event) {
  closeSearchModal();
  const key = eventDateKey(event);
  selectedDate = key;
  monthAnchor = startOfMonth(dateFromKey(key));
  renderAll();
  showToast("Loading this job date… / 正在加载此工作日期……", false);
  await refreshEvents(false);
  const freshEvent = events.find((item) => item.id === event.id) || event;
  openJobModal(freshEvent);
}

function normalizeAddress(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\u3400-\u9fff]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function uniqueDateValues(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => String(b).localeCompare(String(a)));
}

function formatDateList(values) {
  if (!values.length) return "None recorded / 没有记录";
  const shown = values.slice(0, 12).map(formatDateBilingual);
  if (values.length > 12) shown.push(`+${values.length - 12} more / 另外 ${values.length - 12} 条`);
  return shown.join(", ");
}

function formatDeliveryList(deliveries) {
  if (!deliveries.length) return "None recorded / 没有记录";
  const shown = deliveries.slice(0, 12).map((entry) => {
    const materials = entry.materials ? ` — ${entry.materials}` : "";
    return `${formatDateBilingual(entry.date)}${materials}`;
  });
  if (deliveries.length > 12) shown.push(`+${deliveries.length - 12} more / 另外 ${deliveries.length - 12} 条`);
  return shown.join("\n");
}

function formatDateShort(value) {
  const date = dateFromKey(value);
  if (Number.isNaN(date.getTime())) return value || "";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDateBilingual(value) {
  if (!value) return "Not set / 未设置";
  return formatDateShort(value);
}

function selectDate(key) {
  selectedDate = key;
  const chosen = dateFromKey(key);
  if (chosen.getMonth() !== monthAnchor.getMonth() || chosen.getFullYear() !== monthAnchor.getFullYear()) {
    monthAnchor = startOfMonth(chosen);
    if (isConnected()) refreshEvents(false);
  }
  renderAll();
}

function changeMonth(delta) {
  monthAnchor = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + delta, 1);
  selectedDate = dateKey(monthAnchor);
  renderAll();
  if (isConnected()) refreshEvents(false);
}

function goToday() {
  const today = new Date();
  monthAnchor = startOfMonth(today);
  selectedDate = dateKey(today);
  renderAll();
  if (isConnected()) refreshEvents(false);
}

function visibleCalendarRange() {
  const first = startOfMonth(monthAnchor);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 42);
  return { start, end };
}

function eventsForDate(key) {
  return events
    .filter((event) => eventIncludesDate(event, key))
    .sort((a, b) => compareEvents(a, b, key));
}


function compareEvents(a, b, shownDate = "") {
  const startA = eventStartMinutesForDate(a, shownDate);
  const startB = eventStartMinutesForDate(b, shownDate);
  if (startA !== startB) return startA - startB;

  const colourA = eventColourSortValue(a);
  const colourB = eventColourSortValue(b);
  if (colourA !== colourB) return colourA - colourB;

  const addressA = parseEventData(a).address || a.summary || a.location || "";
  const addressB = parseEventData(b).address || b.summary || b.location || "";
  return addressA.localeCompare(addressB, undefined, { numeric: true, sensitivity: "base" });
}

function eventStartMinutesForDate(event, shownDate = "") {
  if (event.start?.date) return 0;
  if (!event.start?.dateTime) return 24 * 60 + 1;
  const range = eventDateRange(event);
  if (shownDate && range.start && shownDate > range.start) return 0;
  const parts = calendarDateTimeParts(new Date(event.start.dateTime));
  return parts.hour * 60 + parts.minute;
}

function eventColourSortValue(event) {
  if (!event.colorId) return 0;
  const value = Number(event.colorId);
  return Number.isFinite(value) ? value : 99;
}


function eventStartMs(event) {
  if (event.start?.dateTime) return new Date(event.start.dateTime).getTime();
  if (event.start?.date) return Date.parse(`${event.start.date}T00:00:00${CONFIG.UTC_OFFSET || "+08:00"}`);
  return Number.MAX_SAFE_INTEGER;
}


function eventDateRange(event) {
  if (event.start?.date) {
    const start = event.start.date;
    const exclusiveEnd = event.end?.date || addDaysKey(start, 1);
    let end = addDaysKey(exclusiveEnd, -1);
    if (end < start) end = start;
    return { start, end };
  }
  if (event.start?.dateTime) {
    const startDateTime = new Date(event.start.dateTime);
    const start = dateKeyInCalendarZone(startDateTime);
    let end = start;
    if (event.end?.dateTime) {
      const endDateTime = new Date(event.end.dateTime);
      end = dateKeyInCalendarZone(endDateTime);
      const endParts = calendarDateTimeParts(endDateTime);
      const endsAtMidnight = endParts.hour === 0 && endParts.minute === 0 && endParts.second === 0;
      if (endsAtMidnight && endDateTime > startDateTime && end > start) end = addDaysKey(end, -1);
    }
    return { start, end: end < start ? start : end };
  }
  return { start: "", end: "" };
}


function eventDateKeys(event) {
  const range = eventDateRange(event);
  if (!range.start) return [];
  const keys = [];
  const maxDays = 3660;
  for (let key = range.start, count = 0; key <= range.end && count < maxDays; key = addDaysKey(key, 1), count += 1) {
    keys.push(key);
  }
  return keys;
}

function eventIncludesDate(event, key) {
  const range = eventDateRange(event);
  return Boolean(range.start) && key >= range.start && key <= range.end;
}

function eventDateKey(event) {
  return eventDateRange(event).start;
}

function eventChipLabel(event, shownDate = "") {
  const data = parseEventData(event);
  const title = data.address || event.summary || "Job / 工作";
  const range = eventDateRange(event);
  const multiDay = range.start && range.start !== range.end;
  if (event.start?.date) return multiDay ? `↔ ${title}` : title;
  const time = timeInputValueInCalendarZone(new Date(event.start.dateTime));
  if (multiDay && shownDate && shownDate !== range.start) return `↔ ${title}`;
  return `${time} ${multiDay ? "↔ " : ""}${title}`;
}


function eventTimeLabel(event) {
  const range = eventDateRange(event);
  const multiDay = range.start && range.start !== range.end;
  if (event.start?.date) {
    return multiDay
      ? `${formatDateShort(range.start)}–${formatDateShort(range.end)} • All day / 全天`
      : "All day / 全天";
  }
  if (!event.start?.dateTime) return "Time not set / 未设时间";
  const startDateTime = new Date(event.start.dateTime);
  const start = timeInputValueInCalendarZone(startDateTime);
  const endDateTime = event.end?.dateTime ? new Date(event.end.dateTime) : null;
  const end = endDateTime ? timeInputValueInCalendarZone(endDateTime) : "";
  if (multiDay && endDateTime) {
    return `${formatDateShort(range.start)} ${start} – ${formatDateShort(range.end)} ${end}`;
  }
  return end ? `${start}–${end}` : start;
}


function formatEventDateRangeBilingual(event) {
  const range = eventDateRange(event);
  if (!range.start) return "Not set / 未设置";
  if (range.start === range.end) return formatDateBilingual(range.start);
  return `${formatDateBilingual(range.start)} → ${formatDateBilingual(range.end)}`;
}

function eventColour(event) {
  if (!event.colorId) return calendarDefaultColour;
  return googleEventColours.find((item) => item.id === String(event.colorId)) || calendarDefaultColour;
}

function openJobModal(event = null, asCopy = false) {
  if (!isConnected()) {
    showToast("Connect Google Calendar first. / 请先连接谷歌日历。", true);
    return;
  }

  currentModalEvent = event;
  resetJobForm();
  if (event) fillJobForm(event, asCopy);
  else {
    el.dateInput.value = selectedDate;
    el.endDateInput.value = selectedDate;
    lastFormStartDate = selectedDate;
      renderColourPicker("default");
  }

  el.eventId.value = event && !asCopy ? event.id : "";
  el.jobModalTitle.textContent = event
    ? (asCopy ? "Copy Job / 复制工作" : "Edit Job / 编辑工作")
    : "Add Job / 新增工作";
  el.deleteJobBtn.hidden = !(event && !asCopy);
  el.jobModal.hidden = false;
  document.body.style.overflow = "hidden";
  updateTimeFieldState();
  updateContinueJobState(false);
  setTimeout(() => el.addressInput.focus(), 80);
}

function closeJobModal() {
  el.jobModal.hidden = true;
  if (el.searchModal.hidden && el.settingsModal.hidden) document.body.style.overflow = "";
  currentModalEvent = null;
}

function resetJobForm() {
  el.jobForm.reset();
  el.eventId.value = "";
  el.continueGroupId.value = "";
  el.dateInput.value = selectedDate;
  el.endDateInput.value = selectedDate;
  lastFormStartDate = selectedDate;
  el.startTimeInput.value = "08:00";
  el.endTimeInput.value = "10:00";
  el.allDayInput.checked = true;
  el.continueJobInput.checked = false;
  el.continuePeriodsList.innerHTML = "";
  el.idFirmInput.value = "";
  el.idNameInput.value = "";
  el.installerNameInput.value = "";
  el.amendCeilingInput.checked = false;
  el.amendCeilingDetailInput.value = "";
  el.amendPartitionInput.checked = false;
  el.amendPartitionDetailInput.value = "";
  el.amendPelmetInput.checked = false;
  el.amendPelmetDetailInput.value = "";
  el.amendTimberOtherInput.checked = false;
  el.amendTimberOtherDetailInput.value = "";
  el.amendRemarkInput.value = "";
  el.deliveryDateInput.value = "";
  el.deliveryMaterialsInput.value = "";
  el.deliveryRemarkInput.value = "";
  el.billingNumberInput.value = "";
  renderColourPicker("default");
  el.saveJobBtn.disabled = false;
  el.saveJobBtn.innerHTML = "Save to Google Calendar<br><small>保存到谷歌日历</small>";
}

function fillJobForm(event, asCopy) {
  const data = parseEventData(event);
  el.addressInput.value = data.address || event.summary || "";
  el.contactInput.value = data.contact;
  el.lockInput.value = data.lock;
  el.idFirmInput.value = data.idFirm;
  el.idNameInput.value = data.idName;
  el.installerNameInput.value = data.installerName;
  el.amendCeilingInput.checked = data.amendCeiling;
  el.amendCeilingDetailInput.value = data.amendCeilingDetail || "";
  el.amendPartitionInput.checked = data.amendPartition;
  el.amendPartitionDetailInput.value = data.amendPartitionDetail || "";
  el.amendPelmetInput.checked = data.amendPelmet;
  el.amendPelmetDetailInput.value = data.amendPelmetDetail || "";
  el.amendTimberOtherInput.checked = data.amendTimberOther;
  el.amendTimberOtherDetailInput.value = data.amendTimberOtherDetail || "";
  el.amendRemarkInput.value = data.amendRemark;
  el.deliveryDateInput.value = data.deliveryDate;
  el.deliveryMaterialsInput.value = data.deliveryMaterials;
  el.deliveryRemarkInput.value = data.deliveryRemark;
  el.billingNumberInput.value = data.billingNumber;
  el.continueJobInput.checked = data.continueJob;
  el.continueGroupId.value = data.continueGroupId;
  el.continuePeriodsList.innerHTML = "";
  const originalRange = eventDateRange(event);
  const originalDaySpan = Math.max(0, daysBetweenKeys(originalRange.start, originalRange.end));
  const formStartDate = asCopy ? selectedDate : originalRange.start;
  el.dateInput.value = formStartDate;
  el.endDateInput.value = asCopy ? addDaysKey(formStartDate, originalDaySpan) : originalRange.end;
  lastFormStartDate = formStartDate;
  if (asCopy) {
    el.deliveryDateInput.value = "";
    el.deliveryMaterialsInput.value = "";
    el.deliveryRemarkInput.value = "";
    el.billingNumberInput.value = "";
    el.continueJobInput.checked = false;
    el.continueGroupId.value = "";
    el.continuePeriodsList.innerHTML = "";
  }

  const allDay = Boolean(event.start?.date);
  el.allDayInput.checked = allDay;
  if (!allDay && event.start?.dateTime) {
    el.startTimeInput.value = timeInputValueInCalendarZone(new Date(event.start.dateTime));
    if (event.end?.dateTime) el.endTimeInput.value = timeInputValueInCalendarZone(new Date(event.end.dateTime));
  }
  renderColourPicker(String(event.colorId || "default"));
}

function handleStartDateChange() {
  const nextStart = el.dateInput.value;
  if (!nextStart) return;
  const currentEnd = el.endDateInput.value || nextStart;
  if (lastFormStartDate && currentEnd >= lastFormStartDate) {
    const durationDays = Math.max(0, daysBetweenKeys(lastFormStartDate, currentEnd));
    el.endDateInput.value = addDaysKey(nextStart, durationDays);
  } else if (!el.endDateInput.value || el.endDateInput.value < nextStart) {
    el.endDateInput.value = nextStart;
  }
  lastFormStartDate = nextStart;
}

function handleEndDateChange() {
  const start = el.dateInput.value;
  const end = el.endDateInput.value;
  if (start && end && end < start) {
    el.endDateInput.value = start;
    showToast("End date cannot be before start date. / 结束日期不能早于开始日期。", true);
  }
}

function updateTimeFieldState() {
  const disabled = el.allDayInput.checked;
  el.startTimeInput.disabled = disabled;
  el.endTimeInput.disabled = disabled;
  document.querySelectorAll(".timeField").forEach((node) => node.style.opacity = disabled ? ".52" : "1");
}


function updateContinueJobState(addStarterRow) {
  const enabled = el.continueJobInput.checked;
  el.continuePeriodsWrap.hidden = !enabled;
  if (enabled && addStarterRow && !el.continuePeriodsList.children.length) addContinuePeriodRow();
  if (!enabled) el.continuePeriodsList.innerHTML = "";
}

function addContinuePeriodRow(startValue = "", endValue = "") {
  el.continueJobInput.checked = true;
  el.continuePeriodsWrap.hidden = false;

  const row = document.createElement("div");
  row.className = "continuePeriodRow";

  const startLabel = document.createElement("label");
  startLabel.className = "field";
  const startText = document.createElement("span");
  startText.textContent = "Continue start / 继续开始";
  const start = document.createElement("input");
  start.type = "date";
  start.className = "continueStart";
  start.required = true;
  start.value = startValue || suggestNextContinueDate();
  startLabel.append(startText, start);

  const endLabel = document.createElement("label");
  endLabel.className = "field";
  const endText = document.createElement("span");
  endText.textContent = "Continue end / 继续结束";
  const end = document.createElement("input");
  end.type = "date";
  end.className = "continueEnd";
  end.required = true;
  end.value = endValue || start.value;
  endLabel.append(endText, end);

  start.addEventListener("change", () => {
    if (!end.value || end.value < start.value) end.value = start.value;
    updateAssignmentWarnings();
  });
  end.addEventListener("change", () => {
    if (start.value && end.value < start.value) {
      end.value = start.value;
      showToast("Continue end date cannot be before start date. / 继续工作的结束日期不能早于开始日期。", true);
    }
    updateAssignmentWarnings();
  });

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "btn btnDanger btnSmall continueRemoveBtn";
  remove.textContent = "Remove / 删除";
  remove.addEventListener("click", () => {
    row.remove();
    updateAssignmentWarnings();
  });

  row.append(startLabel, endLabel, remove);
  el.continuePeriodsList.appendChild(row);
  updateAssignmentWarnings();
}

function suggestNextContinueDate() {
  const rows = Array.from(el.continuePeriodsList.querySelectorAll(".continuePeriodRow"));
  if (rows.length) {
    const lastEnd = rows[rows.length - 1].querySelector(".continueEnd")?.value;
    if (lastEnd) return addDaysKey(lastEnd, 1);
  }
  const mainEnd = el.endDateInput.value || el.dateInput.value || selectedDate;
  return mainEnd ? addDaysKey(mainEnd, 1) : selectedDate;
}

function collectContinuePeriods() {
  if (!el.continueJobInput.checked) return [];
  return Array.from(el.continuePeriodsList.querySelectorAll(".continuePeriodRow")).map((row) => ({
    start: row.querySelector(".continueStart")?.value || "",
    end: row.querySelector(".continueEnd")?.value || ""
  })).filter((period) => period.start || period.end);
}

function createContinueGroupId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `kg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function continuationData(baseData, period, sequence) {
  return {
    ...baseData,
    date: period.start,
    endDate: period.end || period.start,
    continueJob: true,
    continueSequence: sequence,
    deliveryDate: "",
    deliveryMaterials: "",
    deliveryRemark: "",
    billingNumber: ""
  };
}

function renderPeopleLists() {
  // Installer is entered as free text in the simplified form.
}

function updateAssignmentWarnings() {
  // Worker/foreman assignment warnings were removed from the simplified form.
}

function renderColourPicker(selectedId) {
  el.colourPicker.innerHTML = "";
  const choices = [calendarDefaultColour, ...googleEventColours];
  choices.forEach((colour) => {
    const label = document.createElement("label");
    label.className = "colourChoice";
    if (colour.id === selectedId) label.classList.add("selected");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "jobColour";
    input.value = colour.id;
    input.checked = colour.id === selectedId;
    input.addEventListener("change", () => {
      el.colourPicker.querySelectorAll(".colourChoice").forEach((node) => node.classList.remove("selected"));
      label.classList.add("selected");
    });
    const dot = document.createElement("span");
    dot.className = "colourDot";
    dot.style.background = colour.background;
    dot.style.color = colour.foreground;
    const text = document.createElement("span");
    text.textContent = colour.name;
    label.append(input, dot, text);
    el.colourPicker.appendChild(label);
  });
}

async function saveJob(event) {
  event.preventDefault();
  if (!isConnected()) {
    disconnectForExpiredToken();
    return;
  }

  const formData = collectJobForm();
  if (!formData.address) {
    showToast("Please enter the address. / 请输入地址。", true);
    el.addressInput.focus();
    return;
  }

  try {
    validateContinuePeriods(formData);
    if (formData.continueJob && !formData.continueGroupId) formData.continueGroupId = createContinueGroupId();
    if (formData.continuePeriods.length) formData.continueJob = true;
  } catch (error) {
    showToast(error.message, true);
    return;
  }

  let calendarEvent;
  try {
    calendarEvent = buildCalendarEvent(formData);
  } catch (error) {
    showToast(error.message, true);
    return;
  }

  el.saveJobBtn.disabled = true;
  el.saveJobBtn.innerHTML = "Saving…<br><small>保存中……</small>";
  const calendarId = encodeURIComponent(CONFIG.CALENDAR_ID || "primary");
  const eventId = el.eventId.value;
  if (eventId && formData.colourId === "default") {
    calendarEvent.colorId = null;
  }

  let extraCreated = 0;
  try {
    if (eventId) {
      // Google Calendar PATCH merges the nested start/end objects. When changing
      // between a timed event and an all-day event, explicitly clear the old
      // alternative fields so Google does not receive both `date` and
      // `dateTime`, which causes “Invalid start time”.
      normaliseTimingFieldsForPatch(calendarEvent, formData.allDay);
      await apiFetch(`/calendars/${calendarId}/events/${encodeURIComponent(eventId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calendarEvent)
      });
    } else {
      await apiFetch(`/calendars/${calendarId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calendarEvent)
      });
    }

    if (formData.continueJob && formData.continuePeriods.length) {
      for (let index = 0; index < formData.continuePeriods.length; index += 1) {
        const continuation = continuationData(formData, formData.continuePeriods[index], index + 2);
        const continuationEvent = buildCalendarEvent(continuation);
        await apiFetch(`/calendars/${calendarId}/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(continuationEvent)
        });
        extraCreated += 1;
      }
    }

    const message = extraCreated
      ? `Saved with ${extraCreated} continuation period(s). / 已保存，并新增 ${extraCreated} 个继续工作时段。`
      : (eventId ? "Job updated in both calendars. / 工作已在两边更新。" : "Job saved to Google Calendar. / 工作已保存到谷歌日历。");
    showToast(message, false);
    selectedDate = formData.date;
    monthAnchor = startOfMonth(dateFromKey(formData.date));
    closeJobModal();
    await refreshEvents(false);
  } catch (error) {
    const partial = extraCreated ? ` Some continuation periods were already created (${extraCreated}). / 已建立 ${extraCreated} 个继续工作时段。` : "";
    showToast(`Save failed: ${error.message}.${partial} / 保存失败：${error.message}`, true);
  } finally {
    el.saveJobBtn.disabled = false;
    el.saveJobBtn.innerHTML = "Save to Google Calendar<br><small>保存到谷歌日历</small>";
  }
}


function normaliseTimingFieldsForPatch(resource, allDay) {
  if (!resource?.start || !resource?.end) return resource;

  if (allDay) {
    resource.start.dateTime = null;
    resource.start.timeZone = null;
    resource.end.dateTime = null;
    resource.end.timeZone = null;
  } else {
    resource.start.date = null;
    resource.end.date = null;
  }
  return resource;
}

function validateContinuePeriods(data) {
  const periods = data.continuePeriods || [];
  let previousEnd = data.endDate || data.date;
  for (let index = 0; index < periods.length; index += 1) {
    const period = periods[index];
    if (!period.start || !period.end) {
      throw new Error("Please complete every continue-work date. / 请填写所有继续工作的日期。 ");
    }
    if (period.end < period.start) {
      throw new Error("A continue-work end date cannot be before its start date. / 继续工作的结束日期不能早于开始日期。 ");
    }
    if (period.start <= previousEnd) {
      throw new Error("Continue-work periods must start after the previous work period. / 继续工作时段必须在上一个工作时段结束后开始。 ");
    }
    previousEnd = period.end;
  }
}

function collectJobForm() {
  return {
    address: el.addressInput.value.trim(),
    date: el.dateInput.value,
    endDate: el.endDateInput.value || el.dateInput.value,
    startTime: el.startTimeInput.value,
    endTime: el.endTimeInput.value,
    allDay: el.allDayInput.checked,
    contact: el.contactInput.value.trim(),
    lock: el.lockInput.value.trim(),
    idFirm: el.idFirmInput.value.trim(),
    idName: el.idNameInput.value.trim(),
    installerName: el.installerNameInput.value.trim(),
    amendCeiling: el.amendCeilingInput.checked || Boolean(el.amendCeilingDetailInput.value.trim()),
    amendCeilingDetail: el.amendCeilingDetailInput.value.trim(),
    amendPartition: el.amendPartitionInput.checked || Boolean(el.amendPartitionDetailInput.value.trim()),
    amendPartitionDetail: el.amendPartitionDetailInput.value.trim(),
    amendPelmet: el.amendPelmetInput.checked || Boolean(el.amendPelmetDetailInput.value.trim()),
    amendPelmetDetail: el.amendPelmetDetailInput.value.trim(),
    amendTimberOther: el.amendTimberOtherInput.checked || Boolean(el.amendTimberOtherDetailInput.value.trim()),
    amendTimberOtherDetail: el.amendTimberOtherDetailInput.value.trim(),
    amendRemark: el.amendRemarkInput.value.trim(),
    deliveryDate: el.deliveryDateInput.value,
    deliveryMaterials: el.deliveryMaterialsInput.value.trim(),
    deliveryRemark: el.deliveryRemarkInput.value.trim(),
    deliverySent: (el.eventId.value && currentModalEvent && (el.deliveryDateInput.value || el.deliveryMaterialsInput.value.trim() || el.deliveryRemarkInput.value.trim()))
      ? Boolean(parseEventData(currentModalEvent).deliverySent)
      : false,
    billingNumber: el.billingNumberInput.value.trim(),
    continueJob: el.continueJobInput.checked,
    continueGroupId: el.continueGroupId.value.trim(),
    continueSequence: (el.eventId.value && currentModalEvent) ? parseEventData(currentModalEvent).continueSequence : 1,
    continuePeriods: collectContinuePeriods(),
    colourId: el.colourPicker.querySelector('input[name="jobColour"]:checked')?.value || "default"
  };
}

function checkedValues(container) {
  return Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map((input) => input.value);
}

function buildCalendarEvent(data) {
  if (!data.date) throw new Error("Please choose a date. / 请选择日期。");
  const privateProperties = buildPrivateProperties(data);
  const resource = {
    summary: data.address,
    description: buildDescription(data),
    location: data.address,
    extendedProperties: { private: privateProperties }
  };

  if (data.colourId && data.colourId !== "default") {
    resource.colorId = data.colourId;
  }

  const endDate = data.endDate || data.date;
  if (endDate < data.date) throw new Error("End date cannot be before start date. / 结束日期不能早于开始日期。");

  if (data.allDay) {
    resource.start = { date: data.date };
    resource.end = { date: addDaysKey(endDate, 1) };
  } else {
    if (!data.startTime || !data.endTime) throw new Error("Please enter start and end time. / 请输入开始和结束时间。");
    const startText = calendarDateTimeString(data.date, data.startTime);
    const endText = calendarDateTimeString(endDate, data.endTime);
    if (Date.parse(endText) <= Date.parse(startText)) {
      throw new Error("The ending date and time must be after the starting date and time. / 结束日期和时间必须迟于开始日期和时间。");
    }
    const timeZone = CONFIG.TIME_ZONE || "Asia/Singapore";
    resource.start = { dateTime: startText, timeZone };
    resource.end = { dateTime: endText, timeZone };
  }
  return resource;
}


function buildDescription(data) {
  const lines = [
    "*KG CEILING SITE DETAIL / KG 天花工地资料*",
    "",
    `*Address / 地址:* ${displayInlineValue(data.address)}`,
    "",
    `*Work date / 工作日期:* ${formatFormDateRange(data)}`,
    `*Time / 时间:* ${formatFormTime(data)}`,
  ];

  if (data.continueJob) {
    lines.push(`*Continue job / 继续工作:* Yes / 是${data.continueSequence > 1 ? ` (#${data.continueSequence})` : ""}`);
  }

  lines.push("");
  if (data.contact) lines.push(`*ID Name / ID 联系人姓名:* ${displayInlineValue(data.contact)}`);
  if (data.lock) lines.push(`*Lock / 门锁:* ${displayInlineValue(data.lock)}`);
  if (data.idFirm) lines.push(`*ID Firm / ID 公司:* ${displayInlineValue(data.idFirm)}`);
  if (data.idName) lines.push(`*Sales Person / 销售人员:* ${displayInlineValue(data.idName)}`);

  if (data.installerName) {
    lines.push("");
    lines.push(`*Installer / 安装人员:* ${displayInlineValue(data.installerName)}`);
  }

  const scopes = amendmentLabels(data);
  if (scopes.length) {
    lines.push("");
    lines.push("*Job Scope / 工作范围:*");
    scopes.forEach((item) => lines.push(`- ${displayInlineValue(item)}`));
  }

  if (data.amendRemark) {
    lines.push("");
    lines.push(`*Remark / 备注:* ${displayInlineValue(data.amendRemark)}`);
  }

  if (data.deliveryDate || data.deliveryMaterials || data.deliveryRemark) {
    lines.push("");
    lines.push("*Deliver / 送货:*");
    if (data.deliveryDate) lines.push(`*Delivery date / 送货日期:* ${formatDateBilingual(data.deliveryDate)}`);
    if (data.deliveryMaterials) lines.push(`*Delivery material / 送货材料:* ${displayInlineValue(data.deliveryMaterials)}`);
    if (data.deliveryRemark) lines.push(`*Delivery remark / 送货备注:* ${displayInlineValue(data.deliveryRemark)}`);
    lines.push(`*Delivery sent / 已送货:* ${data.deliverySent ? "Yes / 是" : "No / 否"}`);
  }

  if (data.billingNumber) {
    lines.push("");
    lines.push("*Billing / 开单:*");
    lines.push(`*Billing number / 开单号码:* ${displayInlineValue(data.billingNumber)}`);
  }

  lines.push("");
  lines.push(APP_MARKER);
  return lines.join("\n");
}


function encodeField(value) {
  return String(value || "").replace(/\r?\n/g, "\\n");
}

function decodeField(value) {
  return String(value || "").replace(/\\n/g, "\n");
}


function displayInlineValue(value) {
  return String(value || "")
    .replace(/\r?\n+/g, " / ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatFormDateRange(data) {
  if (!data?.date) return "Not set / 未设置";
  const end = data.endDate || data.date;
  return data.date === end
    ? formatDateLongBilingual(data.date)
    : `${formatDateLongBilingual(data.date)} → ${formatDateLongBilingual(end)}`;
}

function formatFormTime(data) {
  if (data?.allDay) return "All day / 全天";
  if (!data?.startTime) return "Time not set / 未设时间";
  return data.endTime ? `${data.startTime}–${data.endTime}` : data.startTime;
}

function buildPrivateProperties(data) {
  const privateProperties = {
    kgCeilingApp: "1",
    kgCeilingVersion: "1.7.5",
    ...(data.continueJob && data.continueGroupId ? {
      kgContinueJob: "1",
      kgContinueGroup: data.continueGroupId,
      kgContinueSequence: String(data.continueSequence || 1)
    } : {})
  };

  const stored = {
    address: data.address || "",
    contact: data.contact || "",
    lock: data.lock || "",
    idFirm: data.idFirm || "",
    idName: data.idName || "",
    installerName: data.installerName || "",
    continueJob: Boolean(data.continueJob),
    continueGroupId: data.continueGroupId || "",
    continueSequence: Number(data.continueSequence || 1),
    amendCeiling: Boolean(data.amendCeiling),
    amendCeilingDetail: data.amendCeilingDetail || "",
    amendPartition: Boolean(data.amendPartition),
    amendPartitionDetail: data.amendPartitionDetail || "",
    amendPelmet: Boolean(data.amendPelmet),
    amendPelmetDetail: data.amendPelmetDetail || "",
    amendTimberOther: Boolean(data.amendTimberOther),
    amendTimberOtherDetail: data.amendTimberOtherDetail || "",
    amendRemark: data.amendRemark || "",
    deliveryDate: data.deliveryDate || "",
    deliveryMaterials: data.deliveryMaterials || "",
    deliveryRemark: data.deliveryRemark || "",
    deliverySent: Boolean(data.deliverySent),
    billingNumber: data.billingNumber || ""
  };

  try {
    const encoded = utf8ToBase64(JSON.stringify(stored));
    const chunkSize = 800;
    const chunks = [];
    for (let index = 0; index < encoded.length; index += chunkSize) {
      chunks.push(encoded.slice(index, index + chunkSize));
    }
    privateProperties.kgDataChunks = String(chunks.length);
    chunks.forEach((chunk, index) => {
      privateProperties[`kgData${String(index).padStart(2, "0")}`] = chunk;
    });
  } catch {
    // The visible Google Calendar description remains available as a fallback.
  }
  return privateProperties;
}

function readPrivateEventData(event) {
  const privateProperties = event?.extendedProperties?.private || {};
  const count = Number(privateProperties.kgDataChunks || 0);
  if (!count || count > 100) return null;
  let encoded = "";
  for (let index = 0; index < count; index += 1) {
    encoded += privateProperties[`kgData${String(index).padStart(2, "0")}`] || "";
  }
  if (!encoded) return null;
  try {
    return JSON.parse(base64ToUtf8(encoded));
  } catch {
    return null;
  }
}

function utf8ToBase64(value) {
  const bytes = new TextEncoder().encode(String(value || ""));
  let binary = "";
  const block = 0x8000;
  for (let index = 0; index < bytes.length; index += block) {
    binary += String.fromCharCode(...bytes.subarray(index, index + block));
  }
  return btoa(binary);
}

function base64ToUtf8(value) {
  const binary = atob(String(value || ""));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function parseHumanDescription(description) {
  const result = {};
  const lines = String(description || "").split(/\r?\n/);

  lines.forEach((rawLine) => {
    const plain = rawLine.trim().replace(/\*/g, "");
    if (!plain || plain === APP_MARKER || plain.endsWith(":") && /^(job scope|deliver|billing)\b/i.test(plain)) return;

    if (plain.startsWith("- ")) {
      const item = plain.slice(2).trim();
      const splitAt = item.indexOf(":");
      const label = (splitAt >= 0 ? item.slice(0, splitAt) : item).trim().toLowerCase();
      const value = splitAt >= 0 ? item.slice(splitAt + 1).trim() : "";
      if (label.startsWith("ceiling") || label.includes("天花")) {
        result.amendCeiling = true;
        result.amendCeilingDetail = value;
      } else if (label.startsWith("partition") || label.includes("隔墙")) {
        result.amendPartition = true;
        result.amendPartitionDetail = value;
      } else if (label.startsWith("pelmet") || label.includes("窗帘盒") || label.includes("包箱")) {
        result.amendPelmet = true;
        result.amendPelmetDetail = value;
      } else if (label.startsWith("add timber") || label.includes("木支撑")) {
        result.amendTimberOther = true;
        result.amendTimberOtherDetail = value;
      }
      return;
    }

    const separator = plain.indexOf(":");
    if (separator < 0) return;
    const label = plain.slice(0, separator).trim().toLowerCase();
    const value = plain.slice(separator + 1).trim();

    if (label.startsWith("address") || label.includes("地址")) result.address = value;
    else if (label.startsWith("id name") || label.includes("id 联系人姓名")) result.contact = value;
    else if (label.startsWith("lock") || label.includes("门锁")) result.lock = value;
    else if (label.startsWith("id firm") || label.includes("id 公司")) result.idFirm = value;
    else if (label.startsWith("sales person") || label.includes("销售人员")) result.idName = value;
    else if (label.startsWith("installer") || label.includes("安装人员")) result.installerName = value;
    else if (label.startsWith("continue job") || label.includes("继续工作")) result.continueJob = parseYesNo(value);
    else if (label.startsWith("delivery date") || label.includes("送货日期")) {
      const parsedDate = parseDateFromDescription(value);
      if (parsedDate) result.deliveryDate = parsedDate;
    }
    else if (label.startsWith("delivery material") || label.includes("送货材料")) result.deliveryMaterials = value;
    else if (label.startsWith("delivery remark") || label.includes("送货备注")) result.deliveryRemark = value;
    else if (label.startsWith("delivery sent") || label.includes("已送货")) result.deliverySent = parseYesNo(value);
    else if (label.startsWith("billing number") || label.includes("开单号码")) result.billingNumber = value;
    else if (label.startsWith("remark") || label.includes("备注")) result.amendRemark = value;
  });

  return result;
}

function parseDateFromDescription(value) {
  const text = String(value || "").trim();
  const iso = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (iso) return iso[1];
  const numeric = text.match(/\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})\b/);
  if (numeric) return `${numeric[3]}-${numeric[2].padStart(2, "0")}-${numeric[1].padStart(2, "0")}`;
  const english = text.match(/\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})\b/i);
  if (english) {
    const months = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
    const month = months[english[2].slice(0, 3).toLowerCase()];
    return `${english[3]}-${String(month).padStart(2, "0")}-${english[1].padStart(2, "0")}`;
  }
  const chinese = text.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (chinese) return `${chinese[1]}-${chinese[2].padStart(2, "0")}-${chinese[3].padStart(2, "0")}`;
  return "";
}

function parseEventData(event) {
  const description = String(event.description || "");
  const data = {
    address: event.summary || event.location || "",
    contact: "",
    lock: "",
    idFirm: "",
    idName: "",
    installerName: "",
    continueJob: false,
    continueGroupId: "",
    continueSequence: 1,
    amendCeiling: false,
    amendCeilingDetail: "",
    amendPartition: false,
    amendPartitionDetail: "",
    amendPelmet: false,
    amendPelmetDetail: "",
    amendTimberOther: false,
    amendTimberOtherDetail: "",
    amendRemark: "",
    deliveryDate: "",
    deliveryMaterials: "",
    deliveryRemark: "",
    billingNumber: "",
    // Legacy values are kept only so old calendar records still open safely.
    idPhone: "",
    scope: "",
    remove: "",
    keep: "",
    protect: "",
    disposal: "",
    hoardingDone: false,
    hoardingDoneDate: "",
    hoardingRemoveRequired: false,
    hoardingRemoveDate: "",
    deliverySent: false,
    billed: false,
    billedDate: "",
    foremen: [],
    workers: [],
    notes: ""
  };

  const structuredData = readPrivateEventData(event);

  if (description.includes("*KG CEILING SITE DETAIL / KG 天花工地资料*")) {
    Object.assign(data, parseHumanDescription(description));
    if (structuredData) Object.assign(data, structuredData);
    if (event.summary || event.location) data.address = event.summary || event.location;
    return data;
  }

  if (structuredData) Object.assign(data, structuredData);

  if (!description.includes(DATA_HEADER) && !description.includes(APP_MARKER)) {
    data.amendRemark = description.trim();
    return data;
  }

  const map = new Map();
  description.split(/\r?\n/).forEach((line) => {
    const index = line.indexOf(":");
    if (index < 0) return;
    map.set(line.slice(0, index).trim().toLowerCase(), line.slice(index + 1).trim());
  });

  const get = (...keys) => {
    for (const key of keys) {
      const value = map.get(key.toLowerCase());
      if (value !== undefined) return value;
    }
    return "";
  };

  data.address = decodeField(get("Address / 地址", "Address")) || data.address;
  const hasSalesPersonField = map.has("sales person / 销售人员") || map.has("sales person");
  if (hasSalesPersonField) {
    data.contact = decodeField(get("ID Name / ID 联系人姓名", "ID Name"));
    data.idName = decodeField(get("Sales Person / 销售人员", "Sales Person"));
  } else {
    // Backward compatibility with jobs saved before v1.6.7.
    data.contact = decodeField(get("Contact / 联系", "Contact"));
    data.idName = decodeField(get("ID Name / ID 联系人姓名", "ID Name"));
  }
  data.lock = decodeField(get("Lock No / 门锁号码", "Lock No"));
  data.idFirm = decodeField(get("ID Firm / ID 公司", "ID Firm"));
  data.installerName = decodeField(get("Installer Name / 安装人员姓名", "Installer Name"));
  data.continueGroupId = get("Continue Group ID") || event.extendedProperties?.private?.kgContinueGroup || "";
  data.continueSequence = Number(get("Continue Sequence / 继续工作时段", "Continue Sequence") || event.extendedProperties?.private?.kgContinueSequence || 1) || 1;
  data.continueJob = parseYesNo(get("Continue Job / 继续工作", "Continue Job")) || event.extendedProperties?.private?.kgContinueJob === "1" || Boolean(data.continueGroupId);
  data.amendCeiling = parseYesNo(get("Amend Ceiling / 修改天花", "Amend Ceiling"));
  data.amendCeilingDetail = decodeField(get("Amend Ceiling Detail / 天花修改详情", "Amend Ceiling Detail"));
  data.amendPartition = parseYesNo(get("Amend Partition / 修改隔墙", "Amend Partition"));
  data.amendPartitionDetail = decodeField(get("Amend Partition Detail / 隔墙修改详情", "Amend Partition Detail"));
  data.amendPelmet = parseYesNo(get("Amend Pelmet Box LBox / 修改窗帘盒包箱LBox", "Amend Pelmet Box LBox"));
  data.amendPelmetDetail = decodeField(get("Amend Pelmet Detail / 窗帘盒包箱LBox修改详情", "Amend Pelmet Detail"));
  data.amendTimberOther = parseYesNo(get("Amend Timber Other / 加木支撑其他", "Amend Timber Other"));
  data.amendTimberOtherDetail = decodeField(get("Amend Timber Other Detail / 木支撑其他修改详情", "Amend Timber Other Detail"));
  data.amendRemark = decodeField(get("Amend Remark / 修改备注", "Amend Remark"));
  data.deliveryDate = get("Delivery Date / 送货日期", "Delivery Date");
  data.deliveryMaterials = decodeField(get("Delivery Materials / 送货材料", "Delivery Materials"));
  data.deliveryRemark = decodeField(get("Delivery Remark / 送货备注", "Delivery Remark"));
  data.billingNumber = decodeField(get("Billing Number / 开单号码", "Billing Number", "Invoice Number"));

  // Backward compatibility for older KG Ceiling Calendar records.
  data.idPhone = decodeField(get("ID Phone / ID 联系电话", "ID Phone", "ID Telephone"));
  data.scope = decodeField(get("Scope / 工作范围", "Scope", "SCOPE"));
  data.remove = decodeField(get("Remove / 拆除", "Remove"));
  data.keep = decodeField(get("Keep / 保留", "Keep"));
  data.protect = decodeField(get("Protect / 保护", "Protect"));
  data.disposal = decodeField(get("Disposal / 清理与丢弃", "Disposal"));
  data.hoardingDoneDate = get("Hoarding Done Date / 围板完成日期", "Hoarding Done Date");
  data.hoardingDone = parseYesNo(get("Hoarding Done / 围板已完成", "Hoarding Done")) || Boolean(data.hoardingDoneDate);
  data.hoardingRemoveDate = get("Hoarding Removal Date / 围板拆除日期", "Hoarding Removal Date", "Hoarding Remove Date");
  data.hoardingRemoveRequired = parseYesNo(get("Hoarding Remove Required / 围板需要拆除", "Hoarding Remove Required")) || Boolean(data.hoardingRemoveDate);
  data.deliverySent = parseYesNo(get("Delivery Sent / 已送货", "Delivery Sent"));
  data.billedDate = get("Billed Date / 开单日期", "Billed Date");
  data.billed = Boolean(data.billingNumber) || parseYesNo(get("Billed / 已开单", "Billed")) || Boolean(data.billedDate);
  data.foremen = splitPeople(get("Foremen / 头手", "Foremen"));
  data.workers = splitPeople(get("Workers / 工人", "Workers"));
  data.notes = decodeField(get("Notes / 备注", "Notes"));

  // Map useful legacy information into the new simple fields when possible.
  if (!data.installerName && data.foremen.length) data.installerName = data.foremen.join(", ");
  if (!data.amendRemark) data.amendRemark = data.scope || data.remove || data.notes || "";
  if (event.summary || event.location) data.address = event.summary || event.location;
  return data;
}

function splitPeople(value) {
  if (!value) return [];
  return value.split(/\s*\|\|\s*|\s*,\s*/).map((item) => item.trim()).filter(Boolean);
}


function parseYesNo(value) {
  return /^(yes|true|1|是|已|done|billed)/i.test(String(value || "").trim());
}

async function deleteEventFromCard(event) {
  if (!event?.id) return;
  const data = parseEventData(event);
  const address = data.address || event.summary || "this job / 此工作";
  const ok = window.confirm(`Delete ${address} from the app and Google Calendar?\n从应用和谷歌日历删除 ${address}？`);
  if (!ok) return;
  await deleteCalendarEvent(event.id, false);
}

async function deleteCurrentJob() {
  const eventId = el.eventId.value;
  if (!eventId) return;
  const ok = window.confirm("Delete this job from the app and Google Calendar?\n从应用和谷歌日历删除此工作？");
  if (!ok) return;
  el.deleteJobBtn.disabled = true;
  try {
    await deleteCalendarEvent(eventId, true);
  } finally {
    el.deleteJobBtn.disabled = false;
  }
}

async function deleteCalendarEvent(eventId, closeEditor) {
  if (!isConnected()) {
    disconnectForExpiredToken();
    return;
  }
  const calendarId = encodeURIComponent(CONFIG.CALENDAR_ID || "primary");
  try {
    await apiFetch(`/calendars/${calendarId}/events/${encodeURIComponent(eventId)}`, { method: "DELETE" });
    if (closeEditor) closeJobModal();
    showToast("Job deleted from both calendars. / 工作已从两边删除。", false);
    await refreshEvents(false);
  } catch (error) {
    showToast(`Delete failed: ${error.message} / 删除失败：${error.message}`, true);
  }
}
function openSettings() {
  el.calendarIdText.textContent = CONFIG.CALENDAR_ID || "primary";
  el.settingsModal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeSettings() {
  el.settingsModal.hidden = true;
  if (el.jobModal.hidden && el.searchModal.hidden) document.body.style.overflow = "";
}

async function resetAppCache() {
  const ok = window.confirm("Reset cached app files and reload?\n重置应用缓存并重新加载？");
  if (!ok) return;
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
    localStorage.removeItem("kgCeilingEventsCache");
    const registrations = await navigator.serviceWorker?.getRegistrations?.();
    if (registrations) await Promise.all(registrations.map((registration) => registration.unregister()));
  } finally {
    window.location.reload();
  }
}

function showToast(message, isError) {
  if (toastTimer) window.clearTimeout(toastTimer);
  el.toast.textContent = message;
  el.toast.classList.toggle("error", Boolean(isError));
  el.toast.hidden = false;
  toastTimer = window.setTimeout(() => { el.toast.hidden = true; }, 3800);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}


function calendarBoundaryString(dateValue) {
  return `${dateValue}T00:00:00${CONFIG.UTC_OFFSET || "+08:00"}`;
}

function calendarDateTimeString(dateValue, timeValue) {
  const safeTime = String(timeValue || "00:00").slice(0, 5);
  return `${dateValue}T${safeTime}:00${CONFIG.UTC_OFFSET || "+08:00"}`;
}

function calendarDateTimeFromDate(date) {
  const parts = calendarDateTimeParts(date);
  const key = `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
  const time = `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
  return calendarDateTimeString(key, time);
}

function calendarDateTimeParts(date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: CONFIG.TIME_ZONE || "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)])
  );
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second
  };
}

function dateKeyInCalendarZone(date) {
  const parts = calendarDateTimeParts(date);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function timeInputValueInCalendarZone(date) {
  const parts = calendarDateTimeParts(date);
  return `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function dateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function dateFromKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function addDaysKey(key, days) {
  if (!key) return "";
  const date = dateFromKey(key);
  date.setDate(date.getDate() + Number(days || 0));
  return dateKey(date);
}

function daysBetweenKeys(startKey, endKey) {
  if (!startKey || !endKey) return 0;
  const start = dateFromKey(startKey);
  const end = dateFromKey(endKey);
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

function dateRangesOverlap(startA, endA, startB, endB) {
  if (!startA || !startB) return false;
  const safeEndA = endA || startA;
  const safeEndB = endB || startB;
  return startA <= safeEndB && startB <= safeEndA;
}

function localDateTime(dateValue, timeValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function timeInputValue(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
