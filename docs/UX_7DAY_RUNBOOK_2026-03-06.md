# UX 7-Day Runbook (Starting March 6, 2026)

## Fixed Timeline
- Day 0 (Deploy): March 6, 2026
- Baseline window: February 27, 2026 ~ March 5, 2026
- After window: March 6, 2026 ~ March 12, 2026
- Report day: March 13, 2026

## Day-by-Day Checklist
1. March 6, 2026
- Deploy UX instrumentation build
- Verify GA4 DebugView events:
  - `ux_first_input_completed`
  - `ux_results_viewed`
  - `ux_summary_cta_click`
  - `ux_share_modal_open`
- Owner:

2. March 7-12, 2026
- Monitor event integrity (missing parameters, sudden drop)
- Recruit 5 participants (mobile 3 / desktop 2)
- Run moderated usability tests and fill:
  - `docs/UX_USABILITY_RESULTS_TEMPLATE.md`
- Owner:

3. March 13, 2026
- Fill `docs/UX_MEASUREMENT_REPORT_TEMPLATE.md`
- Run KPI evaluator:
  - `node scripts/ux/evaluate-kpi.mjs docs/UX_KPI_INPUT_EXAMPLE.json`
- Mark ISSUE-11 status based on KPI + usability outcomes
- Owner:

## Exit Criteria
- KPI targets evaluated with baseline vs after values
- 5 usability sessions completed and summarized
- ISSUE-11 moved to resolved or reopened with concrete follow-up items
