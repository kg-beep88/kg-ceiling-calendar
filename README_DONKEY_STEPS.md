# KG Ceiling Calendar v1.7.15 — Day Row + Delivery Status


## v1.7.21 update

- Clear Site / 清场 now shows a yellow 5 mm status rail on the back/right of the address bar.
- If the latest delivery also has Material or Delivery Sent status, the yellow rail appears beside the blue rail.


Delivery in Add/Edit Job is now arranged as:

1. Material / 料单 and Delivery Sent / 已送货 checkboxes
2. Date / 日期
3. Vehicle / 车辆 dropdown
4. Clear Site / 清场 checkbox
5. Clear Site Date / 清场日期
6. Clear Site Vehicle / 清场车辆 dropdown

Vehicle dropdown choices are fixed in the app code: YN8209T, YP8209B, YQ6498Y, GBE6680Y, GBG8121X, GBF291X, YR2464R. Multiple Delivery rows are still supported and same-address delivery/clear-site records continue to sync. Delivery Sent replaces Material for the same delivery row.

## Upload
1. Unzip this file.
2. Upload all files inside to the root of GitHub repository `KGcall`.
3. Open the KG Calendar website.
4. Settings / 设置 → Reset Cache / 重置缓存.
5. Confirm the app shows v1.7.15.

## Day View row order
Installer Name → ID Name/detail → Address → WhatsApp Copy.
The coloured address section is reduced to about half of the row.

## Delivery status
Each delivery record now has TWO separate checkboxes:
- Material / 料单 — light-blue 5 mm strip at the back/right of the Day View address bar.
- Delivery Sent / 已送货 — dark-blue 5 mm strip at the back/right of the Day View address bar.

If both are ticked, both 5 mm strips are shown.
Existing old checked Delivery Sent values from v1.7.14 and older are migrated to Material / 料单.
Both statuses continue syncing across all KG jobs with the same address through Google Calendar.


## v1.7.19 update
- Day View now shows the same Search / 搜索 bar as Month View.
- Material / 料单 and Delivery Sent / 已送货 are one-status-only for each delivery row.
- Marking Delivery Sent automatically clears Material for that same delivery. Marking Material clears Delivery Sent.
- The address status rail shows only the current/latest delivery row. If Delivery 2 exists, Delivery 2 status is the one shown.
