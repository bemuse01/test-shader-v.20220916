import * as THREE from '../../../lib/three.module.js'
import Plane from '../../objects/plane.js'
import InstancedPlane from '../../objects/InstancedPlane.js'
import Shader from '../shader/test.trail.shader.js'
import ParentMethod from '../method/test.method.js'
import PublicMethod from '../../../method/method.js'

export default class{
    constructor({group, size, images, textures, position, posY, renderOrder, drop}){
        this.group = group
        this.size = size
        this.images = images
        this.textures = textures
        this.position = position
        this.posY = posY
        this.renderOrder = renderOrder
        this.drop = drop.getObject()

        this.param = {
            width: 10,
            xRange: 0.15,
            xDist: 5,
            count: 10,
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
    }
    createTrail(){
        const [mona] = this.images
        const [fg] = this.textures
        const bg = ParentMethod.createTextureFromCanvas({img: mona, width: this.size.el.w, height: this.size.el.h})

        this.plane = new InstancedPlane({
            count: this.param.count,
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
                    currentY: {value: 0},
                }
            }
        })

        this.plane.setInstancedAttribute('aPosition', this.position, 2)
        this.plane.setInstancedAttribute('posY', this.posY, 1)

        this.plane.get().renderOrder = this.renderOrder

        this.group.add(this.plane.get())
    }


    // texture
    createTexture(){
    }


    // animate
    animate(){
        const time = this.plane.getUniform('time') + 0.1

        const currentY = 1 - this.drop.getUniform('uPos').y / this.size.el.h

        this.plane.setUniform('time', time)
        this.plane.setUniform('currentY', currentY)
        
        this.plane.getAttribute('posY').needsUpdate = true
    }
}