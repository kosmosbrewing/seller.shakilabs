import { cva, type VariantProps } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 text-caption font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        // deduction/highlight 변형은 02.finance에서 복사돼 왔지만 이 앱 테마에는
        // 그 색이 없어 Tailwind가 규칙을 만들지 않았다 — 호출부도 0곳이라 제거한다.
        // muted-foreground/70은 라이트에서 중간 회색이라 흰 글자가 3.2:1까지 떨어진다.
        // 불투명 면 + 배경 토큰 잉크로 바꿔 라이트·다크 양쪽에서 짝이 맞게 한다.
        neutral: "border-border/50 bg-muted-foreground text-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

export { default as Badge } from "./Badge.vue";
