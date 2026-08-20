# KG Ceiling Calendar v1.7.32 — Job-Only Delivery & Clear Site

## v1.7.32 Delivery / Clear Site rule

- Delivery / 送货 is saved only on the job being edited.
- Clear Site / 清场 is saved only on the job being edited.
- Jobs with the same address do NOT exchange or merge Delivery/Clear Site data.
- Copy / Duplicate starts with Delivery and Clear Site blank, so blue/yellow bars do not carry over.
- To remove a record, untick the status, clear the visible date/vehicle if needed, and Save. A fully blank delivery row is deleted from that job.
- Material / 料单 remains light blue, Delivery Sent / 已送货 remains dark blue, Clear Site / 清场 remains yellow.



## v1.7.32 Clear Site hard fix

- Unticking **Clear Site / 清场** removes it from the current job and it stays removed after Save/reload.
- Other jobs are no longer changed when this job is saved.
- The yellow 5 mm bar stays date-specific and disappears after the cleared record is removed.

## v1.7.32 Clear Site removal fix

- Untick **Clear Site / 清场** and save to remove that clear-site record.
- The old clear-site date/vehicle are cleared when the checkbox is unticked.
- There is no same-address Delivery/Clear Site synchronization in v1.7.32.
- The yellow 5 mm bar disappears after the cleared status is removed.

## v1.7.32 update

- Delivery / 送货 is job-specific and does not sync to other jobs with the same address.
- Clear Site / 清场 is job-specific and only affects the job where it is saved.
- The yellow 5 mm Clear Site bar appears only on the exact clear-site date.
- Site history shows Clear Site / 清场 as the clear date only.
- Clear Site vehicle is still saved in the Google Calendar record, but the site-history summary shows only the date.
- If Clear Site is ticked and no clear date is entered, the current job date is used automatically.

## Upload to GitHub Pages

1. Back up your current KGcall repository.
2. Unzip this file.
3. Upload/replace the files in the repository root.
4. Open the KG Calendar website.
5. Go to Settings / 设置 → Reset Cache / 重置缓存 once.
6. Confirm the app shows v1.7.32.


## v1.7.32 Same-address history
- Delivery and Clear Site remain job-specific only.
- The Add/Edit Job form can show previous Delivery and Clear Site records for the same address.
- History shows the date and vehicle used.
- This history is read-only and does not copy blue/yellow bars to the current job.
- Search/Site History also shows the Clear Site vehicle beside the Clear Site date.
