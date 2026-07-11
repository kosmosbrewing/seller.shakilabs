import { describe, expect, it } from 'vitest'
import { SELLER_RELATED_ACTIONS } from './sellerRelatedActions'

describe('SELLER_RELATED_ACTIONS', () => {
  it('실제 운영 경로로 연결하고 목적이 드러나는 문구를 사용한다', () => {
    expect(SELLER_RELATED_ACTIONS).toHaveLength(3)
    expect(SELLER_RELATED_ACTIONS.map((item) => item.href)).toEqual([
      '/seller/payment-compare',
      '/seller/shipping-compare',
      '/biz/vat-compare',
    ])
    expect(SELLER_RELATED_ACTIONS.every((item) => item.title.length >= 8)).toBe(true)
  })
})
