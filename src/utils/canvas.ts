export function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string
) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

export function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function drawFaceCircle(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  rz: number,
  radius: number,
  color: string
) {
  const pointsNumber = 7;

  const points = [];
  for (let i = 0; i < pointsNumber; i++) {
    const radiants = rz + (i * Math.PI * 2) / pointsNumber;
    const x = radius * Math.cos(radiants);
    const y = radius * Math.sin(radiants);
    const point = { x, y };
    points.push(point);
    drawCircle(ctx!, centerX + x, centerY + y, 5, color);
  }

  const subPointsNumber = 5;
  const innerRadius = radius * 0.5;
  for (let i = 0; i < subPointsNumber; i++) {
    const radiants = Math.PI / 2 + rz + (i * Math.PI * 2) / subPointsNumber;
    const x = innerRadius * Math.cos(radiants);
    const y = innerRadius * Math.sin(radiants);
    const point = { x, y };
    points.push(point);
    drawCircle(ctx!, centerX + x, centerY + y, 3, color);
  }
}
