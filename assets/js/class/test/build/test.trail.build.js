import * as THREE from '../../../lib/three.module.js'
import Plane from '../../objects/plane.js'
import Shader from '../shader/test.trail.shader.js'
import ParentMethod from '../method/test.method.js'
import PublicMethod from '../../../method/method.js'

export default class{
    constructor({group, size, images, textures, seed, renderOrder, drop}){
        this.group = group
        this.size = size
        this.images = images
        this.textures = textures
        this.seed = seed
        this.renderOrder = renderOrder
        this.drop = drop.getObject()

        this.param = {
            width: 10,
            xRange: 0.15,
            xDist: 5,
        }

        this.ratio = 0

        this.init()
    }


    // init
    init(){
        this.create()
    }


    // create
    create(){
        this.createTrail()
        // this.createDrop()
    }
    createTrail(){
        const [mona] = this.images
        const [fg] = this.textures
        const bg = ParentMethod.createTextureFromCanvas({img: mona, width: this.size.el.w, height: this.size.el.h})

        this.plane = new Plane({
            width: this.param.width,
            // width: this.size.obj.w,
            height: this.size.obj.h,
            widthSeg: 1,
            heightSeg: 1,
            materialName: 'ShaderMaterial',
            materialOpt: {
                vertexShader: Shader.vertex,
                fragmentShader: Shader.fragment,
                transparent: true,
                uniforms: {
                    eResolution: {value: new THREE.Vector2(this.size.el.w, this.size.el.h)},
                    oResolution: {value: new THREE.Vector2(this.size.obj.w, this.size.obj.h)},
                    width: {value: this.param.width},
                    time: {value: 0},
                    tBg: {value: bg},
                    tFg: {value: fg},
                    uSeed: {value: this.seed},
                    currentY: {value: 0},
                }
            }
        })

        this.plane.get().renderOrder = this.renderOrder

        this.group.add(this.plane.get())
    }
    createDrop(){
        this.drop = new Plane({
            width: 4, 
            height: 4,
            widthSeg: 1,
            heightSeg: 1,
            materialName: 'MeshBasicMaterial',
            materialOpt: {
                color: 0xffffff
            }
        })

        this.group.add(this.drop.get())
    }


    // texture
    createTexture(){
    }


    // animate
    animate(){
        const time = this.plane.getUniform('time') + 0.1

        const currentY = 1 - this.drop.getUniform('uPos').y / this.size.el.h
   
        // console.log(currentY)
        
        this.plane.setUniform('time', time)
        this.plane.setUniform('currentY', currentY)

    }
    moveDrop(){
        const mesh = this.drop.get()
        const pos = mesh.position
        const {xRange, xDist} = this.param

        const size = 8 / 2
        const height = this.size.obj.h
        const halfHeight = height / 2

        const cy = pos.y
        
        const bound = new THREE.Vector2(0, halfHeight)
        this.ratio = new THREE.Vector2(0, pos.y).distanceTo(bound) / height

        const rn = SIMPLEX.noise2D(0.0 * 0.2, this.ratio * 5.0)
        // const pn = THREE.MathUtils.mapLinear(rn, -1, 1, -xRange, xRange)
        const pn = PublicMethod.normalize(rn, -xRange, xRange, -1, 1)

        pos.x = pn * xDist
        pos.y -= 0.1

        if(cy < -halfHeight + -size) pos.y = halfHeight + size
    }
}