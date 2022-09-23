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
                min: 0.2,
                max: 0.3
            }
        }

        this.momentum = Array.from({length: this.param.count}, _ => -(Math.random() * 1 + 1))
        this.play = Array.from({length: this.param.count}, _ => true)

        this.init()
    }


    // init
    init(){
        this.create()
        // this.initTween()
    }


    // create
    create(){
        const {position, posY, seed, opacity} = this.createAttribute()

        this.attributes = {
            position: new Float32Array(position),
            posY: new Float32Array(posY),
            seed: new Float32Array(seed),
            opacity: new Float32Array(opacity)
        }
        
        this.drop = new Drop({...this, renderOrder: 2, attributes: this.attributes})
        this.trail = new Trail({...this, renderOrder: 1, attributes: this.attributes})
    }
    createAttribute(){
        const {count} = this.param

        const w = this.size.obj.w
        const h = this.size.el.h

        const position = []
        const posY = []
        const seed = []
        const opacity = []

        for(let i = 0; i < count; i++){
            const x = Math.random() * w - w / 2
            position.push(x, 0)


            const y = h
            posY.push(y)

            
            const s = Math.random() * 0.4 + 0.4
            seed.push(s)


            const o = 1
            opacity.push(o)
        }

        return {position, posY, seed, opacity}
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

        const posY = this.attributes.posY

        for(let i = 0; i < count; i++){
            this.momentum[i] -= THREE.MathUtils.randFloat(momentum.min, momentum.max)

            posY[i] += this.momentum[i]

            if(posY[i] < -10){
                if(this.play[i] === false) continue
                this.play[i] = false
                this.createTween(i)
            }
        }
    }


    // tween
    createTween(idx){
        const posY = this.attributes.posY
        const opacity = this.attributes.opacity

        const start = {o: 1}
        const end = {o: 0}

        const tw = new TWEEN.Tween(start)
        .to(end, 1000)
        .onUpdate(() => this.onUpdateTween(idx, opacity, start))
        .onComplete(() => this.onCompleteTween(idx, posY, opacity))
        // .repeat(Infinity)
        // .delay(Math.random() * 1000)
        .start()
    }
    onUpdateTween(idx, opacity, {o}){
        opacity[idx] = o
    }
    onCompleteTween(idx, posY, opacity){
        const h = this.size.el.h

        posY[idx] = h + 10
        opacity[idx] = 1

        this.momentum[idx] = -(Math.random() * 1 + 1)

        this.play[idx] = true
    }
}