import * as THREE from '../../../lib/three.module.js'
import Plane from '../../objects/plane.js'
import Shader from '../shader/test.trail.shader.js'

export default class{
    constructor({group, size}){
        this.group = group
        this.size = size

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
        this.plane = new Plane({
            // width: this.param.width,
            width: this.size.obj.w,
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
                    width: {value: this.param.width}
                }
            }
        })

        this.group.add(this.plane.get())
    }
}