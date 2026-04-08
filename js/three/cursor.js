const container = document.getElementById("cursor-3d");
const isCoarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

if (container && !isCoarse) {
  const dot = document.createElement("div");
  dot.className = "cursor-dot";
  container.appendChild(dot);

  const mouse = { x: 0, y: 0 };
  const pos = { x: 0, y: 0 };
  const radius = 12;

  const isInteractiveAt = (x, y) => {
    const el = document.elementFromPoint(x, y);
    return Boolean(el && el.closest("a, button, .project-card, .project-preview, .filter-btn"));
  };

  const getInteractiveAt = (x, y) => {
    const el = document.elementFromPoint(x, y);
    return el ? el.closest("a, button, .project-card, .project-preview, .filter-btn") : null;
  };

  const samplePoints = (x, y) => {
    const r = radius;
    const d = r * 0.7;
    return [
      [x, y],
      [x + r, y],
      [x - r, y],
      [x, y + r],
      [x, y - r],
      [x + d, y + d],
      [x - d, y + d],
      [x + d, y - d],
      [x - d, y - d],
      [x + r, y + r],
      [x - r, y + r],
      [x + r, y - r],
      [x - r, y - r],
    ];
  };

  const findInteractiveNear = (x, y) => {
    for (const [sx, sy] of samplePoints(x, y)) {
      const hit = getInteractiveAt(sx, sy);
      if (hit) return hit;
    }
    return null;
  };

  const updateMouse = (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    const cx = event.clientX;
    const cy = event.clientY;
    const isInteractive = Boolean(findInteractiveNear(cx, cy));
    dot.classList.toggle("cursor-dot--active", isInteractive);
  };

  window.addEventListener("mousemove", updateMouse);

  window.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const direct = target.closest("a, button, .project-card, .project-preview, .filter-btn");
      if (direct) return;
      const hit = findInteractiveNear(event.clientX, event.clientY);
      if (hit) {
        event.preventDefault();
        hit.click();
      }
    },
    { capture: true }
  );

  const animate = () => {
    pos.x = mouse.x;
    pos.y = mouse.y;
    dot.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
    requestAnimationFrame(animate);
  };

  animate();
}
