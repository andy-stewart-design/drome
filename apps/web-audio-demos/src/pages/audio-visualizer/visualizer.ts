type VisualizerType = "bars" | "curve" | "waveform" | "circular";
// prettier-ignore
type FftSize = 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096 | 8192 | 16384 |  32768

interface AudioVisualizerConfig {
  audioContext: AudioContext;
  canvas: HTMLCanvasElement;
  fftSize?: FftSize;
  smoothingTimeConstant?: number;
  visualizerType?: VisualizerType;
}

class AudioVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private controller = new AbortController();
  private animationId: number | null = null;

  private analyser: AnalyserNode;
  private visualizerType: VisualizerType;

  private dataArray: Uint8Array<ArrayBuffer> | null = null;
  private bufferLength: number = 0;
  private fftSize: FftSize;
  private smoothingTimeConstant: number;

  constructor(config: AudioVisualizerConfig) {
    this.canvas = config.canvas;

    const context = this.canvas.getContext("2d", {
      alpha: false,
      colorSpace: "display-p3",
    });

    if (!context) throw new Error("Could not get 2D context from canvas");

    this.ctx = context;
    this.fftSize = config.fftSize ?? 512;
    this.smoothingTimeConstant = config.smoothingTimeConstant ?? 0.8;
    this.visualizerType = config.visualizerType ?? "bars";

    // Setup analyser
    this.analyser = new AnalyserNode(config.audioContext, {
      fftSize: this.fftSize,
      smoothingTimeConstant: this.smoothingTimeConstant,
    });
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    this.analyser.connect(config.audioContext.destination);

    this.resize();
    const { signal } = this.controller;
    window.addEventListener("resize", () => this.resize(), { signal });

    // Bind methods (so that we can pass them directly to RAF)
    this.draw = this.draw.bind(this);
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.ctx.scale(dpr, dpr);

    this.width = rect.width;
    this.height = rect.height;
  }

  start(): void {
    if (!this.animationId) this.draw();
  }

  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  setVisualizerType(type: VisualizerType): void {
    this.visualizerType = type;
  }

  private draw(): void {
    this.animationId = requestAnimationFrame(this.draw);

    if (!this.analyser || !this.dataArray) return;

    // Get frequency or waveform data
    if (this.visualizerType === "waveform") {
      this.analyser.getByteTimeDomainData(this.dataArray);
    } else {
      this.analyser.getByteFrequencyData(this.dataArray);
    }

    // Clear canvas
    this.ctx.fillStyle = "color(display-p3 0 0 0)";
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw based on type
    switch (this.visualizerType) {
      case "bars":
        drawSpectrumBars(this.ctx, this.dataArray, this.width, this.height);
        break;
      case "curve":
        drawSpectrumCurve(this.ctx, this.dataArray, this.width, this.height);
        break;
      case "waveform":
        drawOscilloscope(this.ctx, this.dataArray, this.width, this.height);
        break;
      case "circular":
        drawCircular(this.ctx, this.dataArray, this.width, this.height);
        break;
      default:
        console.log(this.visualizerType satisfies never);
    }
  }

  get node() {
    return this.analyser;
  }

  destroy(): void {
    // Stop animation
    this.stop();
    this.analyser.disconnect();
    // @ts-expect-error destroy audioContext
    this.analyser = null;
    this.dataArray = null;
    this.controller.abort();
  }
}

// ---------------------------------------------------------------------------
// VISUALIZER FUNCTIONS
function drawSpectrumBars(
  ctx: CanvasRenderingContext2D,
  data: Uint8Array<ArrayBuffer> | null,
  width: number,
  height: number,
  numBars = 80,
) {
  if (!data) return;

  const barWidth = width / numBars;
  const barGap = 2;
  const samplesPerBar = Math.floor(data.length / numBars);
  ctx.fillStyle = "color(display-p3 1 0 1)";

  for (let i = 0; i < numBars; i++) {
    const startIndex = i * samplesPerBar;
    const endIndex = startIndex + samplesPerBar;
    const value = data[Math.floor((startIndex + endIndex) / 2)];
    const barHeight = (value / 255) * height * 0.9 + height * 0.005;

    ctx.fillRect(
      i * barWidth,
      height / 2 - barHeight / 2,
      barWidth - barGap,
      barHeight,
    );
  }
}

