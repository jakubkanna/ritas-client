import { ModelViewerElement } from "@google/model-viewer";

export default function onScroll(
  modelViewer: ModelViewerElement | null,
  onBlurChange?: (isBlurred: boolean) => void
) {
  let isBlurred: boolean | null = null;
  if (!modelViewer) return undefined;

  const onStart = () => {
    modelViewer.animationName = "Plane.003_final.001Action.003";
    modelViewer.currentTime = 0;
  };

  const onStop = () => {
    modelViewer.animationName = "rotation";
  };

  const syncBlur = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    const breakpoint = viewportHeight / 100;
    const shouldBlur = scrollTop >= breakpoint;

    if (shouldBlur === isBlurred) return;

    isBlurred = shouldBlur;
    onBlurChange?.(shouldBlur);

    if (shouldBlur) {
      onStart();
    } else {
      onStop();
    }
  };

  window.addEventListener("scroll", syncBlur);
  syncBlur();

  return () => window.removeEventListener("scroll", syncBlur);
}
