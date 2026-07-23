# KG Ceiling Work Calendar / KG 天花工作日历

## COMPLETE START-TO-END DONKEY GUIDE
## 从零开始完整超简单指南

This guide assumes you have not started anything yet.
本指南假设您还没有开始任何设置。


## VERSION 1.3.0 — MULTI-DAY JOBS, DRAG, COPY AND DELETE
## 版本 1.3.0 — 多日工作、拖动、复制和删除

This updated version includes everything from version 1.2.0 and adds:
此版本保留 1.2.0 的全部功能，并增加：

1. Choose a start date and end date for work lasting several days. / 为多日工作选择开始和结束日期。
2. The same multi-day job appears on every applicable calendar date. / 同一个多日工作会显示在所有相关日期。
3. On a computer, drag a coloured job bar to another date to move it. / 在电脑上，把彩色工作条拖到另一个日期即可移动。
4. On a phone, press and hold a coloured job bar, then drag it to another date. / 在手机上，长按彩色工作条后拖到另一个日期。
5. Copy a job, choose new start and end dates, then save it as a new Google event. / 复制工作后选择新的开始和结束日期，再保存为新的谷歌事项。
6. A clear Delete button is available in the selected-day job list and editor. / 已选日期的工作列表和编辑页都有清楚的删除按钮。
7. Dragging preserves the job time and number of days. / 拖动会保留工作时间和天数。
8. Address history now lists every date covered by a multi-day job. / 地址历史会列出多日工作涵盖的每个日期。

---

Do one numbered step at a time. Do not jump ahead.
一次只做一个编号步骤。不要跳步骤。

---

# PART 0 — What you need / 您需要什么

You need:

1. A Google account with Google Calendar.
2. A GitHub account.
3. A Windows computer for the first setup.
4. Chrome or Microsoft Edge.
5. The ZIP package supplied with this guide.

Recommended GitHub account already used for this project:

```text
kg-beep88
```

The final website will be:

```text
https://kg-beep88.github.io/KGcall/
```

---

# PART 1 — Download and open the project / 下载和打开项目

## Step 1 — Download the ZIP / 下载 ZIP

Download:

```text
kg-ceiling-calendar-v1.3.0-multiday-drag-copy-delete.zip
```

## Step 2 — Extract the ZIP / 解压 ZIP

1. Find the downloaded ZIP in **Downloads / 下载**.
2. Right-click the ZIP.
3. Click **Extract All / 全部解压**.
4. Click **Extract / 解压**.
5. Open the extracted folder.
6. Open the folder named:

```text
kg-ceiling-calendar
```

You should see:

```text
index.html
app.js
styles.css
config.js
sw.js
manifest.webmanifest
privacy.html
README_DONKEY_STEPS.md
icons
```

Important: later, upload these files themselves. Do not upload the outside ZIP file.
重要：稍后要上传这些文件本身，不要直接上传 ZIP。

---

# PART 2 — Create the Google project / 建立谷歌项目

## Step 3 — Open Google Cloud / 打开 Google Cloud

Open Chrome or Edge and go to:

```text
https://console.cloud.google.com/
```

Sign in with the Google account that will own this app.
使用负责管理此应用的谷歌账号登录。

## Step 4 — Create a Google Cloud project / 建立谷歌云项目

1. At the top, click the project-name box.
2. Click **New Project / 新建项目**.
3. Project name:

```text
KG Ceiling Calendar
```

4. Click **Create / 创建**.
5. Select the new project after it is created.

## Step 5 — Enable Google Calendar API / 开启谷歌日历 API

1. Open the left menu `☰`.
2. Click **APIs & Services / API 和服务**.
3. Click **Library / 库**.
4. Search:

```text
Google Calendar API
```

5. Click **Google Calendar API**.
6. Click **Enable / 启用**.

Do not choose another calendar product. It must say **Google Calendar API**.
不要选其他日历产品，必须是 **Google Calendar API**。

---

# PART 3 — Set up the Google permission screen / 设置谷歌授权页面

## Step 6 — Start Google Auth Platform / 启动谷歌授权平台

1. Open the left menu `☰`.
2. Click **Google Auth Platform**.
3. If you see **Get Started / 开始使用**, click it.

Enter:

```text
App name / 应用名称:
KG Ceiling Work Calendar
```

Choose your own email for:

```text
User support email / 用户支持电子邮件
```

Click **Next / 下一步**.

## Step 7 — Choose the audience / 选择用户类型

Choose:

```text
External / 外部
```

