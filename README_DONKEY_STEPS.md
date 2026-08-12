# KG Ceiling Calendar v1.7.15 — Day Row + Delivery Status

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
