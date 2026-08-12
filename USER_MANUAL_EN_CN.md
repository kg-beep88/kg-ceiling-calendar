# v1.7.15 Quick Update / 快速更新


## v1.7.20 update

Delivery in Add/Edit Job is now arranged as:

1. Material / 料单 and Delivery Sent / 已送货 checkboxes
2. Date / 日期
3. Vehicle / 车辆 dropdown
4. Clear Site / 清场 checkbox
5. Clear Site Date / 清场日期
6. Clear Site Vehicle / 清场车辆 dropdown

Vehicle dropdown choices are fixed in the app code: YN8209T, YP8209B, YQ6498Y, GBE6680Y, GBG8121X, GBF291X, YR2464R. Multiple Delivery rows are still supported and same-address delivery/clear-site records continue to sync. Delivery Sent replaces Material for the same delivery row.

## Day View / 日视图
Row order / 排列：
1. Installer / 安装人员
2. ID Name / ID 联系人姓名
3. Address / 地址
4. WhatsApp Copy / 复制单个工地

## Delivery / 送货
Every delivery can have two marks / 每次送货有两个勾选：
- Material / 料单 → light-blue 5 mm bar / 浅蓝色 5mm 条
- Delivery Sent / 已送货 → dark-blue 5 mm bar / 深蓝色 5mm 条

Tick the required box in Add/Edit Job → Deliver, then save to Google Calendar.
在新增/编辑工作 → 送货中勾选，然后保存到谷歌日历。


## v1.7.19 update
- Day View now shows the same Search / 搜索 bar as Month View.
- Material / 料单 and Delivery Sent / 已送货 are one-status-only for each delivery row.
- Marking Delivery Sent automatically clears Material for that same delivery. Marking Material clears Delivery Sent.
- The address status rail shows only the current/latest delivery row. If Delivery 2 exists, Delivery 2 status is the one shown.
