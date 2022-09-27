import Drop from './test.drop.build.js'
import Trail from './test.trail.build.js'
import Droplets from './test.droplets.build.js'
import * as THREE from '../../../lib/three.module.js'
import PublicMethod from '../../../method/method.js'

export default class{
    constructor({group, size, images, textures, gpu}){
        this.group = group
        this.size = size
        this.images = images
        this.textures = textures
        this.gpu = gpu

        this.param = {
            width: 10,
            xRange: 0.3,
            count: 20,
            radius: 16,
            momentum: {
                min: 0.3,
                max: 0.4
            },
            wave: 0.003
        }

        this.velocity = Array.from({length: this.param.count}, _ => 0)
        this.timer = Array.from({length: this.param.count}, _ => Math.random())
        this.delay = Array.from({length: this.param.count}, _ => 0)
        this.play = Array.from({length: this.param.count}, _ => true)
        this.position = Array.from({length: this.param.count * 2}, _ => -1000)

        this.radius = this.param.radius * 2

        this.noise = new SimplexNoise()

        this.init()
    }


    // init
    init(){
        this.create()
        // this.initTween()
    }


    // create
    create(){
        const {position, posY, seed, opacity, idx, scale} = this.createAttribute()
        const {seedTexture} = this.createDataTexture()

        this.attributes = {
            position: new Float32Array(position),
            posY: new Float32Array(posY),
            seed: new Float32Array(seed),
            opacity: new Float32Array(opacity),
            idx: new Float32Array(idx),
            scale: new Float32Array(scale)
        }

        this.dataTextures = {
            seed: seedTexture
        }
        
        this.drop = new Drop({...this, renderOrder: 3, attributes: this.attributes, dataTextures: this.dataTextures, param: this.param})
        this.trail = new Trail({...this, renderOrder: 1, attributes: this.attributes, dataTextures: this.dataTextures, param: this.param})
        this.droplets = new Droplets({...this, renderOrder: 2})
    }
    createAttribute(){
        const {count} = this.param

        const w = this.size.obj.w
        const h = this.size.el.h

        const position = []
        const posY = []
        const seed = []
        const opacity = []
        const idx = []
        const scale = []

        for(let i = 0; i < count; i++){
            const x = Math.random() * w - w / 2
            position.push(x, 0)


            const y = h + this.radius
            posY.push(y)

            
            const s = Math.random() * 5
            seed.push(s)


            const o = 1
            opacity.push(o)


            const index = i / (count - 1)
            idx.push(index)


            const scl = Math.random() * 0.25 + 1
            scale.push(scl)
        }

        return {position, posY, seed, opacity, idx, scale}
    }
    createDataTexture(){
        const {count, wave} = this.param
        const h = ~~(this.size.el.h)
        const seed = []
        const rand = Math.random()
        
        for(let i = 0; i < h; i++){
            for(let j = 0; j < count; j++){

                const r = SIMPLEX.noise3D(rand, j * 0.01, i * wave * rand)
                const n = r

                seed.push(n, 0, 0, 0)
            }
        }

        const seedTexture = new THREE.DataTexture(new Float32Array(seed), count, h, THREE.RGBAFormat, THREE.FloatType)
        seedTexture.needsUpdate = true

        return {seedTexture}
    }
    updateSeedDataTexture(col){
        const {wave} = this.param
        const {data, width, height} = this.dataTextures.seed.image
        const rand = Math.random()

        for(let i = 0; i < height; i++){
            const idx = (i * width + col) * 4

            const r = SIMPLEX.noise3D(rand, col * 0.01, i * wave * rand)
            const n = r

            data[idx] = n
        }

        this.dataTextures.seed.needsUpdate = true
    }


    // animate
    animate(){
        this.moveDrop()
        this.getDropPosition()
        this.trail.animate()
        this.drop.animate()
        this.droplets.animate()
    }
    moveDrop(){
        const {count, momentum} = this.param
        const posY = this.attributes.posY
        const velocity = this.velocity
        const timer = this.timer
        const delay = this.delay
        const play = this.play

        for(let i = 0; i < count; i++){
            const momen = THREE.MathUtils.randFloat(momentum.min, momentum.max)

            delay[i] += 0.005

            if(delay[i] > timer[i]) velocity[i] -= momen

            posY[i] += velocity[i]

            if(posY[i] < -this.radius){
                if(play[i] === false) continue
                play[i] = false
                this.createTween(i)
            }
        }
    }
    getDropPosition(){
        const {count} = this.param
        const position = this.attributes.position
        const posY = this.attributes.posY
        const {data, width, height} = this.dataTextures.seed.image

        const ew = this.size.el.w
        const ow = this.size.obj.w
        const eh = this.size.el.h
        const oh = this.size.obj.h

        const len = height

        for(let i = 0; i < count; i++){
            const idx = i * 2

            const y = posY[i]
            const y2 = (posY[i] - (eh * 0.5)) / eh * oh

            if(y > eh || y < 0) continue

            const index = ~~((y / eh) * len)
            const idx2 = (index * width + i) * 4 

            const seed = data[idx2]
            const nSeed = PublicMethod.normalize(seed, 0.4875, 0.5125, -1.0, 1.0)
            const xSeed = nSeed * ew

            const cx = (position[idx] / ow) * ew
            const x = ((xSeed + cx) - (ew * 0.5)) / ew * ow

            this.position[idx + 0] = x
            this.position[idx + 1] = y2
        }
    }


    // tween
    createTween(idx){
        const position = this.attributes.position
        const posY = this.attributes.posY
        const opacity = this.attributes.opacity

        const start = {o: 1}
        const end = {o: 0}

        const tw = new TWEEN.Tween(start)
        .to(end, 1000)
        .onUpdate(() => this.onUpdateTween(idx, opacity, start))
        .onComplete(() => this.onCompleteTween(idx, posY, opacity, position))
        // .repeat(Infinity)
        // .delay(Math.random() * 1000)
        .start()
    }
    onUpdateTween(idx, opacity, {o}){
        opacity[idx] = o
    }
    onCompleteTween(idx, posY, opacity, position){
        const w = this.size.obj.w
        const h = this.size.el.h
        const x = Math.random() * w - w / 2

        posY[idx] = h + this.radius
        opacity[idx] = 1
        position[idx * 2] = x
        this.updateSeedDataTexture(idx)

        this.velocity[idx] = -(Math.random() * 1 + 1)

        this.play[idx] = true
    
        this.delay[idx] = 0
    }
}