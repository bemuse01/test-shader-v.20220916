import * as THREE from '../../../lib/three.module.js'
import Plane from '../../objects/plane.js'
import ParentMethod from '../method/test.method.js'
import Shader from '../shader/test.bg.shader.js'

export default class{
    constructor({group, size, gpu, images}){
        this.group = group
        this.size = size
        this.gpu = gpu
        this.images = images

        this.param = {
            brightness: 0.4
        }

        this.init()
    }


    // init
    init(){
        this.create()
    }


    // create
    create(){
        const {el, obj} = this.size
        const [mona] = this.images
        const texture = ParentMethod.createTextureFromCanvas({img: mona, width: el.w, height: el.h})
        
        this.plane = new Plane({
            width: obj.w,
            height: obj.h,
            widthSeg: 1,
            heightSeg: 1,
            materialName: 'ShaderMaterial',
            materialOpt: {
                vertexShader: Shader.vertex,
                fragmentShader: Shader.fragment,
                transparent: true,
                uniforms: {
                    uTexture: {value: texture},
                    brightness: {value: this.param.brightness}
                } 
            }
        })

        this.group.add(this.plane.get())
    }


    // resize
    resize(size){
        this.size = size

        this.group.clear()
        this.plane.dispose()
        this.create()
    }
}