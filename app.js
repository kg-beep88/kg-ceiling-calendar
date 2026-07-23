"use strict";

const CONFIG = window.KG_CONFIG || {};
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
let events = [];
let monthAnchor = startOfMonth(new Date());
let selectedDate = dateKey(new Date());
let autoRefreshTimer = null;
let toastTimer = null;
let currentModalEvent = null;

window.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  bindEvents();
  renderColourPicker("default");
  renderPeopleLists([], []);
  renderAll();
  loadCachedEvents();
  waitForGoogleIdentity();
  registerServiceWorker();
}

function cacheElements() {
  const ids = [
    "connectionBadge", "connectBtn", "refreshBtn", "welcomeCard", "prevMonthBtn",
    "todayBtn", "nextMonthBtn", "monthTitle", "openGoogleBtn", "settingsBtn",
    "calendarGrid", "selectedDateTitle", "addJobBtn", "syncMessage", "dayJobs",
    "floatingAddBtn", "jobModal", "jobModalTitle", "closeModalBtn", "jobForm",
    "eventId", "addressInput", "dateInput", "startTimeInput", "endTimeInput",
    "allDayInput", "contactInput", "lockInput", "scopeInput", "removeInput",
    "keepInput", "protectInput", "disposalInput", "foremenList", "workersList",
    "colourPicker", "notesInput", "deleteJobBtn", "cancelBtn", "saveJobBtn",
    "settingsModal", "closeSettingsBtn", "calendarIdText", "resetCacheBtn",
    "doneSettingsBtn", "toast"
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
  el.addJobBtn.addEventListener("click", () => openJobModal());
  el.floatingAddBtn.addEventListener("click", () => openJobModal());
  el.closeModalBtn.addEventListener("click", closeJobModal);
  el.cancelBtn.addEventListener("click", closeJobModal);
  el.jobForm.addEventListener("submit", saveJob);
  el.deleteJobBtn.addEventListener("click", deleteCurrentJob);
  el.allDayInput.addEventListener("change", updateTimeFieldState);
  el.dateInput.addEventListener("change", updateAssignmentWarnings);
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
    else if (!el.settingsModal.hidden) closeSettings();
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && isConnected()) refreshEvents(false);
  });
  window.addEventListener("focus", () => {
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

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: CONFIG.GOOGLE_SCOPE || "https://www.googleapis.com/auth/calendar.events",
    callback: () => {}
  });
}

function connectGoogleCalendar() {
  if (!tokenClient) {
    showToast("Google sign-in is still loading. / 谷歌登录仍在加载。", true);
    return;
  }

  setConnectionState("busy");
  tokenClient.callback = async (response) => {
    if (response.error) {
      accessToken = "";
      tokenExpiresAt = 0;
      setConnectionState("off");
      setSyncMessage(`Connection failed: ${response.error}. / 连接失败：${response.error}`, true);
      return;
    }

    accessToken = response.access_token || "";
    tokenExpiresAt = Date.now() + (Number(response.expires_in || 3600) * 1000);
    setConnectionState("on");
    el.welcomeCard.hidden = true;
    showToast("Google Calendar connected. / 谷歌日历已连接。", false);
    startAutoRefresh();
    await loadGoogleColourSettings();
    await refreshEvents(true);
  };

  // Empty prompt means Google only asks for account/consent when necessary.
  // 空白 prompt 表示只在必要时要求选择账号或同意权限。
  tokenClient.requestAccessToken({ prompt: "" });
}

function isConnected() {
  return Boolean(accessToken) && Date.now() < tokenExpiresAt;
}

function setConnectionState(state) {
  const connected = state === "on";
  const busy = state === "busy";
  el.connectBtn.disabled = busy;
  el.refreshBtn.disabled = !connected;
  el.addJobBtn.disabled = !connected;
  el.floatingAddBtn.disabled = !connected;

  el.connectionBadge.className = "statusBadge";
  if (connected) {
    el.connectionBadge.classList.add("statusOn");
    el.connectionBadge.textContent = "Connected / 已连接";
    el.connectBtn.innerHTML = '<span class="btnIcon" aria-hidden="true">G</span><span>Reconnect if needed<br><small>需要时重新连接</small></span>';
  } else if (busy) {
    el.connectionBadge.classList.add("statusBusy");
    el.connectionBadge.textContent = "Connecting / 连接中";
  } else {
    el.connectionBadge.classList.add("statusOff");
    el.connectionBadge.textContent = "Not connected / 未连接";
    el.connectBtn.innerHTML = '<span class="btnIcon" aria-hidden="true">G</span><span>Connect Google Calendar<br><small>连接谷歌日历</small></span>';
  }
}

