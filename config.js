window.KG_CONFIG = {
  // Google OAuth Web Client ID. A client ID is public and safe to place in browser code.
  // 谷歌 OAuth 网页客户端 ID。客户端 ID 可以安全地放在网页代码中。
  GOOGLE_CLIENT_ID: "1003316566308-c54h3bdag8bf6jocsc6g17rgb4kj098n.apps.googleusercontent.com",

  // Paste the shared “KG Work” Calendar ID here. Do not use "primary" when everyone must share one calendar.
  // 在这里粘贴共享“KG Work”日历 ID。所有人共用一个日历时，不要使用 "primary"。
  CALENDAR_ID: "161afc2b39c63d9e0cb766d21e1b544e9c7d3d03fcdce363bf1f194a79ad034e@group.calendar.google.com",

  // Event access plus read-only calendar-list access lets the app use the exact Google Calendar colours.
  // 事项权限加只读日历列表权限，让应用使用与谷歌日历完全相同的颜色。
  GOOGLE_SCOPE: "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.calendarlist.readonly",

  // The app refreshes automatically while it is open.
  // 应用打开时自动刷新。
  AUTO_REFRESH_SECONDS: 60,

  // Address-history search range. Change only when you need older or later records.
  // 地址历史搜索范围。只有需要更早或更后的记录时才更改。
  HISTORY_START: "2026-01-01",
  HISTORY_END: "2051-01-01"
};
