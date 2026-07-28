# KG CEILING WORK CALENDAR — ADMIN SETUP / 管理员设置
## VERSION 1.7.1 — FULL SEARCH + SINGAPORE TIME SYNC / 版本 1.7.1 — 全资料搜索 + 新加坡时间同步

This file is for the person setting up the app. Normal staff should read `USER_MANUAL_EN_CN.md`.  
本文件给管理员设置应用使用。普通员工请阅读 `USER_MANUAL_EN_CN.md`.


## New in v1.7.1 / v1.7.1 新功能

- Fixed changing a timed job to **All-day / 全天**. The app now clears the old Google Calendar time fields before saving.
- 修复把有时间的工作改成 **全天工作** 时出现 `Invalid start time` 的问题。

- Search now checks every job detail, similar to Google Calendar search: address, ID name, lock number, ID firm, sales person, installer, job scope, remarks, delivery, billing number, dates, times and colours.
- 搜索功能现在会检查所有工作资料，类似谷歌日历搜索：地址、ID 联系人、门锁号码、ID 公司、销售人员、安装人员、工作范围、备注、送货、开单号码、日期、时间和颜色。
- Google Calendar event descriptions now use the same readable bilingual layout as the WhatsApp copy preview, with Delivery and Billing included and blank lines between main sections.
- 谷歌日历事项说明现在使用与 WhatsApp 复制预览相同的中英文排版，并包括送货和开单，各主要部分之间有空行。
- All timed jobs are saved and displayed in Singapore time (`Asia/Singapore`, UTC+08:00).
- 所有定时工作都以新加坡时间（UTC+08:00）保存和显示。
- New jobs are All-day by default. Untick All-day only when a start/end time is needed.
- 新工作默认是全天工作。只有需要开始和结束时间时才取消全天。
- Daily order is: start time, then Google colour, then address.
- 每日工作排序：开始时间 → 谷歌颜色 → 地址。


## Current Add Job form / 目前新增工作表格

The job editor now contains only:
1. Date and time / 日期和时间
2. Main details / 主要资料
3. Job Scope / 工作范围
4. Deliver / 送货
5. Billing / 开单
6. Google Calendar colour / 谷歌日历颜色

New in v1.6.2:
- Right-side day panel now shows the site address only (with action buttons below).
- Amendment choices use one full-width row each.
- All four checkboxes are locked to the same 24×24 size.
- Manual amendment detail boxes are larger.

Previous features retained:
- Each amendment choice has its own small manual-detail box. / 每个修改项目都有独立小填写框。
- Each site card has **WhatsApp Site / 单个工地** export. / 每个工地都有 WhatsApp 单个工地发送按钮。
- Selected day has **WhatsApp Day / 当天全部** export. / 每天都有 WhatsApp 当天全部发送按钮。
- Form sections 1–6 have more spacing for easier reading. / 表格 1–6 项之间增加间距，更容易看。

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
8. Test WhatsApp Site and WhatsApp Day.
9. Search the address and confirm the history shows the new simplified fields.

## Old screen still appears / 仍然显示旧页面

Open **Settings / 设置** → **Reset Cache / 重置缓存**, then close and reopen the app.


## v1.6.3 already configured / v1.6.3 已配置

This package already contains the KG Work Google Calendar ID and OAuth Client ID supplied by the administrator. Do not replace them unless the administrator intentionally changes the Google project or shared calendar.

此版本已经填入管理员提供的 KG Work Google 日历 ID 和 OAuth Client ID。除非管理员有意更换 Google 项目或共享日历，否则不要修改。
