import "@google/model-viewer";
import { ThreedRef } from "@jakubkanna/labguy-front-schema";
import { useState, useEffect, useRef } from "react";
import { ModelViewer } from "../../../types/model-viewer";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { ArrowsFullscreen, ArrowsMove } from "react-bootstrap-icons";

export default function Model({
  threedref,
  controls: enableControls,
}: {
  threedref: ThreedRef;
  controls?: true;
}) {
  const [src, setSrc] = useState<string | undefined>(threedref?.url);
  const [valid, setIsValid] = useState<boolean>(true);
  const [controls, setControls] = useState<boolean>(false);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const modelViewerRef = useRef<ModelViewer | undefined>(undefined);

  useEffect(() => {
    if (src) {
      // Validate the image URL
      fetch(src)
        .then((response) => {
          if (response.ok) {
            // If the response is OK, set the image source
            setSrc(src);
            setIsValid(true);
          } else {
            setIsValid(false);
          }
        })
        .catch(() => {
          setIsValid(false);
        });
    }
  }, [src]);

  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    if (modelViewer) {
      const handleProgress = ((
        event: CustomEvent<{ totalProgress: number }>
      ) => {
        const progress = event.detail.totalProgress || 0;
        setProgress(progress);
      }) as EventListener;
      const handleLoad = () => setProgress(100);

      // Add both progress and load events
      (modelViewer as unknown as HTMLElement).addEventListener(
        "progress",
        handleProgress
      );
      (modelViewer as unknown as HTMLElement).addEventListener(
        "load",
        handleLoad
      );

      return () => {
        (modelViewer as unknown as HTMLElement).removeEventListener(
          "progress",
          handleProgress
        );
        (modelViewer as unknown as HTMLElement).removeEventListener(
          "load",
          handleLoad
        );
      };
    }
  }, []);

  const handleFullscreen = () => {
    const modelViewer = modelViewerRef.current;
    if (modelViewer) {
      if (document.fullscreenElement) {
        setFullscreen(false);
        setControls(false);
        document.exitFullscreen();
      } else if ((modelViewer as unknown as HTMLElement).requestFullscreen) {
        setFullscreen(true);
        setControls(true);
        (modelViewer as unknown as HTMLElement).requestFullscreen();
      }
    }
  };

  const handleControls = () => {
    setControls(!controls);
  };

  const tooltip = (
    <Tooltip id="tooltip">
      <span className="font-monospace">
        {!controls ? "Enable controls" : "Disable controls"}
      </span>
    </Tooltip>
  );

  const tooltip2 = (
    <Tooltip id="tooltip">
      {!controls ? "Enable fullscreen" : "Disable fullscreen"}
    </Tooltip>
  );
  return (
    valid && (
      <div>
        <model-viewer
          ref={modelViewerRef}
          src={src}
          id={"model-viewer-" + threedref.public_id}
          class="model-viewer"
          autoplay
          camera-controls={controls ? true : undefined}
          onError={(e: unknown) => console.error("Error loading model:", e)}
          alt={""}
          style={{
            backgroundColor: threedref.backgroundColor || "none",
          }}
          poster={threedref.poster?.url as string}
          exposure="0.75"
        >
          <div
            slot="progress-bar"
            className="custom-progress-bar d-flex justify-content-center"
          >
            <div
              className="progress-bar-inner bg-dark"
              style={{
                width: `${progress * 66}%`,
                height: "2px",
                display: `${progress == 1 ? "none" : "block"}`,
                marginTop: "1rem",
              }}
            ></div>
          </div>
          {enableControls && (
            <div
              className="position-absolute bottom-0 end-0 m-2 d-flex gap-2"
              id="model-controls"
            >
              <OverlayTrigger placement="top" overlay={tooltip}>
                <button onClick={handleControls} className="">
                  <ArrowsMove
                    className={`${controls ? "bg-kanna" : ""}`}
                  ></ArrowsMove>
                </button>
              </OverlayTrigger>

              <OverlayTrigger placement="top" overlay={tooltip2}>
                <button onClick={handleFullscreen} className="">
                  <ArrowsFullscreen
                    className={` ${fullscreen ? "bg-kanna" : ""}`}
                  ></ArrowsFullscreen>
                </button>
              </OverlayTrigger>
            </div>
          )}
        </model-viewer>
      </div>
    )
  );
}