function disconnectForExpiredToken() {
  accessToken = "";
  tokenExpiresAt = 0;
  setConnectionState("off");
  stopAutoRefresh();
  setSyncMessage("Google session expired. Click Connect once. / 谷歌连接已过期，请点击连接一次。", true);
  showToast("Please reconnect Google Calendar. / 请重新连接谷歌日历。", true);
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

  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${API_BASE}${pathOrUrl}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {})
    }
  });

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

async function refreshEvents(showSuccess) {
  if (!isConnected()) return;
  setSyncMessage("Syncing with Google Calendar… / 正在与谷歌日历同步……", false);
  el.refreshBtn.disabled = true;

  try {
    const range = visibleCalendarRange();
    const params = new URLSearchParams({
      timeMin: range.start.toISOString(),
      timeMax: range.end.toISOString(),
      singleEvents: "true",
      orderBy: "startTime",
      showDeleted: "false",
      maxResults: "2500"
    });
    const calendarId = encodeURIComponent(CONFIG.CALENDAR_ID || "primary");
    const data = await apiFetch(`/calendars/${calendarId}/events?${params.toString()}`);
    events = Array.isArray(data.items) ? data.items : [];
    saveCachedEvents();
    renderAll();
    const nowText = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setSyncMessage(`Synced at ${nowText}. Changes from Google Calendar are shown here. / 已于 ${nowText} 同步，谷歌日历的更改会显示在这里。`, false);
    if (showSuccess) showToast("Calendar is up to date. / 日历已更新。", false);
  } catch (error) {
    setSyncMessage(`Sync failed: ${error.message} / 同步失败：${error.message}`, true);
  } finally {
    el.refreshBtn.disabled = !isConnected();
  }
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
  const en = monthAnchor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const zh = `${monthAnchor.getFullYear()}年${monthAnchor.getMonth() + 1}月`;
  el.monthTitle.textContent = `${en} / ${zh}`;
}

