import Drop from './test.drop.build.js'
import Trail from './test.trail.build.js'
import * as THREE from '../../../lib/three.module.js'
import PublicMethod from '../../../method/method.js'

export default class{
    constructor({group, size, images, textures}){
        this.group = group
        this.size = size
        this.images = images
        this.textures = textures

        this.param = {
            width: 10,
            xRange: 0.3,
            count: 10,
            radius: 16,
            momentum: {
                min: 0.2,
                max: 0.3
            }
        }

        this.velocity = Array.from({length: this.param.count}, _ => 0)
        this.timer = Array.from({length: this.param.count}, _ => Math.random())
        this.delay = Array.from({length: this.param.count}, _ => 0)
        this.play = Array.from({length: this.param.count}, _ => true)

        this.radius = this.param.radius * 2

        this.init()
    }


    // init
    init(){
        this.create()
        // this.initTween()
    }


    // create
    create(){
        const {position, posY, seed, opacity, idx} = this.createAttribute()
        const {seedTexture} = this.createDataTexture()

        this.attributes = {
            position: new Float32Array(position),
            posY: new Float32Array(posY),
            seed: new Float32Array(seed),
            opacity: new Float32Array(opacity),
            idx: new Float32Array(idx)
        }

        this.dataTextures = {
            seed: seedTexture
        }
        
        this.drop = new Drop({...this, renderOrder: 2, attributes: this.attributes, dataTextures: this.dataTextures, param: this.param})
        this.trail = new Trail({...this, renderOrder: 1, attributes: this.attributes, dataTextures: this.dataTextures, param: this.param})
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

        for(let i = 0; i < count; i++){
            const x = Math.random() * w - w / 2
            position.push(x, 0)


            const y = h + this.radius
            posY.push(y)

            
            const s = Math.random() * 1
            seed.push(s)


            const o = 1
            opacity.push(o)


            const index = i / (count - 1)
            idx.push(index)
        }

        return {position, posY, seed, opacity, idx}
    }
    createDataTexture(){
        const {count} = this.param
        const h = ~~(this.size.el.h)
        const seed = []
        
        for(let i = 0; i < h; i++){
            for(let j = 0; j < count; j++){
                const r = SIMPLEX.noise2D(j * 0.01, i * 0.0015)
                const n = r * 0.5 + 0.5

                seed.push(n, 0, 0, 0)
            }
        }

        const seedTexture = new THREE.DataTexture(new Float32Array(seed), count, h, THREE.RGBAFormat, THREE.FloatType)
        seedTexture.needsUpdate = true

        return {seedTexture}
    }
    updateSeedDataTexture(col){
        const {data, width, height} = this.dataTextures.seed.image

        for(let i = 0; i < height; i++){
            for(let j = col; j < col + 1; j++){
                const idx = (i * width + j) * 4

                const r = SIMPLEX.noise2D(j * 0.01, i * 0.0015)
                const n = r * 0.5 + 0.5

                data[idx] = n
            }
        }

        this.dataTextures.seed.needsUpdate = true
    }


    // animate
    animate(){
        this.moveDrop()
        this.trail.animate()
        this.drop.animate()
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

            delay[i] += 0.01

            if(delay[i] > timer[i]) velocity[i] -= momen

            posY[i] += velocity[i]

            if(posY[i] < -this.radius){
                if(play[i] === false) continue
                play[i] = false
                this.createTween(i)
            }
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