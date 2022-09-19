import * as THREE from '../../../lib/three.module.js'
import Plane from '../../objects/plane.js'
import Shader from '../shader/test.trail.shader.js'
import ParentMethod from '../method/test.method.js'

export default class{
    constructor({group, size, images}){
        this.group = group
        this.size = size
        this.images = images
        // this.textures = textures

        this.param = {
            width: 10
        }

        this.init()
    }


    // init
    init(){
        this.create()
    }


    // create
    create(){
        // const [trail] = this.textures
        const [mona] = this.images
        const texture = ParentMethod.createTextureFromCanvas({img: mona, width: this.size.el.w, height: this.size.el.h})

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
                    uTexture: {value: texture}
                }
            }
        })

        this.group.add(this.plane.get())
    }


    // animate
    animate(){
        const time = this.plane.getUniform('time') + 0.1
        
        this.plane.setUniform('time', time)
    }
}