import React, { useState } from "react";
import ReactPlayer from "react-player/lazy";
import { VideoRefSchema } from "@jakubkanna/labguy-front-schema";

type VideoRefWithWordPressUrls = VideoRefSchema & {
  embed_url?: unknown;
  href?: unknown;
  link?: unknown;
  source_url?: unknown;
  src?: unknown;
  url?: unknown;
};

const getOptionalString = (
  videoRef: VideoRefWithWordPressUrls,
  key: keyof VideoRefWithWordPressUrls
) => {
  const value = videoRef[key];

  return typeof value === "string" && value.trim() ? value.trim() : null;
};

function getVideoUrl(videoRef: VideoRefSchema): string | null {
  const ref = videoRef as VideoRefWithWordPressUrls;
  if (videoRef.yt_url) return videoRef.yt_url;
  if (videoRef.vimeo_url) return videoRef.vimeo_url;
  if (videoRef.sc_url) return videoRef.sc_url;

  return (
    getOptionalString(ref, "url") ||
    getOptionalString(ref, "source_url") ||
    getOptionalString(ref, "src") ||
    getOptionalString(ref, "embed_url") ||
    getOptionalString(ref, "href") ||
    getOptionalString(ref, "link")
  );
}

export default function Video({
  videoref,
  className,
  playerProps = { playing: false, muted: false, controls: true, light: false },
}: {
  videoref: VideoRefSchema;
  className?: string;
  playerProps?: {
    playing?: boolean;
    muted?: boolean;
    controls?: boolean;
    light?: boolean;
  };
}) {
  const videoUrl = getVideoUrl(videoref);
  const [ready, setReady] = useState(false);

  const { playing, muted, controls, light } = playerProps;

  if (!videoUrl) return null;

  const playerWrapperStyle: React.CSSProperties = {
    position: "relative",
    paddingTop: "56.25%", // 16:9 aspect ratio
    height: 0,
    overflow: "hidden",
    maxWidth: "100%",
    width: "100%",
  };

  const playerStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  };

  return (
    <div className={className} style={playerWrapperStyle}>
      {!ready && (
        <p className="position-absolute top-50 start-50 translate-middle text-dark">
          Loading...
        </p>
      )}
      <div style={playerStyle}>
        <ReactPlayer
          url={videoUrl} // Use dynamic video URL
          playing={playing}
          muted={muted}
          controls={controls}
          light={light}
          onReady={() => setReady(true)}
          width="100%"
          height="100%"
          style={{ margin: "0 auto" }}
        />
      </div>
    </div>
  );
}
