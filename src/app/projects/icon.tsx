
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
        {/* Cube / Blueprint Grid */}
        <div
          style={{
            width: 28,
            height: 28,
            border: "2px solid #6366f1", // Indigo-500
            background: "#1e1b4b", // Indigo-950
            display: "flex",
            flexWrap: "wrap",
            gap: "2px",
            padding: "2px",
            borderRadius: "4px"
          }}
        >
            <div style={{ width: 9, height: 9, background: "#6366f1" }} />
            <div style={{ width: 9, height: 9, background: "#4338ca" }} />
            <div style={{ width: 9, height: 9, background: "#4338ca" }} />
            <div style={{ width: 9, height: 9, background: "#6366f1" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