Use External when the staff are using normal Gmail accounts or accounts outside one Google Workspace organisation.
如果员工使用普通 Gmail 或不同公司的谷歌账号，请选择 External / 外部。

Enter your email under contact information, accept the policy acknowledgement, and finish the setup.
填写联系邮箱、勾选政策确认并完成。

## Step 8 — Add the required permissions / 添加需要的权限

Inside **Google Auth Platform**:

1. Click **Data Access / 数据访问**.
2. Click **Add or remove scopes / 添加或移除范围**.
3. Add these two exact scopes:

```text
https://www.googleapis.com/auth/calendar.events
https://www.googleapis.com/auth/calendar.calendarlist.readonly
```

What they do:

```text
calendar.events
View, create, edit and delete calendar events.
查看、新增、修改和删除日历事项。

calendar.calendarlist.readonly
Read the calendar list and the calendar's default colour only.
只读取日历列表和日历默认颜色。
```

4. Save the scopes.

Do not add Drive, Gmail or Contacts permission. This app does not need them.
不要添加云端硬盘、Gmail 或通讯录权限，本应用不需要。

## Step 9 — Add yourself and staff as test users / 添加测试用户

1. Click **Audience / 受众群体**.
2. Find **Test users / 测试用户**.
3. Click **Add users / 添加用户**.
4. Add your own Gmail address.
5. Add every staff Gmail address that will use the app.
6. Save.

Example:

```text
boss@gmail.com
foreman@gmail.com
staff@gmail.com
```

While the app remains in Testing, only the accounts listed here should be used.
应用处于测试状态时，只使用这里列出的账号。

---

# PART 4 — Create the Google Web Client ID / 建立谷歌网页客户端 ID

## Step 10 — Create the client / 建立客户端

Inside **Google Auth Platform**:

1. Click **Clients / 客户端**.
2. Click **Create Client / 创建客户端**.
3. Application type:

```text
Web application / Web 应用
```

4. Name:

```text
KG Ceiling GitHub Website
```

## Step 11 — Add the authorized website origin / 添加授权网站来源

Under **Authorized JavaScript origins / 已获授权的 JavaScript 来源**, click **Add URI / 添加 URI**.

Enter exactly:

```text
https://kg-beep88.github.io
```

Important:

```text
CORRECT:
https://kg-beep88.github.io

WRONG:
https://kg-beep88.github.io/KGcall/
```

The JavaScript origin ends after `.io` and does not include the repository folder.
JavaScript 来源在 `.io` 后结束，不包含项目文件夹。

For this build, do not add an Authorized redirect URI unless Google specifically asks for one. The app uses Google's popup token client and the authorized JavaScript origin.
本版本使用谷歌弹窗授权和 JavaScript 来源，通常不需要填写跳转网址。

5. Click **Create / 创建**.
6. Copy the **Client ID**.

It looks like:

```text
123456789012-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

Do not copy the Client Secret. This browser app only uses the Client ID.
不要复制 Client Secret，本网页应用只使用 Client ID。

---

# PART 5 — Put your Google Client ID into the app / 把客户端 ID 放进应用

## Step 12 — Open config.js / 打开 config.js

1. Go back to the extracted `kg-ceiling-calendar` folder.
2. Right-click:

```text
config.js
```

3. Click **Open with / 打开方式**.
4. Choose **Notepad / 记事本**.

Find:

```javascript
GOOGLE_CLIENT_ID: "695871721774-1e7q94tl17ekbquihm3f5uq37r8k5hu8.apps.googleusercontent.com",
```

Replace only the text inside the quotation marks with the new Client ID you copied.
只替换引号里面的客户端 ID。

Example:

```javascript
GOOGLE_CLIENT_ID: "YOUR-NEW-CLIENT-ID.apps.googleusercontent.com",
```

Do not remove:

```text
GOOGLE_CLIENT_ID:
quotation marks " "
comma ,
```

## Step 13 — Add real foremen and workers / 添加真实头手和工人

In the same `config.js`, find:

```javascript
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
```

Replace the sample names with real names.
把示范名字换成真实名字。

Example:

```javascript
FOREMEN: [
  "Ah Mun / 阿文",
  "Ah Han / 阿汉",
  "Faizul / 法伊祖"
],

