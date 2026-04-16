export const applyContainerStyles = (container: HTMLElement): void => {
  Object.assign(container.style, {
    background: "#fff",
    backgroundImage:
      "radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)",
    backgroundSize: "20px 20px",
  });
};