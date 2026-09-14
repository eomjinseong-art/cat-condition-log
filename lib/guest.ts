export const GUEST_STORAGE_KEY = "cat-condition-log:guest:v1";
export const GUEST_MAX_CATS = 2;
export const GUEST_SNAPSHOT_VERSION = 1 as const;

export type GatedFeature = "cloud" | "report" | "export" | "reminders" | "thirdCat";

export const gatedCopy: Record<GatedFeature, { title: string; body: string }> = {
  cloud: {
    title: "다른 기기와 맞추려면 계정이 필요해요",
    body: "지금까지 남긴 기록은 이 기기에 그대로 있어요. 가입하면 클라우드에 모아 두고, 다른 폰에서도 이어서 볼 수 있어요.",
  },
  report: {
    title: "병원용 한 장 정리는 계정이 필요해요",
    body: "오늘 기록은 계속 남길 수 있어요. 가입하면 입력한 숫자만 모은 한글 리포트를 인쇄하거나 PDF로 저장할 수 있어요.",
  },
  export: {
    title: "CSV로 내려받으려면 계정이 필요해요",
    body: "기록은 이 기기에 남아 있어요. 가입하면 표 계산용 CSV로 내보낼 수 있어요.",
  },
  reminders: {
    title: "돌봄 일정은 계정이 있으면 쓸 수 있어요",
    body: "약·백신·구충·모래 전체갈이 알림은 계정에 맞춰 두려고 해요. 가입해도 지금까지의 컨디션 기록은 그대로 옮겨 드려요.",
  },
  thirdCat: {
    title: "세 번째 고양이는 계정이 필요해요",
    body: "게스트에서는 고양이 두 마리까지 기록할 수 있어요. 한 마리를 더 등록하려면 가입해 주세요. 지금 두 마리 기록은 그대로 옮겨 드려요.",
  },
};
