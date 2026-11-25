import { ImageResponse } from "next/og";

export const alt = "일기쓰는 고양이";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const text = "일기쓰는 고양이10초 습관으로 남기는 고양이 하루 기록";
  const font = await fetch(`https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&text=${encodeURIComponent(text)}`)
    .then((r) => r.text())
    .then((css) => css.match(/src: url\((.+?)\)/)?.[1])
    .then((url) => (url ? fetch(url).then((r) => r.arrayBuffer()) : null))
    .catch(() => null);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "#2A150C", color: "#F8EDE3", padding: "72px", fontFamily: "NotoKR" }}>
        <div style={{ color: "#E07A3D", fontSize: 28, letterSpacing: 6 }}>DIARY CAT</div>
        <div style={{ marginTop: 24, fontSize: 76, color: "#F4D7C3" }}>일기쓰는 고양이</div>
        <div style={{ marginTop: 20, fontSize: 30, color: "#D4B8A5" }}>10초 습관으로 남기는 고양이 하루 기록</div>
      </div>
    ),
    { ...size, fonts: font ? [{ name: "NotoKR", data: font, weight: 700 }] : [] },
  );
}
