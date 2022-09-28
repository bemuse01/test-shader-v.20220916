import * as THREE from '../../../lib/three.module.js'
import InstancedPlane from '../../objects/InstancedPlane.js'
import Shader from '../shader/test.drop.shader.js'
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
            ...param,
        }

        this.init()
    }


    // init
    init(){
        this.create()
    }


    // create
    create(){
        const [mona] = this.images
        const [_, fg] = this.textures
        const bg = ParentMethod.createTextureFromCanvas({img: mona, width: this.size.el.w, height: this.size.el.h})

        const {width, radius, count} = this.param

        this.drop = new InstancedPlane({
            count,
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
                    radius: {value: radius},
                    tSeed: {value: this.dataTextures.seed}
                }
            }
        })

        this.drop.setInstancedAttribute('objPos', this.attributes.objPos, 2)
        this.drop.setInstancedAttribute('elPos', this.attributes.elPos, 2)
        this.drop.setInstancedAttribute('seed', this.attributes.seed, 1)
        this.drop.setInstancedAttribute('idx', this.attributes.idx, 1)
        this.drop.setInstancedAttribute('scale', this.attributes.scale, 1)

        this.drop.get().renderOrder = this.renderOrder

        this.group.add(this.drop.get())
    }
    createTexture(img){
        const canvas = PublicMethod.createTextureFromCanvas({img, width: this.size.el.w, height: this.size.el.h})
        const bg = new THREE.CanvasTexture(canvas)
        return bg
    }


    dispose(){
        this.drop.dispose()
    }


    // animate
    animate(){
        this.drop.getAttribute('objPos').needsUpdate = true
        this.drop.getAttribute('elPos').needsUpdate = true
    }
}