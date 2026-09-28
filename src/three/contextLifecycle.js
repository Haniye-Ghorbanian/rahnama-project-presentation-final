// Temporary context loss must not unmount the renderer: the browser restores that same canvas.
export function observeWebGLContext(canvas, { onLost, onRestored }) {
  let active = true;
  const lost = event => {
    if (!active || !canvas.isConnected) return;
    event.preventDefault();
    onLost();
  };
  const restored = () => {
    if (active && canvas.isConnected) onRestored();
  };
  canvas.addEventListener('webglcontextlost', lost);
  canvas.addEventListener('webglcontextrestored', restored);
  return () => {
    active = false;
    canvas.removeEventListener('webglcontextlost', lost);
    canvas.removeEventListener('webglcontextrestored', restored);
  };
}
