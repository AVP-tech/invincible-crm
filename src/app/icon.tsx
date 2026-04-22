import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512
};

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
          background:
            "radial-gradient(circle at top left, rgba(230,193,106,0.35), transparent 34%), linear-gradient(135deg, #09111e 0%, #132032 55%, #0f172a 100%)"
        }}
      >
        <div
          style={{
            width: "72%",
            height: "72%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "28%",
            background: "linear-gradient(135deg, #f7d98b 0%, #e6c16a 55%, #c38b2d 100%)",
            boxShadow: "0 24px 80px rgba(0, 0, 0, 0.28)"
          }}
        >
          <span
            style={{
              fontSize: 220,
              lineHeight: 1,
              fontWeight: 800,
              color: "#132032",
              fontFamily: "sans-serif"
            }}
          >
            I
          </span>
        </div>
      </div>
    ),
    size
  );
}
