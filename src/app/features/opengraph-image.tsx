import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function FeaturesOpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background:
            "linear-gradient(135deg, #05070c 0%, #0b1724 48%, #172725 100%)",
          color: "#f8fafc",
          padding: "64px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            opacity: 0.45,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            width: "100%",
            height: "100%",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "34px",
            padding: "44px",
            background: "rgba(5, 7, 12, 0.62)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                width: "70px",
                height: "70px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "22px",
                background: "linear-gradient(135deg, #e6c16a, #b88b2c)",
                color: "#132032",
                fontSize: "34px",
                fontWeight: 900,
              }}
            >
              I
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div
                style={{
                  fontSize: "21px",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "#e6c16a",
                }}
              >
                Invincible CRM
              </div>
              <div style={{ fontSize: "23px", color: "#cbd5e1" }}>
                Public feature tour
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "820px" }}>
            <div style={{ fontSize: "72px", lineHeight: 1.02, fontWeight: 900 }}>
              All CRM features in one shareable view
            </div>
            <div style={{ fontSize: "30px", lineHeight: 1.35, color: "#dbe4f0" }}>
              AI capture, WhatsApp inbox, deals, tasks, automations, finance, teams, imports, and search.
            </div>
          </div>

          <div style={{ display: "flex", gap: "14px", fontSize: "22px", color: "#e2e8f0" }}>
            {["Capture", "Manage", "Automate", "Measure"].map((item, index) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  padding: "14px 20px",
                  borderRadius: "999px",
                  background: index === 0 ? "rgba(230,193,106,0.18)" : "rgba(255,255,255,0.08)",
                  border:
                    index === 0
                      ? "1px solid rgba(230,193,106,0.3)"
                      : "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
