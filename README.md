# 고양이 컨디션 기록

10초 습관으로 남기고, 병원에는 한 장으로 가져가는 고양이 전용 컨디션 기록 웹앱입니다.

진단·처방·통증 점수·OCR·IoT·쇼핑은 하지 않습니다. 입력한 숫자와 메모만 정리합니다.

> 이 서비스는 기록·정리 도구이며 진단·처방을 대체하지 않습니다. 이상 시 수의사와 상담하세요.

## 왜 이 앱인가요

- **Pawsitive**처럼 기능이 많아서 무겁지 않습니다. 홈에서 칩 한 번이면 그날 기록이 저장됩니다.
- **집사일기**처럼 고양이 일상은 담되, 클라우드 동기화·CSV·삭제 경로를 처음부터 넣었습니다.
- 차별점: 빠른 기록, 고양이만, 한글 병원 리포트(인쇄/PDF), 내보내기·삭제 가능한 신뢰.

## 로컬에서 실행

필요 환경: Node.js 20 이상, Postgres(Neon 로컬 브랜치 또는 Docker).

```bash
git clone <이 저장소>
cd cat-condition-log
cp .env.example .env
# .env에 DATABASE_URL, AUTH_SECRET을 채웁니다
npm install
npx prisma migrate deploy
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.

- 회원가입 → 안내 문구 확인 → 고양이 등록 → 홈에서 칩으로 기록
- 달력/그래프에서 7·30일 흐름 확인
- 병원 리포트에서 기간을 고른 뒤 **인쇄 / PDF 저장**
- 더보기에서 CSV 내보내기, 고양이/계정 삭제

```bash
npm run build   # 프로덕션 빌드
npm test        # 날짜·리포트·CSV 단위 테스트
```

Docker로 Postgres만 띄울 때 예:

```bash
docker run --name cat-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=catlog -p 5432:5432 -d postgres:16
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/catlog"
```

## 환경 변수

`.env.example` 을 복사해 `.env` 또는 Vercel 환경 변수에 넣습니다. 비밀값은 커밋하지 마세요.

| 이름 | 필수 | 설명 |
| --- | --- | --- |
| `DATABASE_URL` | 예 | Neon/Vercel Postgres 연결 문자열. `?sslmode=require` 권장 |
| `AUTH_SECRET` | 예 | Auth.js 세션 비밀. `openssl rand -base64 32` |
| `AUTH_URL` | 로컬 권장 | 예: `http://localhost:3000` / 배포 도메인 |
| `BLOB_READ_WRITE_TOKEN` | 사진 업로드 시 | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) 토큰 |

사진 폴백: 토큰이 없으면 파일 업로드는 안내 메시지와 함께 거절되고, 프로필에는 **사진 URL을 직접 입력**할 수 있습니다. 데이터베이스에는 URL만 저장합니다.

## 데이터

Postgres가 원본입니다. Prisma 스키마와 마이그레이션은 `prisma/` 에 있습니다.

| 테이블 | 내용 |
| --- | --- |
| `users` | 계정, 안내 문구 동의 시각 |
| `cats` | 이름, 생일, 체중(0.01kg), 사진 URL, 메모 |
| `logs` | 하루 1행 컨디션(식욕·물·대변·소변·구토·활력·체중·메모) |
| `reminders` | 약 / 백신 / 구충 / 모래 전체갈이 |
| `media` | 사진 메타데이터(URL, 파일명). 바이너리는 Blob |

모든 조회·변경은 로그인한 `userId`로 한정합니다. 고양이/계정 삭제 시 관련 행은 FK `ON DELETE CASCADE`로 함께 지워지고, Blob URL이 있으면 삭제를 시도합니다.

스키마를 바꿀 때:

```bash
npx prisma migrate dev --name describe_the_change
```

배포 서버에서는 `npx prisma migrate deploy` 를 빌드 또는 릴리스 단계에 넣습니다.

## Vercel 배포

1. 이 저장소를 Vercel 프로젝트로 Import 합니다. Framework Preset은 Next.js입니다.
2. Marketplace에서 **Neon** 또는 Postgres를 연결하고 `DATABASE_URL` 을 넣습니다.
3. `AUTH_SECRET` 을 생성해 넣고, `AUTH_URL` 은 `https://<프로젝트>.vercel.app` 으로 둡니다.
4. 사진을 쓰려면 Storage에서 **Blob**을 만들고 `BLOB_READ_WRITE_TOKEN` 을 연결합니다.
5. 빌드 명령은 `prisma generate && next build` (`npm run build`)입니다. 첫 배포 전에 한 번, 또는 빌드 커맨드를 아래처럼 바꿉니다.

```bash
npx prisma migrate deploy && npm run build
```

6. Deploy 후 회원가입으로 클라우드 동기화를 확인합니다.

PWA: `/manifest.webmanifest` 와 서비스 워커(`public/sw.js`)가 포함되어 있습니다. 모바일 브라우저에서 홈 화면에 추가할 수 있습니다.

## 기술

- Next.js App Router, TypeScript, Tailwind CSS 4
- Auth.js(NextAuth v5) 이메일·비밀번호, JWT 세션
- Prisma + PostgreSQL
- 병원 리포트는 Noto Sans KR 웹폰트 + 브라우저 인쇄/PDF (한글 깨짐 없음)

## 함께하는 곳 (참고·협력 링크)

앱 안에서는 물건을 팔지 않습니다. 하단과 더보기에는 창업자의 기존 자료를 **참고 링크**로만 둡니다.

- 안내: [숨숨마을위키](https://b-cat-cpang.vercel.app/wiki/) — 일반적인 돌봄 설명
- 용품: [숨숨마을 고양이 용품 큐레이션](https://b-cat-cpang.vercel.app/) — 별도 사이트 목록

배너·팝업·구매 유도 문구는 쓰지 않습니다.

## 하지 않는 것

강아지, 앱 내부 쇼핑몰, 병원 예약, AI 통증 점수, 검사지 OCR, IoT 급식기, 가족 공유(더보기에 준비 중 안내만).
