import * as THREE from '../../../lib/three.module.js'
import Plane from '../../objects/plane.js'
import Shader from '../shader/test.drop.shader.js'

export default class{
    constructor({group, size, images, textures}){
        this.group = group
        this.size = size
        this.images = images
        this.textures = textures

        this.param = {
            width: 10,
            size: 5
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
                    eResolution: {value: new THREE.Vector2(this.size.el.w, this.size.el.h)},
                    oResolution: {value: new THREE.Vector2(this.size.obj.w, this.size.obj.h)},
                    width: {value: width},
                    uSize: {Value: size}
                }
            }
        })

        this.group.add(this.drop.get())
    }
}