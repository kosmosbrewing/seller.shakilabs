<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import { useConstantsStore } from "@/stores/constants";

const constantsStore = useConstantsStore();

// 방침 본문의 "수집 항목"은 실제 코드에서 확인한 입력값만 적는다.
// 출처: useMarketFeeCalc.ts(쿼리 동기화 9개 키), ShippingCompareView.vue(무게·크기·세 변의 합),
// PaymentCompareView.vue(입력 없음 — 공시 요금표 비교). 코드가 바뀌면 이 표도 같이 고쳐야 한다.
const CALCULATOR_INPUTS = [
  {
    tool: "오픈마켓 수수료 비교",
    path: "/seller/market-compare",
    fields:
      "판매가, 배송비, 상품 카테고리(패션의류·식품·가전·생활·뷰티), 스마트스토어 매출등급(영세·중소1~3·일반), " +
      "유입 경로(네이버쇼핑 검색·마케팅 링크), 쿠팡 판매방식(마켓플레이스·로켓그로스), " +
      "로켓그로스 상품 크기(XS~XXL), 자사몰 결제수단 포함 여부, 월 판매수량",
  },
  {
    tool: "택배비 비교",
    path: "/seller/shipping-compare",
    fields: "박스 무게(kg), 박스 크기 등급, 세 변의 합(cm)",
  },
  {
    tool: "결제 수수료 비교",
    path: "/seller/payment-compare",
    fields: "입력값 없음 — PG사가 공시한 고정 요금표를 그대로 비교합니다",
  },
] as const;
</script>