WORKERS: [
  "Ali / 阿里",
  "Rahman / 拉曼",
  "Xiao Hei / 小黑",
  "Ah Bao / 阿宝"
]
```

Rules:

1. Every name stays inside quotation marks.
2. Put a comma after every line except the final line in that list.
3. Do not remove the square brackets `[ ]`.
4. Do not change the words `FOREMEN` or `WORKERS`.

Click:

```text
File / 文件 → Save / 保存
```

Close Notepad.

---


## IMPORTANT — Make everybody use the same “KG Work” calendar
## 重要 — 让所有人使用同一个“KG Work”日历

Before uploading the app, create a separate Google Calendar called **KG Work** using the permanent company or boss Google account.
上传应用之前，请使用公司的永久谷歌账号或老板账号建立一个叫 **KG Work** 的独立日历。

1. Open Google Calendar on a computer.
2. Beside **Other calendars / 其他日历**, click `+`.
3. Choose **Create new calendar / 创建新日历**.
4. Name it `KG Work`.
5. Open **KG Work → Settings and sharing / 设置和共享**.
6. Add every staff Gmail under **Share with specific people / 与特定人员共享**.
7. Give normal staff **Make changes to events / 更改活动** permission.
8. Under **Integrate calendar / 集成日历**, copy the **Calendar ID / 日历 ID**.

The ID normally looks like:
日历 ID 通常类似：

```text
abcdef123456789@group.calendar.google.com
```

In `config.js`, replace:
在 `config.js` 中把：

```javascript
CALENDAR_ID: "PASTE_KG_WORK_CALENDAR_ID_HERE",
```

with your copied ID:
改成您复制的 ID：

```javascript
CALENDAR_ID: "abcdef123456789@group.calendar.google.com",
```

Keep the quotation marks and comma. Every user must have access to this same calendar.
保留引号和逗号。每个用户都必须拥有这个共享日历的权限。

---

# PART 6 — Create the GitHub repository / 建立 GitHub 项目

## Step 14 — Open GitHub / 打开 GitHub

Go to:

```text
https://github.com/
```

Sign in to:

```text
kg-beep88
```

## Step 15 — Check whether KGcall already exists / 检查 KGcall 是否已经存在

Open your repositories and look for:

```text
KGcall
```

### When KGcall does not exist / 如果 KGcall 不存在

1. Click the `+` at the top-right.
2. Click **New repository / 新建存储库**.
3. Repository name:

```text
KGcall
```

4. Choose:

```text
Public / 公开
```

5. Do not add a README, `.gitignore`, or licence.
6. Click **Create repository / 创建存储库**.

### When KGcall already exists / 如果 KGcall 已经存在

Open the existing `KGcall` repository. You do not need to create another one.
打开原有的 `KGcall`，不需要再建立一个。

---

# PART 7 — Upload the website without PowerShell / 不用 PowerShell 上传网站

This is the easiest method for a beginner.
这是新手最简单的方法。

## Step 16 — Upload all project files / 上传全部项目文件

Inside the GitHub `KGcall` repository:

1. Click **Add file / 添加文件**.
2. Click **Upload files / 上传文件**.
3. On your computer, open the extracted folder:

```text
kg-ceiling-calendar
```

4. Select all of these:

```text
index.html
app.js
styles.css
config.js
sw.js
manifest.webmanifest
privacy.html
README_DONKEY_STEPS.md
icons folder
```

5. Drag them into the GitHub upload box.

Very important:

```text
CORRECT:
index.html is visible at the top level of KGcall.

