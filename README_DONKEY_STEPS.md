# KG Ceiling Calendar v1.7.30 — Clear Site Date-Only Status


## v1.7.30 Clear Site hard fix

- Unticking **Clear Site / 清场** now removes that exact delivery/date clear-site record from all stale same-address copies.
- Other Clear Site dates at the same address are kept.
- The yellow 5 mm bar stays date-specific and disappears after the cleared record is removed.

## v1.7.30 Clear Site removal fix

- Untick **Clear Site / 清场** and save to remove that clear-site record.
- The old clear-site date/vehicle are cleared when the checkbox is unticked.
- Same-address delivery sync will no longer restore the old Clear Site status from the event being edited.
- The yellow 5 mm bar disappears after the cleared status is removed.

## v1.7.30 update

- Delivery / 送货 still syncs across all jobs with the same address.
- Clear Site / 清场 is now date-specific and no longer stays active on every date for the same address.
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
6. Confirm the app shows v1.7.30.
