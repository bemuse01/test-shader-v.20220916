import InstancedPlane from '../../objects/InstancedPlane.js'
import * as THREE from '../../../lib/three.module.js'
import ParentMethod from '../method/test.method.js'
import Shader from '../shader/test.lines.shader.js'

export default class{
    constructor({group, size, images}){
        this.group = group
        this.size = size
        this.images = images

        this.param = {
            count: 300,
            height: 20
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
        const {count, height} = this.param
        const [mona] = this.images
        const texture = ParentMethod.createTextureFromCanvas({img: mona, width: el.w, height: el.h})

        const width = obj.w / count

        this.plane = new InstancedPlane({
            count: count,
            width,
            height,
            widthSeg: 1,
            heightSeg: 1,
            materialName: 'ShaderMaterial',
            materialOpt: {
                vertexShader: Shader.vertex,
                fragmentShader: Shader.fragment,
                transparent: true,
                uniforms: {

                }
            }
        })

        const {position} = this.createAttribute()

        this.plane.setInstancedAttribute('aPosition', new Float32Array(position), 3)

        this.group.add(this.plane.get())
    }
    createAttribute(){
        const position = []

        const {count} = this.param
        const width = this.size.obj.w
        const halfWidth = width / 2
        const w = width / (count - 1)

        for(let i = 0; i < count; i++){
            const x = -halfWidth + w * i
            const y = 0

            position.push(x, y, 0)
        }

        return {position}
    }


    // resize
    resize(size){

    }
}