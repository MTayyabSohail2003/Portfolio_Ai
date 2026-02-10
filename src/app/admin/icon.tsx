
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
            background: "transparent"
        }}
      >
        {/* Shield Shape */}
        <div
            style={{
                width: 28,
                height: 30,
                background: "#dc2626", // Red-600
                borderBottomLeftRadius: 15,
                borderBottomRightRadius: 15,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 16,
                fontWeight: 900
            }}
        >
            {/* Lock Symbol */}
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
        </div>
      </div>
    ),
    { ...size }
  );
}
