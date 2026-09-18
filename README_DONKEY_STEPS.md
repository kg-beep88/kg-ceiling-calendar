# KG Ceiling Calendar v1.7.36 — Job Shows Delivery/Clear Site Status

## v1.7.36 important fix

- Delivery / 送货 and Clear Site / 清场 stay attached to the original work job.
- Their 5 mm status bars show on that work job even when the delivery/clear-site date is different from the work date.
- Example: work is 09/09/2026 and Clear Site is 12/09/2026. The 09/09 work job shows the yellow Clear Site bar. The app does not create another status-only job on 12/09.
- Material / 料单 = light-blue 5 mm bar.
- Delivery Sent / 已送货 = dark-blue 5 mm bar.
- Clear Site / 清场 = yellow 5 mm bar.
- The latest Delivery row controls the blue status; Clear Site remains independent.
- Copy / Duplicate starts blank for Delivery and Clear Site.
- Same-address history remains read-only and can show prior service date + vehicle without applying status to another job.

## Upload to GitHub Pages

1. Back up your current KGcall repository.
2. Unzip this file.
3. Upload/replace the files in the repository root.
4. Open the KG Calendar website.
5. Go to Settings / 设置 → Reset Cache / 重置缓存 once.
6. Confirm the app shows v1.7.36.


## v1.7.36 Same-address history
- Delivery and Clear Site remain job-specific only.
- The Add/Edit Job form can show previous Delivery and Clear Site records for the same address.
- History shows the date and vehicle used.
- This history is read-only and does not copy blue/yellow bars to the current job.
- Search/Site History also shows the Clear Site vehicle beside the Clear Site date.
