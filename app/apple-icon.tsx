import {ImageResponse} from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #171411 0%, #090807 100%)",
          color: "#f5efe3",
          fontSize: 68,
          fontWeight: 700,
          letterSpacing: "0.08em",
          borderRadius: 32,
        }}
      >
        AC
      </div>
    ),
    {
      ...size,
    },
  );
}
