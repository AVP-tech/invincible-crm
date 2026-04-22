import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background:
            "radial-gradient(circle at top left, rgba(230,193,106,0.24), transparent 30%), linear-gradient(135deg, #09111e 0%, #132032 52%, #0f172a 100%)",
          color: "#f8fafc",
          padding: "72px",
          fontFamily: "sans-serif"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "32px",
            padding: "44px",
            background: "rgba(10, 15, 24, 0.42)"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px"
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "22px",
                background: "linear-gradient(135deg, #e6c16a, #b88b2c)",
                color: "#132032",
                fontSize: "32px",
                fontWeight: 800
              }}
            >
              I
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}
            >
              <div style={{ fontSize: "20px", letterSpacing: "0.3em", textTransform: "uppercase", color: "#e6c16a" }}>
                Invincible CRM
              </div>
              <div style={{ fontSize: "22px", color: "#cbd5e1" }}>AI-first CRM for fast-moving teams</div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              maxWidth: "860px"
            }}
          >
            <div style={{ fontSize: "70px", lineHeight: 1.04, fontWeight: 800 }}>
              Turn natural-language updates into structured CRM data
            </div>
            <div style={{ fontSize: "30px", lineHeight: 1.35, color: "#dbe4f0" }}>
              Contacts, deals, tasks, and notes get organized before anything is saved.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "16px",
              color: "#e2e8f0",
              fontSize: "22px"
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "14px 20px",
                borderRadius: "999px",
                background: "rgba(230,193,106,0.16)",
                border: "1px solid rgba(230,193,106,0.25)"
              }}
            >
              Capture
            </div>
            <div
              style={{
                display: "flex",
                padding: "14px 20px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)"
              }}
            >
              Pipeline
            </div>
            <div
              style={{
                display: "flex",
                padding: "14px 20px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)"
              }}
            >
              Follow-ups
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
