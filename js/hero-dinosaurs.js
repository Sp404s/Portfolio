const container = document.querySelector('.hero__background');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (container && !prefersReducedMotion) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const dinosaurImage = new Image();
  const bodies = [];
  const pointer = { x: 0, y: 0, active: false };

  let width = 1;
  let height = 1;
  let dpr = 1;
  let lastTime = performance.now();
  let imageReady = false;

  dinosaurImage.src = 'img/icons/Dinosaur.svg';
  dinosaurImage.onload = () => {
    imageReady = true;
  };

  const outlinePixels = [
    [433, 67], [433, 100], [400, 100], [400, 300], [367, 300],
    [367, 333], [300, 333], [300, 367], [267, 367], [267, 400],
    [233, 400], [233, 433], [167, 433], [167, 400], [133, 400],
    [133, 367], [100, 367], [100, 300], [67, 300], [67, 500],
    [100, 500], [100, 533], [133, 533], [133, 567], [167, 567],
    [167, 600], [200, 600], [200, 733], [267, 733], [267, 700],
    [233, 700], [233, 667], [267, 667], [267, 633], [300, 633],
    [300, 600], [333, 600], [333, 633], [367, 633], [367, 733],
    [433, 733], [433, 700], [400, 700], [400, 567], [433, 567],
    [433, 533], [467, 533], [467, 500], [500, 500], [500, 400],
    [533, 400], [533, 433], [567, 433], [567, 367], [500, 367],
    [500, 300], [667, 300], [667, 267], [567, 267], [567, 233],
    [733, 233], [733, 100], [700, 100], [700, 67],
  ];

  const shape = outlinePixels.map(([x, y]) => ({
    x: (x - 400) / 800,
    y: (y - 400) / 800,
  }));

  const random = (min, max) => min + Math.random() * (max - min);
  const cross = (origin, a, b) => ((a.x - origin.x) * (b.y - origin.y)) - ((a.y - origin.y) * (b.x - origin.x));

  const buildConvexHull = (points) => {
    const sorted = [...points].sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
    const lower = [];
    const upper = [];

    sorted.forEach((point) => {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
        lower.pop();
      }

      lower.push(point);
    });

    [...sorted].reverse().forEach((point) => {
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
        upper.pop();
      }

      upper.push(point);
    });

    return lower.slice(0, -1).concat(upper.slice(0, -1));
  };

  const hull = buildConvexHull(shape);

  canvas.className = 'hero__dinosaurs';
  canvas.setAttribute('aria-hidden', 'true');
  container.append(canvas);

  const resize = () => {
    const rect = container.getBoundingClientRect();

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    bodies.forEach(keepInsideWorld);
  };

  const getVertices = (body, points = hull) => {
    const cos = Math.cos(body.angle);
    const sin = Math.sin(body.angle);

    return points.map((point) => ({
      x: body.x + (point.x * cos - point.y * sin) * body.size,
      y: body.y + (point.x * sin + point.y * cos) * body.size,
      localX: point.x * body.size,
      localY: point.y * body.size,
    }));
  };

  const project = (vertices, axis) => {
    let min = Infinity;
    let max = -Infinity;

    vertices.forEach((vertex) => {
      const value = vertex.x * axis.x + vertex.y * axis.y;
      min = Math.min(min, value);
      max = Math.max(max, value);
    });

    return { min, max };
  };

  const getAxes = (vertices) => {
    const axes = [];

    for (let index = 0; index < vertices.length; index += 1) {
      const current = vertices[index];
      const next = vertices[(index + 1) % vertices.length];
      const edgeX = next.x - current.x;
      const edgeY = next.y - current.y;
      const length = Math.hypot(edgeX, edgeY) || 1;

      axes.push({ x: -edgeY / length, y: edgeX / length });
    }

    return axes;
  };

  const findCollision = (first, second) => {
    const firstVertices = getVertices(first);
    const secondVertices = getVertices(second);
    const axes = [...getAxes(firstVertices), ...getAxes(secondVertices)];
    let smallestOverlap = Infinity;
    let bestAxis = null;

    for (const axis of axes) {
      const firstProjection = project(firstVertices, axis);
      const secondProjection = project(secondVertices, axis);
      const overlap = Math.min(firstProjection.max, secondProjection.max) - Math.max(firstProjection.min, secondProjection.min);

      if (overlap <= 0) return null;

      if (overlap < smallestOverlap) {
        smallestOverlap = overlap;
        bestAxis = axis;
      }
    }

    const centerDx = second.x - first.x;
    const centerDy = second.y - first.y;

    if (centerDx * bestAxis.x + centerDy * bestAxis.y < 0) {
      bestAxis = { x: -bestAxis.x, y: -bestAxis.y };
    }

    return { axis: bestAxis, overlap: smallestOverlap };
  };

  const createBody = (index) => {
    const size = random(110, 180);

    return {
      size,
      x: random(width * 0.18, width * 0.82),
      y: -index * random(54, 88) - size,
      vx: random(-90, 90),
      vy: random(70, 190),
      angle: random(-0.75, 0.75),
      angleVelocity: random(-1.8, 1.8),
      mass: size * size,
      resting: false,
      hasContact: false,
      floorContact: false,
      sleepFrames: 0,
    };
  };

  const createBodies = () => {
    bodies.length = 0;

    for (let index = 0; index < 42; index += 1) {
      bodies.push(createBody(index));
    }
  };

  const keepInsideWorld = (body) => {
    const vertices = getVertices(body);
    const minX = Math.min(...vertices.map((vertex) => vertex.x));
    const maxX = Math.max(...vertices.map((vertex) => vertex.x));
    const minY = Math.min(...vertices.map((vertex) => vertex.y));
    const maxY = Math.max(...vertices.map((vertex) => vertex.y));

    if (maxY > height) {
      body.y -= maxY - height;
      body.vy = 0;
      body.vx *= 0.82;
      body.angleVelocity *= 0.78;
      body.floorContact = true;
    }

    if (minX < 0) {
      body.x -= minX;
      body.vx = Math.abs(body.vx) * 0.22;
      body.angleVelocity *= 0.72;
    }

    if (maxX > width) {
      body.x -= maxX - width;
      body.vx = -Math.abs(body.vx) * 0.22;
      body.angleVelocity *= 0.72;
    }

    if (minY < -height * 0.35 && body.vy < 0) {
      body.vy = 0;
    }
  };

  const pushByPointer = (body, delta) => {
    if (!pointer.active) return;

    const dx = body.x - pointer.x;
    const dy = body.y - pointer.y;
    const distance = Math.hypot(dx, dy) || 1;
    const influence = body.size * 1.45;

    if (distance > influence) return;

    const force = (1 - distance / influence) * 6200;

    body.vx += (dx / distance) * force * delta;
    body.vy += (dy / distance) * force * delta;
    body.angleVelocity += (dx / distance) * force * delta * 0.012;
    body.resting = false;
  };

  const solveCollisions = () => {
    bodies.forEach((body) => {
      body.hasContact = false;
      body.floorContact = false;
    });

    for (let pass = 0; pass < 6; pass += 1) {
      for (let firstIndex = 0; firstIndex < bodies.length; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < bodies.length; secondIndex += 1) {
          const first = bodies[firstIndex];
          const second = bodies[secondIndex];
          const collision = findCollision(first, second);

          if (!collision) continue;

          const { axis, overlap } = collision;
          const correction = overlap * 0.52;
          const firstShare = second.mass / (first.mass + second.mass);
          const secondShare = first.mass / (first.mass + second.mass);

          first.x -= axis.x * correction * firstShare;
          first.y -= axis.y * correction * firstShare;
          second.x += axis.x * correction * secondShare;
          second.y += axis.y * correction * secondShare;
          first.hasContact = true;
          second.hasContact = true;

          const relativeVx = second.vx - first.vx;
          const relativeVy = second.vy - first.vy;
          const velocityAlongNormal = relativeVx * axis.x + relativeVy * axis.y;

          first.angleVelocity -= axis.x * overlap * 0.004;
          second.angleVelocity += axis.x * overlap * 0.004;

          if (velocityAlongNormal < 0) {
            const impulse = -velocityAlongNormal * 0.18;

            first.vx -= axis.x * impulse * firstShare;
            first.vy -= axis.y * impulse * firstShare;
            second.vx += axis.x * impulse * secondShare;
            second.vy += axis.y * impulse * secondShare;
          }
        }
      }

      bodies.forEach(keepInsideWorld);
    }
  };

  const updateSleepState = () => {
    bodies.forEach((body) => {
      const speed = Math.hypot(body.vx, body.vy);
      const canSleep = (body.floorContact || body.hasContact)
        && speed < 18
        && Math.abs(body.angleVelocity) < 0.18;

      if (canSleep) {
        body.sleepFrames += 1;
      } else {
        body.sleepFrames = 0;
      }

      if (body.sleepFrames > 18) {
        body.vx = 0;
        body.vy = 0;
        body.angleVelocity = 0;
        body.resting = true;
      }
    });
  };

  const drawDinosaur = (body) => {
    ctx.save();
    ctx.translate(body.x, body.y);
    ctx.rotate(body.angle);
    ctx.scale(body.size, body.size);

    if (imageReady) {
      ctx.drawImage(dinosaurImage, -0.5, -0.5, 1, 1);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      shape.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  };

  const updatePointer = (clientX, clientY) => {
    const rect = container.getBoundingClientRect();

    pointer.x = clientX - rect.left;
    pointer.y = clientY - rect.top;
    pointer.active = true;
  };

  const updateBody = (body, delta) => {
    if (!body.resting) {
      body.vy += 1900 * delta;
      body.vx *= 0.992;
      body.vy *= 0.995;
      body.angleVelocity *= 0.992;
    } else {
      body.vx *= 0.84;
      body.angleVelocity *= 0.78;
    }

    pushByPointer(body, delta);

    body.x += body.vx * delta;
    body.y += body.vy * delta;
    body.angle += body.angleVelocity * delta;

    keepInsideWorld(body);
  };

  const animate = (time) => {
    const delta = Math.min((time - lastTime) / 1000, 0.024);

    lastTime = time;
    ctx.clearRect(0, 0, width, height);

    bodies.forEach((body) => updateBody(body, delta));
    solveCollisions();
    updateSleepState();
    bodies.forEach(drawDinosaur);

    requestAnimationFrame(animate);
  };

  resize();
  createBodies();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (event) => updatePointer(event.clientX, event.clientY));
  window.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];

    if (touch) updatePointer(touch.clientX, touch.clientY);
  }, { passive: true });
  window.addEventListener('mouseleave', () => {
    pointer.active = false;
  });
  requestAnimationFrame(animate);
}
