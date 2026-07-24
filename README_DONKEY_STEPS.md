# KG CEILING WORK CALENDAR — ADMIN SETUP / 管理员设置
## VERSION 1.5.0 — SIMPLIFIED JOB FORM / 版本 1.5.0 — 简化工作表格

This file is for the person setting up the app. Normal staff should read `USER_MANUAL_EN_CN.md`.  
本文件给管理员设置应用使用。普通员工请阅读 `USER_MANUAL_EN_CN.md`。

## Current Add Job form / 目前新增工作表格

The job editor now contains only:
1. Date and time / 日期和时间
2. Main details / 主要资料
3. Need amend / 需要修改
4. Deliver / 送货
5. Billing / 开单
6. Google Calendar colour / 谷歌日历颜色

Removed from the form:
- Scope of work / 工作范围
- ID telephone / ID 联系电话
- Hoarding / 围板
- Foreman and worker selectors / 头手和工人选择
- Remove, Keep, Protect, Disposal / 拆除、保留、保护、清理
- Billing checkbox and billed date / 开单勾选和开单日期
- Extra notes / 其他备注

## Before publishing / 发布前

Open `config.js` and enter:

```javascript
GOOGLE_CLIENT_ID: "YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com",
CALENDAR_ID: "YOUR_KG_WORK_CALENDAR_ID@group.calendar.google.com",
```

Keep the Google scopes already provided in the file.

## Google Calendar / 谷歌日历

Use one shared calendar named **KG Work**. Share it with every staff member who needs to use the app and give normal users permission to make changes to events.

In Google Cloud:
1. Enable Google Calendar API.
2. Create a Web application OAuth Client.
3. Add `https://kg-beep88.github.io` as an Authorized JavaScript origin.
4. Add staff Gmail accounts as test users while the app is in Testing mode.

## GitHub Pages / GitHub Pages 发布

Repository: `KGcall`

Upload these files into the repository root:
- index.html
- app.js
- styles.css
- config.js
- sw.js
- manifest.webmanifest
- privacy.html
- USER_MANUAL_EN_CN.md
- README_DONKEY_STEPS.md
- icons/

GitHub Pages:
- Source: Deploy from a branch
- Branch: main
- Folder: /(root)

Expected website:
`https://kg-beep88.github.io/KGcall/`

## Test before staff use / 给员工使用前测试

1. Connect Google Calendar.
2. Add one test job.
3. Fill installer, amendment type, delivery and billing number.
4. Confirm the event appears in KG Work Google Calendar.
5. Edit it from Google Calendar and press Refresh in the app.
6. Test Copy, Delete and drag-to-move.
7. Test a continue job with a pause between work periods.
8. Search the address and confirm the history shows the new simplified fields.

## Old screen still appears / 仍然显示旧页面

Open **Settings / 设置** → **Reset Cache / 重置缓存**, then close and reopen the app.
