<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import { useConstantsStore } from "@/stores/constants";
import { FEE_DATA_VERIFIED } from "@/data/marketFees";
import { PAYMENT_DATA_VERIFIED } from "@/data/paymentGateways";
import { SHIPPING_DATA_VERIFIED } from "@/data/shippingRates";

const constantsStore = useConstantsStore();
</script>

<template>
  <SEOHead
    title="이용약관"
    description="오픈마켓 수수료·결제 수수료·택배비 비교 계산기의 이용 조건과 계산 결과의 한계를 밝히는 이용약관입니다."
  />

  <div class="container py-5">
    <div class="retro-panel">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">이용약관</h1>
      </div>

      <div class="retro-panel-content space-y-4">
        <p class="text-body text-muted-foreground">
          shakilabs.com/seller(오픈마켓 수수료 비교 계산기, 이하 "본 서비스")을 이용해 주셔서 감사합니다.
          본 서비스를 이용함으로써 아래 약관에 동의하게 됩니다.
        </p>

        <h2 class="text-heading font-bold">1. 서비스 개요</h2>
        <p class="text-body text-muted-foreground">
          본 서비스는 오픈마켓 셀러가 판매 채널을 고를 때 참고할 수 있도록 만든 무료 비교 도구이며,
          다음 세 가지 계산 화면으로 구성됩니다.
        </p>
        <ul class="text-body text-muted-foreground space-y-1 list-disc list-inside">
          <li>
            <span class="font-bold text-foreground">오픈마켓 수수료 비교</span> —
            스마트스토어·쿠팡·11번가·G마켓/옥션에 같은 상품을 올렸을 때의 수수료와 정산 후 순이익을
            비교하고, 원하면 자사몰 결제수단(토스페이먼츠·네이버페이·카카오페이·PAYCO)까지 함께 놓고 봅니다.
          </li>
          <li>
            <span class="font-bold text-foreground">결제 수수료 비교</span> —
            PG·간편결제 서비스의 고정비, 카드 수수료, 정산 주기를 공시 요금표 기준으로 비교합니다.
          </li>
          <li>
            <span class="font-bold text-foreground">택배비 비교</span> —
            일반 택배 6사(CJ대한통운·한진·로젠·우체국·경동·롯데)와 편의점 택배 2사(CU·GS25)의
            예상 운임을 무게와 크기 기준으로 비교합니다.
          </li>
        </ul>
        <p class="text-body text-muted-foreground">
          회원가입·로그인 없이 누구나 이용할 수 있고, 계산에 입력한 값은 브라우저 안에서만 처리되며
          서버로 전송되거나 저장되지 않습니다. 본 서비스는 어떤 오픈마켓·PG사·택배사와도 제휴·대리
          관계가 없으며, 특정 채널로의 입점이나 계약을 중개하지 않습니다.
        </p>

        <h2 class="text-heading font-bold">2. 요율 데이터의 출처와 갱신</h2>
        <p class="text-body text-muted-foreground">
          수수료율과 운임은 각 오픈마켓 판매자센터, PG사 요금 안내, 택배사 공시 운임표를 원본으로 삼아
          입력하며, 마지막 공식 문서 대조 시점을 화면에 표기합니다
          (마켓 수수료 {{ FEE_DATA_VERIFIED }} · 결제 수수료 {{ PAYMENT_DATA_VERIFIED }} ·
          택배비 {{ SHIPPING_DATA_VERIFIED }} 기준). 요율이 바뀌면 확인일을 갱신하지만, 공식 고지와
          본 서비스 반영 사이에는 시차가 생길 수 있습니다. 금액이 중요한 의사결정이라면 결제 직전
          해당 마켓·택배사의 최신 고지를 다시 확인하시기 바랍니다.
        </p>

        <h2 class="text-heading font-bold">3. 계산 결과의 성격과 한계</h2>
        <p class="text-body text-muted-foreground">
          본 서비스가 내놓는 값은 공개 요율을 대입한 추정치이며, 세무·회계 자문이나 정산 확정액이
          아닙니다. 특히 다음 항목은 계산에 포함되지 않으므로 실제 입금액과 차이가 납니다.
        </p>
        <ul class="text-body text-muted-foreground space-y-1 list-disc list-inside">
          <li>마켓·판매자별로 개별 협의된 수수료율, 신규 셀러 프로모션, 기간 한정 수수료 인하</li>
          <li>광고비(검색광고·쇼핑 노출), 쿠폰·할인 부담금, 반품·교환에 따른 왕복 운임</li>
          <li>도서·산간 지역 할증과 부피 무게 적용 등 접수 시점에 확정되는 택배 추가 요금</li>
          <li>부가가치세 신고·환급 결과, 간이과세 여부에 따른 실효 부담 차이</li>
          <li>매출등급(영세·중소)은 국세청 기준으로 사후 산정되므로, 화면에서 고른 등급과 실제 적용 등급이 다를 수 있습니다</li>
        </ul>
        <p class="text-body text-muted-foreground">
          따라서 본 서비스는 채널 선택의 방향을 잡는 참고 자료로만 사용하시고, 판매·정산·입점에 관한
          최종 판단과 그 결과에 대한 책임은 이용자 본인에게 있습니다. 운영자는 계산 결과를 근거로 한
          비즈니스 결정의 손실에 대해 책임을 지지 않습니다.
        </p>

        <h2 class="text-heading font-bold">4. 공유 링크 이용 시 유의사항</h2>
        <p class="text-body text-muted-foreground">
          오픈마켓 수수료 비교 화면의 입력값은 주소 쿼리스트링에 반영되므로, 링크를 공유하면 판매가와
          월 판매수량이 상대에게 그대로 보입니다. 원가 수준이 노출되지 않도록 공유 대상을 확인한 뒤
          링크를 전달하시기 바랍니다.
        </p>

        <h2 class="text-heading font-bold">5. 지식재산권 및 금지 행위</h2>
        <p class="text-body text-muted-foreground">
          본 서비스의 디자인, 코드, 해설 콘텐츠에 대한 저작권은 서비스 운영자에게 있습니다.
          계산 결과 화면의 공유·인용은 출처를 밝히는 조건으로 자유롭게 하실 수 있으나,
          요율 데이터를 자동 수집해 별도 서비스로 재구성하거나 서비스 전체를 복제·재배포하는 행위,
          정상적인 운영을 방해하는 수준의 대량 요청은 금지합니다.
        </p>

        <h2 class="text-heading font-bold">6. 광고</h2>
        <p class="text-body text-muted-foreground">
          본 서비스는 Google AdSense를 통해 광고를 게재합니다.
          Google을 포함한 제3자 광고 사업자는 쿠키를 사용해 이용자의 이전 방문 기록에 기반한
          맞춤 광고를 표시할 수 있으며, 이용자는
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" class="retro-link">Google 광고 설정</a>
          또는
          <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer" class="retro-link">www.aboutads.info</a>에서
          맞춤 광고를 거부할 수 있습니다.
          광고는 계산 결과의 순위나 추천에 영향을 주지 않으며, 광고 콘텐츠를 서비스 운영자가
          보증하지 않습니다.
        </p>

        <h2 class="text-heading font-bold">7. 서비스 변경 및 중단</h2>
        <p class="text-body text-muted-foreground">
          서비스 운영자는 사전 고지 없이 계산 화면을 추가·변경하거나 서비스를 중단할 수 있습니다.
          무료 서비스 특성상, 서비스 중단에 따른 별도 보상은 제공되지 않습니다.
        </p>

        <h2 class="text-heading font-bold">8. 약관 변경</h2>
        <p class="text-body text-muted-foreground">
          본 약관은 필요 시 변경될 수 있으며, 변경된 약관은 본 페이지에 게시하는 것으로 효력이 발생합니다.
        </p>

        <h2 class="text-heading font-bold">9. 문의 및 운영 주체</h2>
        <p class="text-body text-muted-foreground">
          이용약관 관련 문의와 요율 오류 제보:
          <a :href="`mailto:${constantsStore.supportEmail}`" class="retro-link">
            {{ constantsStore.supportEmail }}
          </a>
        </p>
        <p class="text-body font-bold text-foreground">운영: ShakiLabs · 문의: skdba1313@gmail.com</p>

        <p class="text-tiny text-muted-foreground mt-6">
          시행일: 2026년 3월 10일 · 최종 수정일: 2026년 8월 10일
        </p>
      </div>
    </div>
  </div>
</template>
