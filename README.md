# Image to WebP Converter

다양한 이미지 포맷을 WebP로 변환하는 데스크톱 애플리케이션입니다.

## 기능

- **다양한 포맷 지원**: JPG, PNG, GIF, BMP, TIFF 이미지를 WebP로 변환
- **애니메이션 GIF 지원**: 움직이는 GIF를 애니메이션 WebP로 변환
- **드래그 앤 드롭**: 파일을 끌어다 놓거나 클릭하여 선택
- **일괄 변환**: 여러 이미지를 한 번에 변환
- **품질 조절**: 1~100% 범위에서 출력 품질 설정
- **용량 절감 통계**: 변환 전후 파일 크기 비교

## 설치

### 릴리스 다운로드

[Releases](../../releases) 페이지에서 운영체제에 맞는 파일을 다운로드하세요.

- **macOS**: `Image to WebP-x.x.x.dmg`
- **Windows**: `Image to WebP x.x.x.exe`

### 직접 빌드

```bash
# 저장소 클론
git clone https://github.com/your-username/image-to-webp.git
cd image-to-webp

# 의존성 설치
npm install

# 개발 모드 실행
npm start

# 빌드
npm run build:mac   # macOS
npm run build:win   # Windows
npm run build       # 전체 플랫폼
```

## 사용법

1. 앱 실행
2. 변환할 이미지를 드래그 앤 드롭하거나 클릭하여 선택
3. 품질 슬라이더로 출력 품질 조절 (기본값: 80%)
4. **저장 위치 선택** 버튼으로 출력 폴더 지정
5. **변환 시작** 버튼 클릭

## 기술 스택

- [Electron](https://www.electronjs.org/) - 크로스 플랫폼 데스크톱 앱 프레임워크
- [Sharp](https://sharp.pixelplumbing.com/) - 고성능 이미지 처리 라이브러리

## 라이선스

MIT License