<template>
  <SEOHead
    title="개인정보 처리방침"
    description="오픈마켓 수수료 비교 계산기가 어떤 입력값을 받고 어디서 처리하는지, 공유 링크에 무엇이 담기는지 밝히는 개인정보 처리방침입니다."
  />

  <div class="container py-5">
    <div class="retro-panel">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">개인정보 처리방침</h1>
      </div>

      <div class="retro-panel-content space-y-4">
        <p class="text-body text-muted-foreground">
          shakilabs.com/seller(오픈마켓 수수료 비교 계산기, 이하 "본 서비스")는 회원가입과 로그인이 없는
          정적 웹 계산기입니다. 셀러가 다루는 판매가·원가 수준은 그 자체로 민감한 영업 정보이므로,
          이 방침은 "개인정보를 수집하지 않는다"는 한 줄로 끝내지 않고 계산기가 실제로 어떤 값을 받아
          어디에서 처리하는지를 도구 단위로 밝힙니다.
        </p>

        <h2 class="text-heading font-bold">1. 계산기가 받는 입력값과 처리 위치</h2>
        <ul class="text-body text-muted-foreground space-y-2 list-disc list-inside">
          <li v-for="input in CALCULATOR_INPUTS" :key="input.path">
            <span class="font-bold text-foreground">{{ input.tool }}</span>
            <span class="text-caption"> ({{ input.path }})</span> — {{ input.fields }}
          </li>
        </ul>
        <p class="text-body text-muted-foreground">
          위 값은 모두 이용자의 브라우저 메모리 안에서만 계산됩니다. 본 서비스에는 계산 입력값을 받는
          서버 API 자체가 없으므로, 판매가·원가·월 판매수량이 운영자에게 전송되거나 저장되는 경로는
          존재하지 않습니다. 이름·연락처·사업자등록번호·정산 계좌 같은 식별 정보는 어느 화면에서도
          입력받지 않습니다.
        </p>

        <h2 class="text-heading font-bold">2. 공유 링크에는 입력값이 담깁니다</h2>
        <p class="text-body text-muted-foreground">
          오픈마켓 수수료 비교 화면은 계산 결과를 다시 열어볼 수 있도록 입력값을 주소창 쿼리스트링
          (<code>price</code>, <code>shipping</code>, <code>cat</code>, <code>tier</code>,
          <code>source</code>, <code>mode</code>, <code>size</code>, <code>own</code>,
          <code>qty</code>)에 반영합니다. 따라서 링크 복사나 카카오톡 공유로 주소를 전달하면
          그 시점의 판매가와 월 판매수량이 링크를 받은 사람에게 그대로 보입니다.
          원가 수준이 드러나기를 원하지 않는다면 값을 기본 상태로 되돌린 뒤 공유하시기 바랍니다.
          카카오 공유 SDK는 공유 버튼을 누른 시점에만 불러오며, 평소에는 로드되지 않습니다.
        </p>

        <h2 class="text-heading font-bold">3. 브라우저에 저장되는 값</h2>
        <p class="text-body text-muted-foreground">
          본 서비스가 브라우저 저장소에 남기는 값은 화면 테마(라이트·다크) 선택
          한 가지(<code>seller-fee:theme:v1</code>)뿐입니다. 계산 입력값은 저장하지 않으므로
          새로고침하면 기본값으로 돌아가며, 브라우저 설정에서 사이트 데이터를 삭제하면 테마 선택도
          함께 사라집니다.
        </p>

        <h2 class="text-heading font-bold">4. 쿠키 및 분석 도구</h2>
        <p class="text-body text-muted-foreground">
          어떤 계산기가 실제로 쓰이는지 파악해 개선하기 위해 Google Analytics 4를 사용합니다.
          방문한 화면 경로, 체류 시간, 대략적인 접속 지역 같은 비식별 데이터가 수집되며
          계산 입력값은 이벤트에 실리지 않습니다. Google의 데이터 처리는
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" class="retro-link">
            Google 개인정보 처리방침</a>을 참조하세요.
          서비스 장애를 파악하기 위해 오류 추적 도구(Sentry)도 사용하며, 개인정보 자동 첨부 옵션을
          꺼 둔 상태로 오류 메시지와 발생 화면만 전송합니다.
        </p>

        <h2 class="text-heading font-bold">5. 광고 및 제3자 제공</h2>
        <p class="text-body text-muted-foreground">
          본 서비스는 Google AdSense를 통해 광고를 게재합니다.
          Google을 포함한 제3자 광고 사업자는 광고 쿠키를 사용하여 이용자가 본 서비스 또는
          다른 웹사이트를 방문한 기록을 기반으로 광고를 게재하며,
          Google은 광고 쿠키를 통해 이용자의 이전 방문 기록에 기반한 맞춤 광고를 제공할 수 있습니다.
        </p>
        <p class="text-body text-muted-foreground">
          이용자는
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" class="retro-link">Google 광고 설정</a>에서
          맞춤 광고를 비활성화할 수 있으며,
          <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer" class="retro-link">www.aboutads.info</a>를
          방문하여 제3자 광고 사업자의 맞춤 광고 쿠키 사용을 일괄 거부할 수 있습니다.
          오류 화면이나 존재하지 않는 주소(404)에는 광고를 게재하지 않습니다.
        </p>
        <p class="text-body text-muted-foreground">
          본 서비스는 위 분석·광고·오류 추적 목적 외에 이용자의 데이터를 제3자에게 제공하지 않으며,
          어떤 오픈마켓·PG사·택배사와도 이용자 데이터를 주고받지 않습니다.
        </p>

        <h2 class="text-heading font-bold">6. 보유 및 파기</h2>
        <p class="text-body text-muted-foreground">
          운영자가 직접 보관하는 이용자 데이터가 없으므로 별도의 보유 기간이나 파기 절차가 없습니다.
          Google Analytics·AdSense·Sentry가 수집하는 비식별 데이터는 각 서비스의 보유 정책을 따릅니다.
        </p>

        <h2 class="text-heading font-bold">7. 이용자의 권리</h2>
        <ul class="text-body text-muted-foreground space-y-1 list-disc list-inside">
          <li>브라우저 설정에서 쿠키를 차단하거나 삭제할 수 있습니다. 쿠키를 차단해도 수수료·택배비 계산 기능은 그대로 동작합니다.</li>
          <li>Google Analytics 수집을 원하지 않는 경우
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" class="retro-link">Google Analytics 차단 브라우저 부가기능</a>을
            설치할 수 있습니다.
          </li>
          <li>이미 공유한 링크의 입력값을 지우고 싶다면 해당 링크를 회수하시면 됩니다. 운영자 쪽에 그 값의 사본이 남아 있지 않습니다.</li>
          <li>개인정보 관련 열람·정정·삭제 요청은 아래 연락처로 보내주세요.</li>
        </ul>

        <h2 class="text-heading font-bold">8. 방침 변경 고지</h2>
        <p class="text-body text-muted-foreground">
          계산기에 입력 항목이 추가되면 이 방침의 1항 목록을 함께 갱신합니다.
          변경 사항은 본 페이지에 게시하며 시행일을 갱신합니다.
        </p>

        <h2 class="text-heading font-bold">9. 문의 및 운영 주체</h2>
        <p class="text-body text-muted-foreground">
          개인정보 관련 문의:
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
