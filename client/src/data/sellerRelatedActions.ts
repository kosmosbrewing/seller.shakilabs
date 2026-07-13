export const SELLER_RELATED_ACTIONS = [
  {
    key: 'payment_fee_compare',
    title: '결제수단별 수수료 비교',
    description: '카드·계좌이체·간편결제 비용을 반영해 실제 정산액을 다시 확인합니다.',
    href: '/seller/payment-compare',
  },
  {
    key: 'shipping_cost_compare',
    title: '배송비까지 포함해 비교',
    description: '택배 계약과 포장비를 더해 주문 한 건의 전체 비용을 계산합니다.',
    href: '/seller/shipping-compare',
  },
  {
    key: 'vat_compare',
    title: '판매 결과로 부가세 점검',
    description: '예상 매출 다음 단계로 일반·간이과세의 부가세 차이를 비교합니다.',
    href: '/biz/vat-compare',
  },
] as const
