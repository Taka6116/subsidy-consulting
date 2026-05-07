"use client";

import React, { memo } from "react";
import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";
import { motion } from "framer-motion";

const GEO_URL = "/data/japan-light.json";

/* 主要都市ノード（緯度経度） */
const NODES = [
  { name: "札幌",     lng: 141.35, lat: 43.06, r: 5.5, hue: "cyan" as const },
  { name: "仙台",     lng: 140.87, lat: 38.27, r: 4,   hue: "blue" as const },
  { name: "東京",     lng: 139.69, lat: 35.69, r: 7,   hue: "cyan" as const },
  { name: "横浜",     lng: 139.64, lat: 35.44, r: 3.5, hue: "blue" as const },
  { name: "名古屋",   lng: 136.91, lat: 35.18, r: 5,   hue: "blue" as const },
  { name: "京都",     lng: 135.76, lat: 35.01, r: 3.5, hue: "blue" as const },
  { name: "大阪",     lng: 135.50, lat: 34.69, r: 6,   hue: "cyan" as const },
  { name: "神戸",     lng: 135.19, lat: 34.69, r: 3.5, hue: "blue" as const },
  { name: "広島",     lng: 132.46, lat: 34.39, r: 4,   hue: "blue" as const },
  { name: "福岡",     lng: 130.40, lat: 33.60, r: 5.5, hue: "cyan" as const },
  { name: "熊本",     lng: 130.74, lat: 32.80, r: 3.5, hue: "blue" as const },
  { name: "鹿児島",   lng: 130.54, lat: 31.60, r: 3,   hue: "blue" as const },
  { name: "那覇",     lng: 127.68, lat: 26.21, r: 3.5, hue: "blue" as const },
  { name: "金沢",     lng: 136.62, lat: 36.56, r: 3,   hue: "blue" as const },
  { name: "新潟",     lng: 139.02, lat: 37.91, r: 3,   hue: "blue" as const },
  { name: "札幌郊外", lng: 143.20, lat: 44.00, r: 2.5, hue: "blue" as const },
];

/* 東京を起点にした放射ライン */
const TOKYO = { lng: 139.69, lat: 35.69 };
const LINE_TARGETS = [0, 1, 4, 6, 8, 9, 12, 14];

function useMapScale(): number {
  const [scale, setScale] = React.useState(2400);

  React.useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1920) setScale(3400);
      else if (w >= 1600) setScale(2900);
      else if (w >= 1440) setScale(2650);
      else setScale(2400);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return scale;
}

