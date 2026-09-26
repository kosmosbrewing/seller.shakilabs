import type { NextActionItem } from '@shakilabs/ui'

// 홈 "이어서 계산하기" 한 블록의 항목 — 화면(SellerRelatedActions)과 테스트가 이 목록 하나를 쓴다.
// key는 분석 이벤트 to_tool 값이라 바꾸지 않는다. seller 화면은 라우터 경로(to, base가 붙는다),
// biz 화면은 다른 앱이라 절대 경로(href)로 보낸다.
export const SELLER_RELATED_ACTIONS = [
  {
    key: 'payment_fee_compare',
    title: '결제 수수료 비교',
    to: '/payment-compare',
    note: '토스페이먼츠·네이버페이 등 PG사별 카드 수수료',
  },
  {
    key: 'shipping_cost_compare',
    title: '택배비 비교',
    to: '/shipping-compare',
    note: '일반 택배 6사 · 편의점 택배 2사 운임',
  },
  {
    key: 'vat_compare',
    title: '부가세 비교',
    href: '/biz/vat-compare',
    note: '일반·간이과세 부가세 차이',
  },
] as const satisfies readonly NextActionItem[]
