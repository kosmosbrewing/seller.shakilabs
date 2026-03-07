# UX Measurement Report Template (ISSUE-11)

## 1) Scope
- Service: seller.shakilabs.com
- Measurement period: YYYY-MM-DD ~ YYYY-MM-DD (7 days)
- Segment:
  - Device: mobile / desktop
  - Route: `/`

## 2) Event Definitions
- `ux_first_input_completed`
- `ux_results_viewed`
- `ux_summary_cta_click` (`cta=share|detail_table`)
- `ux_section_navigate` (`target=results|simulation|fee-table`)
- `ux_open_simulation`
- `ux_open_fee_table`
- `ux_share_modal_open`
- `ux_share_link_copy_success` / `ux_share_link_copy_fail`
- `ux_share_kakao_success` / `ux_share_kakao_fail`

## 3) KPI Mapping
- First input completion rate:
  - `ux_first_input_completed` unique users / home page unique users
- Time to result:
  - median(`ux_results_viewed.elapsed_ms`)
- CTA click rate:
  - (`ux_summary_cta_click` users / `ux_results_viewed` users)
- Mobile bounce proxy:
  - mobile users with only one page_view and no UX event / mobile home users

## 4) Baseline vs After
- Baseline window: YYYY-MM-DD ~ YYYY-MM-DD
- After window: YYYY-MM-DD ~ YYYY-MM-DD

| KPI | Baseline | After | Delta | Target | Result |
|-----|----------|-------|-------|--------|--------|
| First input completion rate |  |  |  | +20% |  |
| Time to result (median ms) |  |  |  | -30% |  |
| CTA click rate |  |  |  | +15% |  |
| Mobile bounce proxy |  |  |  | -15% |  |

## 5) Findings
- What improved:
- What did not:
- Suspected causes:

## 6) Next Actions
1. 
2. 
3. 
