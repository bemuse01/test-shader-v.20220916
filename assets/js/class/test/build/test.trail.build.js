import * as THREE from '../../../lib/three.module.js'
import InstancedPlane from '../../objects/InstancedPlane.js'
import Shader from '../shader/test.trail.shader.js'
import ParentMethod from '../method/test.method.js'
import PublicMethod from '../../../method/method.js'

export default class{
    constructor({group, size, images, textures, attributes, dataTextures, renderOrder, param}){
        this.group = group
        this.size = size
        this.images = images
        this.textures = textures
        this.attributes = attributes
        this.dataTextures = dataTextures
        this.renderOrder = renderOrder

        this.param = {
            ...param
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
                    tBg: {value: bg},
                    tFg: {value: fg},
                    tSeed: {value: this.dataTextures.seed},
                    radius: {value: this.param.radius}
                }
            }
        })

        this.plane.setInstancedAttribute('objPos', this.attributes.objPos, 2)
        this.plane.setInstancedAttribute('elPos', this.attributes.elPos, 2)
        this.plane.setInstancedAttribute('seed', this.attributes.seed, 1)
        this.plane.setInstancedAttribute('opacity', this.attributes.opacity, 1)
        this.plane.setInstancedAttribute('idx', this.attributes.idx, 1)
        this.plane.setInstancedAttribute('scale', this.attributes.scale, 1)

        this.plane.get().renderOrder = this.renderOrder

        this.group.add(this.plane.get())
    }
    createTexture(img){
        const canvas = PublicMethod.createTextureFromCanvas({img, width: this.size.el.w, height: this.size.el.h})
        const bg = new THREE.CanvasTexture(canvas)
        return bg
    }


    // dispose
    dispose(){
        this.plane.dispose()
    }

    
    // animate
    animate(){
        this.plane.getAttribute('objPos').needsUpdate = true
        this.plane.getAttribute('elPos').needsUpdate = true
        this.plane.getAttribute('opacity').needsUpdate = true
    }
}