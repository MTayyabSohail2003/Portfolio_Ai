
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
         {/* Green Waveform */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: "3px",
            width: 28,
            height: 28,
          }}
        >
           <div style={{ width: 4, height: 12, background: "#22c55e", borderRadius: 2 }} />
           <div style={{ width: 4, height: 24, background: "#16a34a", borderRadius: 2 }} />
           <div style={{ width: 4, height: 18, background: "#22c55e", borderRadius: 2 }} />
           <div style={{ width: 4, height: 8,  background: "#16a34a", borderRadius: 2 }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
