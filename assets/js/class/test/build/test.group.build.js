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
            momentum: {
                min: 0.05,
                max: 0.1
            }
        }

        this.momentum = Array.from({length: this.param.count}, _ => Math.random() * -1)
        console.log(this.momentum)

        this.init()
    }


    // init
    init(){
        this.create()
        // this.initTween()
    }


    // create
    create(){
        const {position, posY} = this.createAttribute()
        const {seed} = this.createTexture()

        this.seed = seed
        this.position = new Float32Array(position)
        this.posY = new Float32Array(posY)

        this.drop = new Drop({...this, renderOrder: 2, position: this.position, posY: this.posY})
        this.trail = new Trail({...this, renderOrder: 1, position: this.position, posY: this.posY})
    }
    createAttribute(){
        const {count} = this.param

        const w = this.size.obj.w
        const h = this.size.el.h

        const position = []
        const posY = []

        for(let i = 0; i < count; i++){
            const x = Math.random() * w - w / 2

            position.push(x, 0)


            const y = h

            posY.push(y)
        }

        return {position, posY}
    }
    createTexture(){
        const seed = []

        const height = ~~this.size.el.h
        const {xRange} = this.param

        for(let i = 0; i < height; i++){
            const ratio = 1.0 - i / height

            const rn = SIMPLEX.noise2D(0.0 * 0.2, ratio * 5.0)
            const pn = PublicMethod.normalize(rn, -xRange, xRange, -1, 1)

            seed.push(ratio, pn, 0, 0)
        }

        const seedTexture = new THREE.DataTexture(new Float32Array(seed), 1, height, THREE.RGBAFormat, THREE.FloatType)
        seedTexture.needsUpdate = true

        return {seed: seedTexture}
    }


    // animate
    animate(){
        this.moveDrop()
        this.trail.animate()
        this.drop.animate()
    }
    moveDrop(){
        const {count, momentum} = this.param
        const h = this.size.el.h

        for(let i = 0; i < count; i++){
            this.momentum[i] -= THREE.MathUtils.randFloat(momentum.min, momentum.max)

            this.posY[i] += this.momentum[i]

            if(this.posY[i] < 0){
                this.posY[i] = h
                this.momentum[i] = Math.random() * -1
            }
        }
    }


    // tween
    // initTween(){
    //     for(let i = 0; i < this.param.count; i++){
    //         this.createTween(i)
    //     }
    // }
    // createTween(idx){
    //     const hh = this.size.el.h

    //     const start = {y: hh}
    //     const end = {y: 0}

    //     const tw = new TWEEN.Tween(start)
    //     .to(end, 1500)
    //     .onUpdate(() => this.onUpdateTween(idx, start))
    //     .repeat(Infinity)
    //     // .delay(Math.random() * 1000)
    //     .start()
    // }
    // onUpdateTween(idx, {y}){
        
    //     this.posY[idx] = y
    // }
}