function renderSelectedDateTitle() {
  const date = dateFromKey(selectedDate);
  const en = date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const weekdayZh = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getDay()];
  const zh = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekdayZh}`;
  el.selectedDateTitle.textContent = `${en} / ${zh}`;
}

function renderCalendar() {
  el.calendarGrid.innerHTML = "";
  const range = visibleCalendarRange();
  const cursor = new Date(range.start);
  const todayKey = dateKey(new Date());

  for (let i = 0; i < 42; i += 1) {
    const key = dateKey(cursor);
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "dayCell";
    cell.dataset.date = key;
    cell.setAttribute("role", "gridcell");
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
    dayEvents.slice(0, 4).forEach((event) => {
      const chip = document.createElement("span");
      chip.className = "eventChip";
      const colour = eventColour(event);
      chip.style.background = colour.background;
      chip.style.color = colour.foreground;
      chip.textContent = eventChipLabel(event);
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
    el.calendarGrid.appendChild(cell);
    cursor.setDate(cursor.getDate() + 1);
  }
}

function renderDayJobs() {
  el.dayJobs.innerHTML = "";
  const dayEvents = eventsForDate(selectedDate);
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
    card.className = "jobCard";

    const strip = document.createElement("div");
    strip.className = "jobColour";
    strip.style.background = eventColour(event).background;

    const info = document.createElement("div");
    info.className = "jobInfo";
    const title = document.createElement("h3");
    title.textContent = data.address || event.summary || "Untitled job / 未命名工作";
    const meta = document.createElement("div");
    meta.className = "jobMeta";
    const pieces = [eventTimeLabel(event)];
    if (data.contact) pieces.push(`Contact / 联系: ${data.contact}`);
    if (data.foremen.length) pieces.push(`Foremen / 头手: ${data.foremen.join(", ")}`);
    if (data.workers.length) pieces.push(`Workers / 工人: ${data.workers.join(", ")}`);
    pieces.forEach((piece) => {
      const span = document.createElement("span");
      span.textContent = piece;
      meta.appendChild(span);
    });
    info.append(title, meta);
    if (data.scope) {
      const scope = document.createElement("p");
      scope.className = "jobScope";
      scope.textContent = data.scope;
      info.appendChild(scope);
    }

    const actions = document.createElement("div");
    actions.className = "jobActions";
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "miniBtn";
    editBtn.title = "Edit / 编辑";
    editBtn.setAttribute("aria-label", "Edit / 编辑");
    editBtn.textContent = "✎";
    editBtn.disabled = !isConnected();
    editBtn.addEventListener("click", () => openJobModal(event));

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "miniBtn";
    copyBtn.title = "Copy / 复制";
    copyBtn.setAttribute("aria-label", "Copy / 复制");
    copyBtn.textContent = "⧉";
    copyBtn.disabled = !isConnected();
    copyBtn.addEventListener("click", () => openJobModal(event, true));
    actions.append(editBtn, copyBtn);

    card.append(strip, info, actions);
    el.dayJobs.appendChild(card);
  });
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
    .filter((event) => eventDateKey(event) === key)
    .sort(compareEvents);
}

function compareEvents(a, b) {
  const aAllDay = Boolean(a.start?.date);
  const bAllDay = Boolean(b.start?.date);
  if (aAllDay !== bAllDay) return aAllDay ? 1 : -1;
  return eventStartMs(a) - eventStartMs(b);
}

function eventStartMs(event) {
  if (event.start?.dateTime) return new Date(event.start.dateTime).getTime();
  if (event.start?.date) return dateFromKey(event.start.date).getTime();
  return Number.MAX_SAFE_INTEGER;
}

function eventDateKey(event) {
  if (event.start?.date) return event.start.date;
  if (event.start?.dateTime) return dateKey(new Date(event.start.dateTime));
  return "";
}

function eventChipLabel(event) {
  const data = parseEventData(event);
  const title = data.address || event.summary || "Job / 工作";
  if (event.start?.date) return title;
  const time = new Date(event.start.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${time} ${title}`;
}

