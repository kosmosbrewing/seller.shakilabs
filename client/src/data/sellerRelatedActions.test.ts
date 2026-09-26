import { describe, expect, it } from 'vitest'
import { SELLER_RELATED_ACTIONS } from './sellerRelatedActions'

type Item = (typeof SELLER_RELATED_ACTIONS)[number]

// 실제로 열리는 주소 — 라우터 경로(to)에는 앱 base(vite.config.ts "/seller/")가 붙고, 다른 앱(href)은 그대로다
const liveUrl = (item: Item): string => ('to' in item ? `/seller${item.to}` : item.href)

describe('SELLER_RELATED_ACTIONS', () => {
  it('실제 운영 경로로 연결한다 — seller 화면은 라우터 경로, biz 화면은 절대 경로 하나만', () => {
    expect(SELLER_RELATED_ACTIONS).toHaveLength(3)
    expect(SELLER_RELATED_ACTIONS.map(liveUrl)).toEqual([
      '/seller/payment-compare',
      '/seller/shipping-compare',
      '/biz/vat-compare',
    ])
    expect(SELLER_RELATED_ACTIONS.every((item) => ('to' in item) !== ('href' in item))).toBe(true)
  })

  it('분석 이벤트 to_tool로 쓰이는 key를 바꾸지 않는다', () => {
    expect(SELLER_RELATED_ACTIONS.map((item) => item.key)).toEqual([
      'payment_fee_compare',
      'shipping_cost_compare',
      'vat_compare',
    ])
  })

  it('카드 조건은 한 줄(28자 이내)이다', () => {
    expect(SELLER_RELATED_ACTIONS.every((item) => item.note.length > 0 && item.note.length <= 28)).toBe(true)
  })
})
