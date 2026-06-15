/** 資料シルエット（罫線・チェック欄・表のみ・文字なし） */
function DocSilhouette({ className }: { className: string }) {
  return (
    <div className={`klf-doc ${className}`}>
      <span className="klf-doc__line klf-doc__line--w90" />
      <span className="klf-doc__line klf-doc__line--w75" />
      <div className="klf-doc__row">
        <span className="klf-doc__box" />
        <span className="klf-doc__line klf-doc__line--w60" />
      </div>
      <div className="klf-doc__row">
        <span className="klf-doc__box" />
        <span className="klf-doc__line klf-doc__line--w45" />
      </div>
      <div className="klf-doc__table">
        <span className="klf-doc__cell" />
        <span className="klf-doc__cell" />
        <span className="klf-doc__cell" />
        <span className="klf-doc__cell" />
      </div>
      <span className="klf-doc__field" />
    </div>
  );
}

/**
 * /subsidies/videos ヒーロー専用の装飾背景。
 * コピー・CTA・モニター等の UI には触れない（aria-hidden / pointer-events-none）。
 */
export default function KnowledgeLightBackground() {
  return (
    <div className="klf-root" aria-hidden="true">
      <div className="klf-grid" />
      <div className="klf-curve klf-curve--a" />
      <div className="klf-curve klf-curve--b" />

      {/* 左コピー下 → 右モニター方向の光線 */}
      <svg
        className="klf-rays"
        viewBox="0 0 1440 720"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="klf-ray" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="18%" stopColor="rgba(186,230,253,0.35)" />
            <stop offset="55%" stopColor="rgba(125,211,252,0.22)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <g stroke="url(#klf-ray)" strokeWidth="1.2" strokeLinecap="round">
          <line x1="280" y1="380" x2="1180" y2="180" opacity="0.7" />
          <line x1="260" y1="400" x2="1200" y2="260" opacity="0.55" />
          <line x1="300" y1="420" x2="1220" y2="340" opacity="0.65" />
          <line x1="240" y1="440" x2="1160" y2="420" opacity="0.45" />
          <line x1="320" y1="360" x2="1240" y2="300" opacity="0.5" />
          <line x1="270" y1="460" x2="1180" y2="480" opacity="0.4" />
          <line x1="350" y1="390" x2="1280" y2="220" opacity="0.35" />
          <line x1="290" y1="410" x2="1260" y2="380" opacity="0.5" />
        </g>
        <g stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" strokeLinecap="round">
          <line x1="300" y1="395" x2="1100" y2="290" opacity="0.6" />
          <line x1="280" y1="430" x2="1120" y2="400" opacity="0.45" />
        </g>
      </svg>

      <DocSilhouette className="klf-doc--tl" />
      <DocSilhouette className="klf-doc--tr" />
      <DocSilhouette className="klf-doc--bl" />
      <DocSilhouette className="klf-doc--br" />

      <div className="klf-readability" />
    </div>
  );
}
