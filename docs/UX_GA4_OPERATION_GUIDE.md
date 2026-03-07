# UX GA4 Operation Guide (ISSUE-11)

## Purpose
- Convert ISSUE-11 success metrics into reproducible GA4 checks.
- Allow baseline vs after comparison without ad-hoc queries.

## 1) Preconditions
- GA4 measurement is enabled in production (`VITE_GA_MEASUREMENT_ID`).
- Latest UX events are deployed.
- Measurement window is fixed to 7 days.

## 2) Event Parameters to Register (GA4 Custom Dimensions)
- Event parameter: `page`
- Event parameter: `device`
- Event parameter: `elapsed_ms`
- Event parameter: `cta`
- Event parameter: `target`
- Event parameter: `source`
- Event parameter: `best_market`
- Event parameter: `category`
- Event parameter: `monthly_qty`

## 3) Explore Setup
1. Open GA4 -> Explore -> Free form.
2. Add dimensions:
   - `Event name`
   - `Date`
   - `Device category`
   - custom dimensions above
3. Add metrics:
   - `Event count`
   - `Total users`
4. Create segments:
   - `Home users` (page path contains `/`)
   - `Mobile users` (device category = mobile)
   - `Desktop users` (device category = desktop)

## 4) KPI Queries

### A. First Input Completion Rate
- Numerator: users with `event_name = ux_first_input_completed`
- Denominator: users with first `page_view` on `/`
- Formula: numerator / denominator

### B. Time To Result (Median)
- Filter: `event_name = ux_results_viewed`
- Metric: median of `elapsed_ms`
- Track separately by device.

### C. CTA Click Rate
- Numerator: users with `event_name = ux_summary_cta_click`
- Denominator: users with `event_name = ux_results_viewed`
- Breakdown by `cta` (`share`, `detail_table`).

### D. Mobile Bounce Proxy
- Segment: mobile users on `/`
- Count users with:
  - exactly one `page_view`
  - and no `ux_*` events
- Formula: above users / mobile home users

## 5) Reporting Rule
- Use two windows:
  - Baseline 7 days before deploy
  - After 7 days after deploy
- Fill `docs/UX_MEASUREMENT_REPORT_TEMPLATE.md` with exact values.
- Mark ISSUE-11 done only when all KPI deltas are computed.

## 6) Data Quality Checks
- `ux_results_viewed` should appear at least once per active session.
- `elapsed_ms` must be positive integer.
- `ux_summary_cta_click` should include `cta`.
- `ux_section_navigate` should include `target` and `source`.
