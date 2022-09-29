const DPR = window.devicePixelRatio
const NORMAL = 0, PROCESS = 1
const OUT = 0, IN = 1
const RADIAN = Math.PI / 180
const RATIO = DPR < 1.0 ? 1.0 : DPR > 2.0 ? 2.0 : DPR
const SIMPLEX = new SimplexNoise()
let WIDTH = window.innerWidth, HEIGHT = window.innerHeight