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

        this.init()
    }


    // init
    init(){
        this.create()
        // this.initTween()
    }


    // create
    create(){
        const {position, posY, seed} = this.createAttribute()

        this.attributes = {
            position: new Float32Array(position),
            posY: new Float32Array(posY),
            seed: new Float32Array(seed)
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

        for(let i = 0; i < count; i++){
            const x = Math.random() * w - w / 2
            position.push(x, 0)


            const y = h
            posY.push(y)

            
            const s = Math.random() * 0.4 + 0.4
            seed.push(s)
        }

        return {position, posY, seed}
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

            if(posY[i] < 0){
                posY[i] = h
                this.momentum[i] = Math.random() * -1
            }
        }
    }


    // tween
    createTween(){
        const start = {}
        const end = {}

        const tw = new TWEEN.Tween(start)
        .to(end, 1500)
        .onUpdate(() => this.onUpdateTween())
        .repeat(Infinity)
        // .delay(Math.random() * 1000)
        .start()
    }
    onUpdateTween(){
    }
}