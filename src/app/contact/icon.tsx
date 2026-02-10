
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
         {/* Radar Target */}
         <div
            style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "2px solid #db2777", // Pink-600
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
         >
             <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #f472b6" }} /> 
             <div style={{ width: 8, height: 8, borderRadius: "50%",  background: "#db2777", position: "absolute" }} />
         </div>
      </div>
    ),
    { ...size }
  );
}
