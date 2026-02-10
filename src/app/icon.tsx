
import { ImageResponse } from "next/og";

// Icon Config
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Generate Icon
export default function Icon() {
  // Simple time-based logic (UTC)
  // Day: 6AM - 6PM (Gold), Night: 6PM - 6AM (Cyan)
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 18;
  
  const color = isNight ? "#06b6d4" : "#f59e0b"; // Cyan-500 or Amber-500
  const bg = isNight ? "#000000" : "#ffffff";

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
        {/* Outer Ring */}
        <div
            style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: `2px solid ${color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
            }}
        >
            {/* Inner Core */}
            <div 
                style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            />
            
            {/* "Spokes" simulating rotation via static positioning for PNG (Animation is SVG only) */}
            {/* Since ImageResponse outputs PNG by default for 'icon.tsx' unless we return SVG text directly, 
                we create a high-fidelity static version here. 
                Next.js 'icon.tsx' usually compiles to PNG. 
            */}
        </div>
      </div>
    ),
    { ...size }
  );
}