function eventTimeLabel(event) {
  if (event.start?.date) return "All day / 全天";
  if (!event.start?.dateTime) return "Time not set / 未设时间";
  const start = new Date(event.start.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  const end = event.end?.dateTime
    ? new Date(event.end.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
    : "";
  return end ? `${start}–${end}` : start;
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
    renderPeopleLists([], []);
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
  updateAssignmentWarnings();
  setTimeout(() => el.addressInput.focus(), 80);
}

function closeJobModal() {
  el.jobModal.hidden = true;
  document.body.style.overflow = "";
  currentModalEvent = null;
}

function resetJobForm() {
  el.jobForm.reset();
  el.eventId.value = "";
  el.dateInput.value = selectedDate;
  el.startTimeInput.value = "08:00";
  el.endTimeInput.value = "10:00";
  el.allDayInput.checked = false;
  renderPeopleLists([], []);
  renderColourPicker("default");
  el.saveJobBtn.disabled = false;
  el.saveJobBtn.innerHTML = "Save to Google Calendar<br><small>保存到谷歌日历</small>";
}

function fillJobForm(event, asCopy) {
  const data = parseEventData(event);
  el.addressInput.value = data.address || event.summary || "";
  el.contactInput.value = data.contact;
  el.lockInput.value = data.lock;
  el.scopeInput.value = data.scope;
  el.removeInput.value = data.remove;
  el.keepInput.value = data.keep;
  el.protectInput.value = data.protect;
  el.disposalInput.value = data.disposal;
  el.notesInput.value = data.notes;
  el.dateInput.value = asCopy ? selectedDate : eventDateKey(event);

  const allDay = Boolean(event.start?.date);
  el.allDayInput.checked = allDay;
  if (!allDay && event.start?.dateTime) {
    el.startTimeInput.value = timeInputValue(new Date(event.start.dateTime));
    if (event.end?.dateTime) el.endTimeInput.value = timeInputValue(new Date(event.end.dateTime));
  }
  renderPeopleLists(data.foremen, data.workers);
  renderColourPicker(String(event.colorId || "default"));
}

function updateTimeFieldState() {
  const disabled = el.allDayInput.checked;
  el.startTimeInput.disabled = disabled;
  el.endTimeInput.disabled = disabled;
  document.querySelectorAll(".timeField").forEach((node) => node.style.opacity = disabled ? ".52" : "1");
}

function renderPeopleLists(selectedForemen, selectedWorkers) {
  renderPersonGroup(el.foremenList, CONFIG.FOREMEN || [], "foreman", selectedForemen);
  renderPersonGroup(el.workersList, CONFIG.WORKERS || [], "worker", selectedWorkers);
}

function renderPersonGroup(container, names, type, selectedNames) {
  container.innerHTML = "";
  if (!names.length) {
    const empty = document.createElement("p");
    empty.className = "helpText";
    empty.textContent = "Add names in config.js / 请在 config.js 添加名字";
    container.appendChild(empty);
    return;
  }

  names.forEach((name, index) => {
    const label = document.createElement("label");
    label.className = "personChoice";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = type;
    input.value = name;
    input.id = `${type}-${index}`;
    input.checked = selectedNames.includes(name);
    const textWrap = document.createElement("span");
    const base = document.createElement("span");
    base.className = "personName";
    base.textContent = name;
    const warning = document.createElement("span");
    warning.className = "assignmentWarning";
    warning.hidden = true;
    textWrap.append(base, warning);
    label.append(input, textWrap);
    container.appendChild(label);
  });
}

function updateAssignmentWarnings() {
  const key = el.dateInput.value;
  if (!key) return;
  const editingId = el.eventId.value;
  const foremanMap = new Map();
  const workerMap = new Map();

  eventsForDate(key).forEach((event) => {
    if (event.id === editingId) return;
    const data = parseEventData(event);
    const address = data.address || event.summary || "Another job / 其他工作";
    data.foremen.forEach((name) => foremanMap.set(name, address));
    data.workers.forEach((name) => workerMap.set(name, address));
  });

  applyWarnings(el.foremenList, foremanMap);
  applyWarnings(el.workersList, workerMap);
}

function applyWarnings(container, map) {
  container.querySelectorAll(".personChoice").forEach((label) => {
    const input = label.querySelector("input");
    const warning = label.querySelector(".assignmentWarning");
    const address = map.get(input.value);
    warning.hidden = !address;
    warning.textContent = address ? `Already at: ${address} / 已安排：${address}` : "";
  });
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
    // Google Calendar PATCH clears an existing special event colour when colorId is null.
    calendarEvent.colorId = null;
  }

  try {
    if (eventId) {
      await apiFetch(`/calendars/${calendarId}/events/${encodeURIComponent(eventId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calendarEvent)
      });
      showToast("Job updated in both calendars. / 工作已在两边更新。", false);
    } else {
      await apiFetch(`/calendars/${calendarId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calendarEvent)
      });
      showToast("Job saved to Google Calendar. / 工作已保存到谷歌日历。", false);
    }
    selectedDate = formData.date;
    monthAnchor = startOfMonth(dateFromKey(formData.date));
    closeJobModal();
    await refreshEvents(false);
  } catch (error) {
    showToast(`Save failed: ${error.message} / 保存失败：${error.message}`, true);
  } finally {
    el.saveJobBtn.disabled = false;
    el.saveJobBtn.innerHTML = "Save to Google Calendar<br><small>保存到谷歌日历</small>";
  }
}

function collectJobForm() {
  return {
    address: el.addressInput.value.trim(),
    date: el.dateInput.value,
    startTime: el.startTimeInput.value,
    endTime: el.endTimeInput.value,
    allDay: el.allDayInput.checked,
    contact: el.contactInput.value.trim(),
    lock: el.lockInput.value.trim(),
    scope: el.scopeInput.value.trim(),
    remove: el.removeInput.value.trim(),
    keep: el.keepInput.value.trim(),
    protect: el.protectInput.value.trim(),
    disposal: el.disposalInput.value.trim(),
    foremen: checkedValues(el.foremenList),
    workers: checkedValues(el.workersList),
    colourId: el.colourPicker.querySelector('input[name="jobColour"]:checked')?.value || "default",
    notes: el.notesInput.value.trim()
  };
}

function checkedValues(container) {
  return Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map((input) => input.value);
}