export default memo(function JapanNetworkMap() {
  const mapScale = useMapScale();

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* 変更3：中央グロー強化 */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 70% 65% at 52% 46%, rgba(59,130,246,0.38) 0%, rgba(37,99,235,0.15) 40%, transparent 70%)",
        }}
      />

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          rotate: [-136, -36, 0],
          scale: mapScale,
          center: [0, 0],
        }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* 変更5：グラデーション定義強化 */}
        <defs>
          <radialGradient id="nodeBlue" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(96,165,250,0.95)" />
            <stop offset="40%"  stopColor="rgba(59,130,246,0.55)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0)" />
          </radialGradient>
          <radialGradient id="nodeCyan" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(103,232,249,0.95)" />
            <stop offset="40%"  stopColor="rgba(34,211,238,0.55)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
          </radialGradient>
        </defs>

        {/* 変更2：ポリゴンを濃い青に */}
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: {
                    fill: "rgba(255,255,255,0.55)",
                    stroke: "#60a5fa",
                    strokeWidth: 0.8,
                    outline: "none",
                  },
                  hover: {
                    fill: "rgba(255,255,255,0.75)",
                    stroke: "#3b82f6",
                    strokeWidth: 1.0,
                    outline: "none",
                  },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {/* 東京放射ライン */}
        {LINE_TARGETS.map((idx) => {
          const target = NODES[idx];
          return (
            <Line
              key={`line-tokyo-${idx}`}
              from={[TOKYO.lng, TOKYO.lat]}
              to={[target.lng, target.lat]}
              stroke="rgba(96,165,250,0.28)"
              strokeWidth={0.9}
              strokeLinecap="round"
            />
          );
        })}

        {/* 既存：主要都市間ライン */}
        <Line from={[135.50, 34.69]} to={[130.40, 33.60]} stroke="rgba(96,165,250,0.22)" strokeWidth={0.7} strokeLinecap="round" />
        <Line from={[136.91, 35.18]} to={[135.50, 34.69]} stroke="rgba(96,165,250,0.22)" strokeWidth={0.7} strokeLinecap="round" />
        <Line from={[141.35, 43.06]} to={[140.87, 38.27]} stroke="rgba(96,165,250,0.22)" strokeWidth={0.7} strokeLinecap="round" />

        {/* 変更6：追加メッシュライン — 東北・北海道 */}
        <Line from={[141.35, 43.06]} to={[143.20, 44.00]} stroke="rgba(96,165,250,0.20)" strokeWidth={0.6} strokeLinecap="round" />
        <Line from={[140.87, 38.27]} to={[139.02, 37.91]} stroke="rgba(96,165,250,0.20)" strokeWidth={0.6} strokeLinecap="round" />
        <Line from={[139.02, 37.91]} to={[136.62, 36.56]} stroke="rgba(96,165,250,0.20)" strokeWidth={0.6} strokeLinecap="round" />

        {/* 変更6：追加メッシュライン — 中部〜関西 */}
        <Line from={[136.62, 36.56]} to={[136.91, 35.18]} stroke="rgba(96,165,250,0.20)" strokeWidth={0.6} strokeLinecap="round" />
        <Line from={[135.76, 35.01]} to={[135.50, 34.69]} stroke="rgba(96,165,250,0.20)" strokeWidth={0.6} strokeLinecap="round" />
        <Line from={[135.19, 34.69]} to={[132.46, 34.39]} stroke="rgba(96,165,250,0.20)" strokeWidth={0.6} strokeLinecap="round" />

        {/* 変更6：追加メッシュライン — 九州 */}
        <Line from={[130.40, 33.60]} to={[130.74, 32.80]} stroke="rgba(96,165,250,0.20)" strokeWidth={0.6} strokeLinecap="round" />
        <Line from={[130.74, 32.80]} to={[130.54, 31.60]} stroke="rgba(96,165,250,0.20)" strokeWidth={0.6} strokeLinecap="round" />

        {/* 変更6：追加メッシュライン — 那覇ライン */}
        <Line from={[130.54, 31.60]} to={[127.68, 26.21]} stroke="rgba(96,165,250,0.15)" strokeWidth={0.5} strokeLinecap="round" />

        {/* ノード */}
        {NODES.map((node, i) => {
          const fill  = node.hue === "cyan" ? "#22d3ee" : "#3b82f6";
          const glowId = node.hue === "cyan" ? "nodeCyan" : "nodeBlue";
          return (
            <Marker key={node.name} coordinates={[node.lng, node.lat]}>
              {/* 変更4：グロー二重化 */}
              <circle r={node.r * 10} fill={`url(#${glowId})`} opacity={0.9} />
              <circle r={node.r * 4}  fill={`url(#${glowId})`} opacity={0.6} />
              {/* 静止点 */}
              <motion.circle
                r={node.r}
                fill={fill}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + i * 0.07 }}
              />
              {/* 変更7：パルスリング強化 */}
              <motion.circle
                r={node.r}
                fill="none"
                stroke={fill}
                strokeWidth={1.2}
                animate={{
                  r: [node.r, node.r * 5, node.r * 5],
                  opacity: [0.8, 0, 0],
                }}
                transition={{
                  duration: 2.2,
                  ease: "easeOut",
                  delay: i * 0.28,
                  repeat: Infinity,
                  repeatDelay: 1.2,
                }}
              />
            </Marker>
          );
        })}
      </ComposableMap>
    </div>
  );
});
