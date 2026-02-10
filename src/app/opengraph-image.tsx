
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Muhammad Tayyab Sohail - MERN Stack Developer & AI Engineer";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Default OG Image for the entire site
export default async function Image() {
  // Generate random data grid
  const gridPoints = Array.from({ length: 48 }).map((_, i) => ({
    opacity: Math.random() * 0.5 + 0.1,
    scale: Math.random() > 0.8 ? 1.5 : 1,
  }));

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          backgroundImage: "radial-gradient(circle at 25px 25px, #171717 2%, transparent 0%), radial-gradient(circle at 75px 75px, #171717 2%, transparent 0%)",
          backgroundSize: "100px 100px",
          color: "white",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Abstract "Neural" Overlay */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexWrap: "wrap", justifyContent: "center", alignContent: "center", gap: "20px", opacity: 0.3 }}>
          {gridPoints.map((p, i) => (
            <div key={i} style={{ width: 4, height: 4, background: "#06b6d4", borderRadius: "50%", opacity: p.opacity, transform: `scale(${p.scale})` }} />
          ))}
        </div>

        {/* Branding */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 10, padding: "40px", border: "1px solid #333", borderRadius: "16px", background: "rgba(0,0,0,0.8)", boxShadow: "0 0 50px rgba(6,182,212,0.15)" }}>
          <div style={{ fontSize: 24, color: "#06b6d4", letterSpacing: "4px", marginBottom: 20, textTransform: "uppercase" }}>
            Portfolio
          </div>
          <div style={{ fontSize: 72, fontWeight: 900, background: "linear-gradient(to bottom right, #ffffff, #94a3b8)", backgroundClip: "text", color: "transparent", lineHeight: 1 }}>
            Muhammad Tayyab Sohail
          </div>
          <div style={{ fontSize: 32, color: "#94a3b8", marginTop: 20 }}>
            AI Engineer & Full Stack Architect
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: "absolute", bottom: 40, display: "flex", alignItems: "center", gap: "10px", fontSize: 20, color: "#525252" }}>
          <div style={{ width: 8, height: 8, background: "#22c55e", borderRadius: "50%" }} />
          System Online // v2.0
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
