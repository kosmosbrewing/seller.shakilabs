# UX Usability Test Script (ISSUE-11)

## Recruit
- Participants: 5
  - Mobile: 3
  - Desktop: 2
- Profile: online sellers or prospective sellers

## Environment
- URL: production home page
- Devices:
  - iPhone/Android latest browser
  - Desktop Chrome latest
- Record:
  - Task completion (Y/N)
  - Time-on-task (seconds)
  - Misclick count
  - Confidence score (1-5)

## Tasks
1. Enter a sample product condition and identify the best market.
2. Find how much fee difference there is versus the worst market.
3. Open detailed comparison table and confirm ranking order.
4. Open monthly simulation and set custom monthly quantity.
5. Share result via link copy.

## Success Criteria
- Task success rate >= 80%
- Median time to identify best market <= 30s
- Median misclick <= 2
- Confidence score average >= 4.0/5

## Interview Questions
1. Which part helped you decide fastest?
2. Which part felt confusing or dense?
3. Did the CTA labels match your expectation?
4. On mobile, was any interaction hard to tap/read?

## Report Format
| Participant | Device | T1 | T2 | T3 | T4 | T5 | Time to best market(s) | Misclicks | Confidence |
|-------------|--------|----|----|----|----|----|-------------------------|-----------|------------|

## Decision Rules
- If success rate < 80% on any core task (T1/T2), reopen ISSUE-11.
- If mobile misclick median > 2, prioritize touch target/layout fixes.
