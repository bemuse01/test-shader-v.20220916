import * as THREE from '../../../lib/three.module.js'
import Plane from '../../objects/plane.js'
import Shader from '../shader/test.drop.shader.js'
import ParentMethod from '../method/test.method.js'

export default class{
    constructor({group, size, images, textures, seed, renderOrder}){
        this.group = group
        this.size = size
        this.images = images
        this.textures = textures
        this.seed = seed
        this.renderOrder = renderOrder

        this.param = {
            width: 10,
            size: 16
        }

        this.init()
    }


    // init
    init(){
        this.create()
        this.createTween()
    }


    // create
    create(){
        const [mona] = this.images
        const [_, fg] = this.textures
        const bg = ParentMethod.createTextureFromCanvas({img: mona, width: this.size.el.w, height: this.size.el.h})

        const {width, size} = this.param

        this.drop = new Plane({
            width,
            height: this.size.obj.h,
            widthSeg: 1,
            heightSeg: 1,
            materialName: 'ShaderMaterial',
            materialOpt: {
                vertexShader: Shader.vertex,
                fragmentShader: Shader.fragment,
                transparent: true,
                uniforms: {
                    tBg: {value: bg},
                    tFg: {value: fg},
                    eResolution: {value: new THREE.Vector2(this.size.el.w, this.size.el.h)},
                    oResolution: {value: new THREE.Vector2(this.size.obj.w, this.size.obj.h)},
                    width: {value: width},
                    uSize: {value: size},
                    uPos: {value: new THREE.Vector2(0, 0)},
                    uSeed: {value: this.seed},
                    time: {value: 0}
                }
            }
        })

        this.drop.get().renderOrder = this.renderOrder

        this.group.add(this.drop.get())
    }


    // tween
    createTween(){
        const len = ~~(this.seed.image.data.length / 4)
        const data = Array.from({length: len}, (_, idx) => this.seed.image.data[idx * 4 + 1])
        const hw = this.size.el.w
        const hh = this.size.el.h

        const startX = (0.5 + data[0] * 0.1) * hw
        const endX = data.map(e => (0.5 + e * 0.1) * hw)

        const start = {x: startX, y: hh}
        const end = {x: endX, y: 0}

        const tw = new TWEEN.Tween(start)
        .to(end, 5000)
        .onUpdate(() => this.onUpdateTween(start))
        .start()
    }
    onUpdateTween({x, y}){
        this.drop.setUniform('uPos', new THREE.Vector2(x, y))
    }


    // get
    getObject(){
        return this.drop
    }


    // animate
    animate(){
        const time = window.performance.now()

        this.drop.setUniform('time', SIMPLEX.noise2D(0.1, time * 0.001))
    }
}