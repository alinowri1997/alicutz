import {ImageResponse} from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon(): ImageResponse {
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
          fontSize: 172,
          fontWeight: 700,
          letterSpacing: "0.08em",
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
