import { ModelViewerElement } from "@google/model-viewer";

const onProgress = (modelViewer: ModelViewerElement | null) => {
  if (!modelViewer) return;

  const progress = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const progressBar = target.querySelector(
      ".progress-bar"
    ) as HTMLElement | null;
    const updatingBar = target.querySelector(
      ".update-bar"
    ) as HTMLElement | null;
    const progressValue = target.querySelector(
      ".progress-value"
    ) as HTMLElement | null;

    if (!progressBar || !updatingBar || !progressValue) return;

    // Assuming event is a CustomEvent with a 'detail' property containing totalProgress
    const customEvent = event as CustomEvent<{ totalProgress: number }>;
    const totalProgress = customEvent.detail.totalProgress;

    // Update the width of the bar
    // updatingBar.style.width = `${progress * 100}%`;

    // Update the progress value text
    progressValue.textContent = `${(totalProgress * 100).toFixed(0)}%`;

    // Hide progress bar and remove event listener when loading is complete
    if (totalProgress === 1) {
      progressBar.classList.add("hide");
      target.removeEventListener("progress", progress as EventListener);
    } else {
      progressBar.classList.remove("hide");
    }
  };

  modelViewer.addEventListener("progress", progress as EventListener);
};

export default onProgress;
