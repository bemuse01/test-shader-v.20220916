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
        const texture = this.createCanvasTexture(mona, el.w, el.h)
        
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
                    uTexture: {value: texture}
                } 
            }
        })

        this.group.add(this.plane.get())
    }


    // 
    createCanvasTexture(img, width, height){
        const canvas = ParentMethod.createTextureFromCanvas({img, width, height})
        const texture = new THREE.CanvasTexture(canvas)
        return texture
    }


    // resize
    resize(size){
        this.size = size
        const {el, obj} = this.size
        const [mona] = this.images

        this.plane.resize(obj.w, obj.h)

        const texture = this.createCanvasTexture(mona, el.w, el.h)
        this.plane.setUniform('uTexture', texture)
    }
}