function drawSpectrumCurve(
  ctx: CanvasRenderingContext2D,
  data: Uint8Array<ArrayBuffer> | null,
  width: number,
  height: number,
  numPoints = 80,
) {
  if (!data) return;

  const samplesPerPoint = Math.floor(data.length / numPoints);
  const pointSpacing = width / (numPoints - 1);

  // Collect data points
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < numPoints; i++) {
    const startIndex = i * samplesPerPoint;
    const endIndex = startIndex + samplesPerPoint;
    const value = data[Math.floor((startIndex + endIndex) / 2)];

    // Invert so higher values are at top
    const normalizedValue = value / 255;
    const y = height - (normalizedValue * height * 0.9 + height * 0.05);

    points.push({
      x: i * pointSpacing,
      y: y,
    });
  }

  const drawCurve = () => {
    for (let i = 0; i < points.length - 1; i++) {
      const currentPoint = points[i];
      const nextPoint = points[i + 1];

      // Calculate control point for smooth curve (midpoint)
      const controlX = (currentPoint.x + nextPoint.x) / 2;
      const controlY = (currentPoint.y + nextPoint.y) / 2;

      ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, controlX, controlY);
    }
  };

  // Draw filled area under the curve
  ctx.beginPath();
  ctx.moveTo(points[0].x, height); // Start at bottom-left
  ctx.lineTo(points[0].x, points[0].y); // Go to first data point
  drawCurve();

  // Connect to last point
  const lastPoint = points[points.length - 1];
  ctx.lineTo(lastPoint.x, lastPoint.y);

  // Complete the fill area
  ctx.lineTo(lastPoint.x, height); // Go to bottom-right
  ctx.closePath();

  // Fill with gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "color(display-p3 1 0 1 / 0.5)"); // Blue with opacity
  gradient.addColorStop(1, "color(display-p3 1 0 1 / 0.1)");
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw the line on top
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  drawCurve();

  ctx.lineTo(lastPoint.x, lastPoint.y);
  ctx.strokeStyle = "color(display-p3 1 0 1)"; // Solid blue
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawOscilloscope(
  ctx: CanvasRenderingContext2D,
  data: Uint8Array<ArrayBuffer> | null,
  width: number,
  height: number,
) {
  if (!data) return;

  ctx.lineWidth = 2;
  ctx.strokeStyle = "color(display-p3 1 0 1)";
  ctx.beginPath();

  const sliceWidth = width / data.length;
  let x = 0;

  for (let i = 0; i < data.length; i++) {
    const v = data[i] / 128.0;
    const y = (v * height) / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.lineTo(width, height / 2);
  ctx.stroke();
}

function drawCircular(
  ctx: CanvasRenderingContext2D,
  data: Uint8Array<ArrayBuffer> | null,
  width: number,
  height: number,
) {
  if (!data) return;

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.3;

  const angleStep = (Math.PI * 2) / data.length;

  for (let i = 0; i < data.length; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const barHeight = (data[i] / 255) * (radius * 0.8);

    const x1 = centerX + Math.cos(angle) * radius;
    const y1 = centerY + Math.sin(angle) * radius;
    const x2 = centerX + Math.cos(angle) * (radius + barHeight);
    const y2 = centerY + Math.sin(angle) * (radius + barHeight);

    ctx.strokeStyle = "color(display-p3 1 0 1)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}
// ---------------------------------------------------------------------------

export default AudioVisualizer;
export { type VisualizerType };