function buildCalendarEvent(data) {
  if (!data.date) throw new Error("Please choose a date. / 请选择日期。");
  const resource = {
    summary: data.address,
    description: buildDescription(data),
    location: data.address,
    extendedProperties: {
      private: {
        kgCeilingApp: "1",
        kgCeilingVersion: "1.1.0"
      }
    }
  };

  if (data.colourId && data.colourId !== "default") {
    resource.colorId = data.colourId;
  }

  if (data.allDay) {
    const next = dateFromKey(data.date);
    next.setDate(next.getDate() + 1);
    resource.start = { date: data.date };
    resource.end = { date: dateKey(next) };
  } else {
    if (!data.startTime || !data.endTime) throw new Error("Please enter start and end time. / 请输入开始和结束时间。");
    const start = localDateTime(data.date, data.startTime);
    const end = localDateTime(data.date, data.endTime);
    if (end <= start) throw new Error("End time must be after start time. / 结束时间必须迟于开始时间。");
    resource.start = { dateTime: start.toISOString() };
    resource.end = { dateTime: end.toISOString() };
  }
  return resource;
}

function buildDescription(data) {
  const lines = [
    DATA_HEADER,
    `Address / 地址: ${data.address}`,
    `Contact / 联系: ${data.contact}`,
    `Lock No / 门锁号码: ${data.lock}`,
    `Scope / 工作范围: ${data.scope}`,
    `Remove / 拆除: ${data.remove}`,
    `Keep / 保留: ${data.keep}`,
    `Protect / 保护: ${data.protect}`,
    `Disposal / 清理与丢弃: ${data.disposal}`,
    `Foremen / 头手: ${data.foremen.join(" || ")}`,
    `Workers / 工人: ${data.workers.join(" || ")}`,
    `Notes / 备注: ${data.notes}`,
    APP_MARKER
  ];
  return lines.join("\n");
}

function parseEventData(event) {
  const description = String(event.description || "");
  const data = {
    address: event.summary || event.location || "",
    contact: "",
    lock: "",
    scope: "",
    remove: "",
    keep: "",
    protect: "",
    disposal: "",
    foremen: [],
    workers: [],
    notes: ""
  };

  if (!description.includes(DATA_HEADER) && !description.includes(APP_MARKER)) {
    data.scope = description.trim();
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

  data.address = get("Address / 地址", "Address") || data.address;
  data.contact = get("Contact / 联系", "Contact");
  data.lock = get("Lock No / 门锁号码", "Lock No");
  data.scope = get("Scope / 工作范围", "Scope", "SCOPE");
  data.remove = get("Remove / 拆除", "Remove");
  data.keep = get("Keep / 保留", "Keep");
  data.protect = get("Protect / 保护", "Protect");
  data.disposal = get("Disposal / 清理与丢弃", "Disposal");
  data.foremen = splitPeople(get("Foremen / 头手", "Foremen"));
  data.workers = splitPeople(get("Workers / 工人", "Workers"));
  data.notes = get("Notes / 备注", "Notes");
  return data;
}

function splitPeople(value) {
  if (!value) return [];
  return value.split(/\s*\|\|\s*|\s*,\s*/).map((item) => item.trim()).filter(Boolean);
}

async function deleteCurrentJob() {
  const eventId = el.eventId.value;
  if (!eventId) return;
  const ok = window.confirm("Delete this job from the app and Google Calendar?\n从应用和谷歌日历删除此工作？");
  if (!ok) return;

  el.deleteJobBtn.disabled = true;
  const calendarId = encodeURIComponent(CONFIG.CALENDAR_ID || "primary");
  try {
    await apiFetch(`/calendars/${calendarId}/events/${encodeURIComponent(eventId)}`, { method: "DELETE" });
    closeJobModal();
    showToast("Job deleted from both calendars. / 工作已从两边删除。", false);
    await refreshEvents(false);
  } catch (error) {
    showToast(`Delete failed: ${error.message} / 删除失败：${error.message}`, true);
  } finally {
    el.deleteJobBtn.disabled = false;
  }
}

function openSettings() {
  el.calendarIdText.textContent = CONFIG.CALENDAR_ID || "primary";
  el.settingsModal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeSettings() {
  el.settingsModal.hidden = true;
  if (el.jobModal.hidden) document.body.style.overflow = "";
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

function localDateTime(dateValue, timeValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function timeInputValue(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
