type VisualizerType = 'bars' | 'curve' | 'waveform' | 'circular'
// prettier-ignore
type FftSize = 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096 | 8192 | 16384 | 32768
type LCH = [number, number, number]

const defaultAvData = new Uint8Array([
  136, 173, 191, 189, 171, 161, 159, 133, 125, 118, 92, 95, 84, 69, 72, 59, 53,
  53, 39, 39, 38, 25, 28, 26, 17, 22, 16, 13, 12, 1, 11, 12, 1, 5, 6, 0, 0, 0,
  0, 11, 22, 30, 37, 24, 23, 38, 31, 10, 24, 29, 23, 23, 36, 34, 39, 34, 18, 30,
  49, 64, 54, 30, 50, 78, 80, 57, 75, 71, 43, 41, 46, 49, 60, 62, 56, 81, 96,
  80, 73, 75, 70, 77, 77, 60, 65, 64, 50, 52, 60, 60, 65, 63, 59, 63, 57, 46,
  51, 63, 65, 67, 68, 62, 69, 66, 59, 58, 56, 57, 62, 69, 65, 61, 63, 57, 50,
  56, 61, 62, 67, 61, 62, 75, 75, 65, 63, 62, 70, 84, 77, 73, 75, 65, 61, 62,
  64, 75, 73, 63, 56, 69, 62, 56, 62, 57, 56, 69, 71, 59, 67, 67, 71, 74, 67,
  59, 48, 58, 58, 58, 51, 53, 57, 62, 55, 44, 48, 44, 47, 54, 53, 47, 36, 42,
  47, 43, 45, 46, 43, 30, 36, 33, 35, 37, 42, 37, 32, 31, 38, 37, 27, 29, 32,
  28, 24, 19, 19, 24, 21, 25, 27, 25, 22, 12, 22, 22, 9, 7, 4, 8, 11, 16, 9, 1,
  5, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
])

interface AudioVisualizerConfig {
  audioContext: AudioContext
  canvas: HTMLCanvasElement
  fftSize?: FftSize
  smoothingTimeConstant?: number
  type?: VisualizerType
  bgLCH?: LCH
  fgLCH?: LCH
}

const visualizerTypes = ['bars', 'curve', 'waveform'] as const

class AudioVisualizer {
  private _canvas: HTMLCanvasElement
  private _ctx: CanvasRenderingContext2D
  private _width: number = 0
  private _height: number = 0
  private _controller = new AbortController()
  private _animationId: number | null = null
  private _bgLCH: LCH
  private _fgLCH: LCH

  private _analyser: AnalyserNode
  private _type: VisualizerType

  private _dataArray: Uint8Array<ArrayBuffer>
  private _fftSize: FftSize
  private _smoothingTimeConstant: number

  constructor(config: AudioVisualizerConfig) {
    this._canvas = config.canvas
    this._bgLCH = config.bgLCH ?? [0.1381, 0.006, 245]
    this._fgLCH = config.fgLCH ?? [0.725, 0.36, 331.46]

    const context = this._canvas.getContext('2d', {
      alpha: false,
      colorSpace: 'display-p3',
    })

    if (!context) throw new Error('Could not get 2D context from canvas')

    this._ctx = context
    this._fftSize = config.fftSize ?? 512
    this._smoothingTimeConstant = config.smoothingTimeConstant ?? 0.8
    this._type = config.type ?? 'bars'
    this._dataArray = defaultAvData

    this._analyser = new AnalyserNode(config.audioContext, {
      fftSize: this._fftSize,
      smoothingTimeConstant: this._smoothingTimeConstant,
    })
    this._analyser.connect(config.audioContext.destination)

    const { signal } = this._controller
    window.addEventListener('resize', () => this.resize(), { signal })
    this.draw = this.draw.bind(this) // Bind methods (so that we can pass them directly to RAF)
    this.resize()
  }

  private resize() {
    const rect = this._canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    this._canvas.width = rect.width * dpr
    this._canvas.height = rect.height * dpr

    this._ctx.scale(dpr, dpr)

    this._width = rect.width
    this._height = rect.height
    this.render()
  }

  start() {
    if (!this._animationId) this.draw()
  }

  stop() {
    if (this._animationId) {
      cancelAnimationFrame(this._animationId)
      this._animationId = null
    }
  }

  type(type: VisualizerType) {
    this._type = type
  }

  nextType() {
    const i = visualizerTypes.findIndex((t) => t === this._type)
    if (i < 0) return
    this._type = visualizerTypes[(i + 1) % visualizerTypes.length]
    this.getByteData()
    this.render()
  }

  bgLCH(lch: LCH) {
    this._bgLCH = lch
    if (this.paused) this.render()
  }

  fgLCH(lch: LCH) {
    this._fgLCH = lch
    if (this.paused) this.render()
  }

  private render() {
    const data = this._dataArray

    // Clear canvas
    const [l, c, h] = this._bgLCH
    this._ctx.fillStyle = `oklch(${l} ${c} ${h})`
    this._ctx.fillRect(0, 0, this._width, this._height)

    // Draw based on type
    const { _ctx, _width, _height, _fgLCH } = this
    switch (this._type) {
      case 'bars':
        drawSpectrumBars(_ctx, data, _width, _height, _fgLCH)
        break
      case 'curve':
        drawSpectrumCurve(_ctx, data, _width, _height, _fgLCH)
        break
      case 'waveform':
        drawOscilloscope(_ctx, data, _width, _height, _fgLCH)
        break
      case 'circular':
        drawCircular(_ctx, data, _width, _height, _fgLCH)
        break
      default:
        console.log(this._type satisfies never)
    }
  }

