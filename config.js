window.KG_CONFIG = {
  // Google OAuth Web Client ID. A client ID is public and safe to place in browser code.
  // 谷歌 OAuth 网页客户端 ID。客户端 ID 可以安全地放在网页代码中。
  GOOGLE_CLIENT_ID: "695871721774-1e7q94tl17ekbquihm3f5uq37r8k5hu8.apps.googleusercontent.com",

  // Use the signed-in user's main Google Calendar.
  // 使用登录用户的主要谷歌日历。
  CALENDAR_ID: "primary",

  // Event access plus read-only calendar-list access lets the app use the exact Google Calendar colours.
  // 事项权限加只读日历列表权限，让应用使用与谷歌日历完全相同的颜色。
  GOOGLE_SCOPE: "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.calendarlist.readonly",

  // The app refreshes automatically while it is open.
  // 应用打开时自动刷新。
  AUTO_REFRESH_SECONDS: 60,

  FOREMEN: [
    "Foreman A / 头手 A",
    "Foreman B / 头手 B",
    "Foreman C / 头手 C"
  ],

  WORKERS: [
    "Worker 1 / 工人 1",
    "Worker 2 / 工人 2",
    "Worker 3 / 工人 3",
    "Worker 4 / 工人 4",
    "Worker 5 / 工人 5"
  ]
};