WRONG:
KGcall/kg-ceiling-calendar/index.html
```

The `index.html` file must be directly inside the repository root.
`index.html` 必须直接放在项目最外层。

6. Under commit message, type:

```text
First KG ceiling calendar upload
```

7. Click **Commit changes / 提交更改**.

### If old files already exist / 如果已经有旧文件

Uploading files with the same names replaces them with the new versions when committed.
上传同名文件并提交后，会使用新版本。

If an old unrelated folder remains, it normally does not stop the app, provided the new `index.html` is at the repository root.
只要新的 `index.html` 在最外层，其他旧文件夹通常不会影响应用。

---

# PART 8 — Turn on GitHub Pages / 开启 GitHub Pages

## Step 17 — Publish the website / 发布网站

Inside the `KGcall` repository:

1. Click **Settings / 设置**.
2. On the left, click **Pages**.
3. Under **Build and deployment / 构建和部署**:
4. Source:

```text
Deploy from a branch
```

5. Branch:

```text
main
```

6. Folder:

```text
/(root)
```

7. Click **Save / 保存**.

The website address is:

```text
https://kg-beep88.github.io/KGcall/
```

When GitHub Pages shows that the site is published, open that address.
当 GitHub Pages 显示网站已发布后，打开上面的网址。

---

# PART 9 — First Google connection / 第一次连接谷歌

## Step 18 — Open the app / 打开应用

Open:

```text
https://kg-beep88.github.io/KGcall/
```

You should see:

```text
KG Ceiling Work Calendar / KG 天花工作日历
```

## Step 19 — Connect Google Calendar / 连接谷歌日历

Click the large button:

```text
Connect Google Calendar / 连接谷歌日历
```

Then:

1. Choose your Google account.
2. Read the requested permissions.
3. Approve the Calendar permissions.
4. The app should show:

```text
Connected / 已连接
```

Google requires a user action to issue a browser access token. Therefore, after the browser token expires or after opening a new browser session, click Connect once again.
谷歌要求用户点击后才能发出浏览器访问令牌，因此令牌过期或重新打开浏览器时，再点击一次连接即可。

### If Google blocks the account / 如果谷歌阻止账号

Go back to:

```text
Google Cloud → Google Auth Platform → Audience → Test users
```

Add that exact Gmail address, save, and try again.
加入该 Gmail、保存，然后重新连接。

### If you see origin or client error / 如果看到来源或客户端错误

Check all three:

```text
1. Client type = Web application
2. Authorized JavaScript origin = https://kg-beep88.github.io
3. config.js contains the same Client ID
```

Do not add `/KGcall/` to the authorized JavaScript origin.
不要在 JavaScript 来源后加入 `/KGcall/`。

---

# PART 10 — Test both-way syncing / 测试双向同步

## Step 20 — Test app to Google Calendar / 测试应用到谷歌日历

In the app:

1. Click today or another date.
2. Click:

```text
+ Add Job / 新增工作
```

3. Enter a test address:

```text
TEST - 7 Mandai Link
```

4. Choose a start time and end time.
5. Choose one foreman and one worker.
6. Choose a colour.
7. Click the fixed bottom button:

```text
Save to Google Calendar / 保存到谷歌日历
```

8. Open normal Google Calendar.
9. Check that the test event is there.
10. Check that the colour is the same.

## Step 21 — Test Google Calendar to app / 测试谷歌日历到应用

In normal Google Calendar:

1. Create a new event.
2. Event title:

```text
TEST FROM GOOGLE CALENDAR
```

3. Choose a Google event colour.
4. Save.
5. Return to the KG app.
6. Click:

```text
Refresh / 刷新
```

The event should appear in the app with the same event colour.
事项应显示在应用中，并使用相同颜色。

The app also refreshes every 60 seconds while it is open and refreshes when you return to the page.
应用打开时每 60 秒自动刷新，回到页面时也会刷新。

## Step 22 — Test Calendar default colour / 测试日历默认颜色

1. Add or edit a job in the app.
2. Choose:

```text
Calendar default / 日历默认
```

3. Save.

The event will not have a separate event colour. It will follow the main colour of the Google Calendar on both sides.
该事项不会使用独立颜色，而是跟随谷歌日历本身的主颜色。

---

# PART 11 — How staff use it every day / 员工每天怎样使用

## Add a job / 新增工作

1. Open the app.
2. Click **Connect Google Calendar / 连接谷歌日历** if it is not connected.
3. Click the job date.
4. Click **Add Job / 新增工作**.
5. Fill in:

```text
Address / 地址
Start date and end date / 开始日期和结束日期
Start and end time / 开始和结束时间
Scope / 工作范围
Remove / 拆除
Keep / 保留
Protect / 保护
Disposal / 清理
Contact / 联系人
Lock number / 密码锁号码
Foremen / 头手
Workers / 工人
Google colour / 谷歌颜色
```

6. Click **Save to Google Calendar / 保存到谷歌日历**.

## Edit a job / 修改工作

1. Click the job.
2. Change the information.
3. Click **Update Google Calendar / 更新谷歌日历**.

## Create a job lasting several days / 建立多日工作

1. Click the first work date. / 点击工作的第一天。
2. Click **Add Job / 新增工作**. / 点击新增工作。
3. Choose **Start date / 开始日期**. / 选择开始日期。
4. Choose **End date / 结束日期**. / 选择结束日期。
5. Enter the start and end time, or tick **All-day job / 全天工作**. / 输入开始和结束时间，或勾选全天工作。
6. Save. / 保存。

Example: Start date 24 July and end date 27 July means the job appears on 24, 25, 26 and 27 July.
例如：开始日期是 7 月 24 日，结束日期是 7 月 27 日，工作会显示在 24、25、26 和 27 日。

## Move a job by dragging / 拖动移动工作

### Computer / 电脑

1. Put the mouse on the coloured job bar in the month calendar. / 把鼠标放在月历的彩色工作条上。
2. Hold the left mouse button. / 按住鼠标左键。
3. Drag it to the new date. / 拖到新日期。
4. Release the mouse. / 放开鼠标。

### Phone / 手机

1. Press and hold the coloured job bar for a short moment. / 短暂长按彩色工作条。
2. When it lifts, drag it to the new date. / 工作条浮起后，拖到新日期。
3. Release your finger. / 放开手指。

For a multi-day job, the whole job moves together and keeps the same number of days.
多日工作会整体移动，并保留相同天数。

## Copy a job / 复制工作

1. Select the date containing the job. / 选择有该工作的日期。
2. Press **Copy / 复制** beside the job. / 点击工作旁边的复制。
3. Choose the new start and end dates. / 选择新的开始和结束日期。
4. Check the details. / 检查资料。
5. Save. / 保存。

The app creates a new Google event without copying Google's protected event identifier. Old delivery, hoarding-completion and billing-completion records are cleared from the copied job to avoid false records.
应用会建立新的谷歌事项，不会复制谷歌受保护的事项编号。复制时会清除旧的送货、围板完成和开单完成记录，避免错误记录。

## Delete a job / 删除工作

Easy method / 简单方法：

1. Select the job date. / 选择工作日期。
2. Press **Delete / 删除** beside the job. / 点击工作旁边的删除。
3. Confirm. / 确认。

You can also open **Edit / 编辑** and press the red Delete button. The event is removed from both the app and Google Calendar.
也可以打开编辑，再点击红色删除按钮。该事项会同时从应用和谷歌日历删除。

## Prevent double assignment / 防止重复安排人员

When a foreman or worker already has another job on the selected date, the app shows the assigned address beside that person's name.
如果头手或工人在所选日期已有其他工作，应用会在名字旁显示已安排地址。

The warning only applies to the same selected date.
提示只针对同一天。

---


# NEW PART — Address history and site tracking / 地址历史和工地记录

## Search an address / 搜索地址

1. Connect Google Calendar.
2. At the top, find **Address or job name / 地址或工作名称**.
3. Type part of the address, for example `Collyer Quay`.
4. Press **Search History / 搜索记录**.
5. The app groups the same address and shows:
   - Every work date / 所有工作日期
   - Hoarding done date / 围板完成日期
   - Hoarding removal date / 围板拆除日期
   - Delivery dates and materials / 送货日期和材料
   - Billed dates and jobs not billed / 开单日期和未开单工作
6. Press **Edit / 编辑** beside any record to change it.

The search checks the shared KG Work calendar from `HISTORY_START` to `HISTORY_END` in `config.js`.
搜索会检查 `config.js` 中 `HISTORY_START` 到 `HISTORY_END` 的共享 KG Work 日历记录。

## Record hoarding / 记录围板

Inside Add Job or Edit Job:
在新增或编辑工作中：

1. Tick **Hoarding done / 围板已完成**.
2. Confirm or change the completion date.
3. Tick **Hoarding needs removal / 围板需要拆除** when it must be removed later.
4. Enter the planned removal date.

## Record a material delivery / 记录材料送货

1. Tick **Material delivery recorded / 已记录材料送货**.
2. Confirm or change the delivery date.
3. Type the materials, such as gypsum board, metal frame or insulation.
4. Save the job.

Each job event can store one delivery record. If the same address has another delivery on another day, create or edit that day’s event and add that delivery. The address history combines all delivery dates.
每个工作事项可保存一条送货记录。如果同一地址在另一天再送货，请建立或编辑当天的事项。地址历史会汇总所有送货日期。

## Record billing / 记录开单

1. Leave **Job already billed / 工作已开单** unticked while it is not billed.
2. When billed, edit the job and tick it.
3. Confirm or change the billed date.
4. Save.

The day card and address history will show **Billed / 已开单** or **Not billed / 未开单**.
当天工作卡和地址历史会显示 **已开单** 或 **未开单**。

---

# PART 12 — Install on a phone / 安装到手机

## iPhone / 苹果手机

1. Open the website in **Safari**.
2. Tap the Share icon.
3. Tap **Add to Home Screen / 添加到主屏幕**.
4. Tap **Add / 添加**.
5. Open it from the new home-screen icon.

## Android / 安卓手机

1. Open the website in **Chrome**.
2. Tap `⋮`.
3. Tap **Install app / 安装应用** or **Add to Home screen / 添加到主屏幕**.
4. Open it from the new icon.

Each phone user still connects their own Google account.
每位手机用户都要连接自己的谷歌账号。

---

# PART 13 — Give staff access / 给员工使用权限

For every new staff member:

1. Add the staff Gmail address under:

```text
Google Auth Platform → Audience → Test users
```

2. Make sure that account has access to the Google Calendar being used.
3. Send the website address:

```text
https://kg-beep88.github.io/KGcall/
```

4. Ask them to open it and click **Connect Google Calendar / 连接谷歌日历**.

Important: this build is prepared for one shared calendar called **KG Work**. Every staff member must be invited to that calendar, and `CALENDAR_ID` in `config.js` must contain the same shared Calendar ID.
重要：此版本已准备使用一个叫 **KG Work** 的共享日历。每位员工都必须受邀加入该日历，而且 `config.js` 中的 `CALENDAR_ID` 必须填写同一个共享日历 ID。

---

# PART 14 — Updating the app later / 以后更新应用

When a newer ZIP is supplied:

1. Download and extract it.
2. Check `config.js` and keep your real Client ID, foremen and workers.
3. Open GitHub repository `KGcall`.
4. Click **Add file → Upload files**.
5. Upload the new files from inside the new project folder.
6. Commit the changes.
7. Open the app.
8. Click:

```text
Settings / 设置
Reset Cache / 重置缓存
```

9. Reopen the website and connect Google Calendar.

---

# PART 15 — Common problems / 常见问题

## Problem 1 — `Error 401: invalid_client`

Check:

```text
The Client ID in config.js is correct.
The Google client type is Web application.
```

## Problem 2 — `redirect_uri_mismatch` or origin error

Authorized JavaScript origin must be exactly:

```text
https://kg-beep88.github.io
```

Do not add the repository path.
不要加项目路径。

## Problem 3 — `403 insufficient authentication scopes`

Check that `config.js` contains both:

```text
https://www.googleapis.com/auth/calendar.events
https://www.googleapis.com/auth/calendar.calendarlist.readonly
```

Then remove the old app permission from your Google Account, reconnect, and approve both permissions again.
然后在谷歌账号移除旧授权，重新连接并批准两个权限。

## Problem 4 — Staff cannot connect

Add their exact Gmail address under **Test users / 测试用户**.

## Problem 5 — Website shows 404

Check:

```text
Repository name = KGcall
Pages source = main and /(root)
index.html is directly in the repository root
```

## Problem 6 — Old version still appears

In the app, click:

```text
Settings / 设置
Reset Cache / 重置缓存
```

Then close and reopen the website.

## Problem 7 — Google change does not show immediately

Click:

```text
Refresh / 刷新
```

The app also refreshes automatically every 60 seconds while open.

## Problem 8 — Connect button is needed again

This is normal for this free frontend-only GitHub Pages design. Google browser access tokens are temporary, and a new token must be requested through a user action when required.
这是免费纯前端 GitHub Pages 设计的正常情况。谷歌浏览器访问令牌是临时的，需要时必须由用户点击重新取得。

---

# FINAL CHECKLIST / 最后检查表

Tick each item:

```text
[ ] Google Cloud project created
[ ] Google Calendar API enabled
[ ] OAuth audience set
[ ] Two Calendar scopes added
[ ] My Gmail added as a test user
[ ] All staff Gmail accounts added as test users
[ ] Web OAuth Client created
[ ] Authorized JavaScript origin entered correctly
[ ] Client ID copied into config.js
[ ] Real foremen entered
[ ] Real workers entered
[ ] KGcall GitHub repository created/opened
[ ] index.html uploaded to repository root
[ ] GitHub Pages uses main and /(root)
[ ] Website opens
[ ] Google Calendar connects
[ ] App-to-Google test passed
[ ] Google-to-app test passed
[ ] Colours match on both sides
[ ] Phone home-screen installation tested
```

---

# IMPORTANT LIMITS / 重要限制

1. Sync is close to real time, not a permanent Google server push. The app refreshes every 60 seconds, when the page becomes active, and after app changes.
2. Never put a Google access token or Client Secret in `config.js`.
3. The Client ID is the only Google credential placed in browser code.
4. Events created directly in Google Calendar may not contain all KG work fields. The app still displays them; editing them inside the app converts the description into the KG work format.
5. The current free GitHub Pages version cannot keep a permanent Google background login because it has no secure backend server for storing refresh tokens.