  private getByteData() {
    if (this._type === 'waveform') {
      this._analyser.getByteTimeDomainData(this._dataArray)
    } else {
      this._analyser.getByteFrequencyData(this._dataArray)
    }
  }

  private draw() {
    if (!this._analyser) return
    this._animationId = requestAnimationFrame(this.draw)

    this.getByteData()
    this.render()
  }

  get node() {
    return this._analyser
  }

  get paused() {
    return !this._animationId
  }

  destroy() {
    this.stop()
    this._analyser.disconnect()
    this._controller.abort()
    // @ts-expect-error destroy audioContext
    this._analyser = null
    // @ts-expect-error destroy audioContext
    this._dataArray = null
  }
}

// ---------------------------------------------------------------------------
// VISUALIZER FUNCTIONS
function drawSpectrumBars(
  ctx: CanvasRenderingContext2D,
  data: Uint8Array<ArrayBuffer> | null,
  width: number,
  height: number,
  fgLch: LCH,
  numBars = 80,
) {
  if (!data) return

  const barWidth = width / numBars
  const barGap = 2
  const samplesPerBar = Math.floor(data.length / numBars)
  const [l, c, h] = fgLch
  ctx.fillStyle = `oklch(${l} ${c} ${h})`

  for (let i = 0; i < numBars; i++) {
    const startIndex = i * samplesPerBar
    const endIndex = startIndex + samplesPerBar
    const value = data[Math.floor((startIndex + endIndex) / 2)]
    const barHeight = (value / 255) * height * 0.9 + height * 0.005

    ctx.fillRect(
      i * barWidth,
      height / 2 - barHeight / 2,
      barWidth - barGap,
      barHeight,
    )
  }
}

function drawSpectrumCurve(
  ctx: CanvasRenderingContext2D,
  data: Uint8Array<ArrayBuffer> | null,
  width: number,
  height: number,
  fgLch: LCH,
  numPoints = 80,
) {
  if (!data) return

  const samplesPerPoint = Math.floor(data.length / numPoints)
  const pointSpacing = width / (numPoints - 1)

  // Collect data points
  const points: { x: number; y: number }[] = []
  for (let i = 0; i < numPoints; i++) {
    const startIndex = i * samplesPerPoint
    const endIndex = startIndex + samplesPerPoint
    const value = data[Math.floor((startIndex + endIndex) / 2)]

    // Invert so higher values are at top
    const normalizedValue = value / 255
    const y = height - (normalizedValue * height * 0.9 + height * 0.05)

    points.push({
      x: i * pointSpacing,
      y: y,
    })
  }

  const drawCurve = () => {
    for (let i = 0; i < points.length - 1; i++) {
      const currentPoint = points[i]
      const nextPoint = points[i + 1]

      // Calculate control point for smooth curve (midpoint)
      const controlX = (currentPoint.x + nextPoint.x) / 2
      const controlY = (currentPoint.y + nextPoint.y) / 2

      ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, controlX, controlY)
    }
  }

  // Draw filled area under the curve
  ctx.beginPath()
  ctx.moveTo(points[0].x, height) // Start at bottom-left
  ctx.lineTo(points[0].x, points[0].y) // Go to first data point
  drawCurve()

  // Connect to last point
  const lastPoint = points[points.length - 1]
  ctx.lineTo(lastPoint.x, lastPoint.y)

  // Complete the fill area
  ctx.lineTo(lastPoint.x, height) // Go to bottom-right
  ctx.closePath()

  // Fill with gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  const [l, c, h] = fgLch
  gradient.addColorStop(0, `oklch(${l} ${c} ${h} / 0.5)`)
  gradient.addColorStop(1, `oklch(${l} ${c} ${h} / 0.1)`)
  ctx.fillStyle = gradient
  ctx.fill()

  // Draw the line on top
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  drawCurve()

  ctx.lineTo(lastPoint.x, lastPoint.y)
  ctx.strokeStyle = `oklch(${l} ${c} ${h})`
  ctx.lineWidth = 2
  ctx.stroke()
}

function drawOscilloscope(
  ctx: CanvasRenderingContext2D,
  data: Uint8Array<ArrayBuffer> | null,
  width: number,
  height: number,
  fgLch: LCH,
) {
  if (!data) return

  const [l, c, h] = fgLch
  ctx.strokeStyle = `oklch(${l} ${c} ${h})`
  ctx.lineWidth = 2
  ctx.beginPath()

  const sliceWidth = width / data.length
  let x = 0

  for (let i = 0; i < data.length; i++) {
    const v = data[i] / 128.0
    const y = (v * height) / 2

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }

    x += sliceWidth
  }

  ctx.lineTo(width, height / 2)
  ctx.stroke()
}

function drawCircular(
  ctx: CanvasRenderingContext2D,
  data: Uint8Array<ArrayBuffer> | null,
  width: number,
  height: number,
  fgLch: LCH,
) {
  if (!data) return

  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) * 0.3

  const angleStep = (Math.PI * 2) / data.length

  for (let i = 0; i < data.length; i++) {
    const angle = i * angleStep - Math.PI / 2
    const barHeight = (data[i] / 255) * (radius * 0.8)

    const x1 = centerX + Math.cos(angle) * radius
    const y1 = centerY + Math.sin(angle) * radius
    const x2 = centerX + Math.cos(angle) * (radius + barHeight)
    const y2 = centerY + Math.sin(angle) * (radius + barHeight)

    const [l, c, h] = fgLch
    ctx.strokeStyle = `oklch(${l} ${c} ${h})`
    ctx.lineWidth = 2

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
}
// ---------------------------------------------------------------------------

export default AudioVisualizer
export { type VisualizerType }
