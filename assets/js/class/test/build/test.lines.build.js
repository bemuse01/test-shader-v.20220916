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
            height: 160,
            brightness: 1.5,
            chance: 0.999
        }

        this.velocity = Array.from({length: this.param.count}, _ => Math.random() * 1 + 1)
        this.play = Array.from({length: this.param.count}, _ => false)
        
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

        this.lines = new InstancedPlane({
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
                    uTexture: {value: texture},
                    resolution: {value: new THREE.Vector2(this.size.obj.w, this.size.obj.h)},
                    brightness: {value: this.param.brightness}
                }
            }
        })

        const {position} = this.createAttribute()

        this.lines.setInstancedAttribute('aPosition', new Float32Array(position), 3)

        this.group.add(this.lines.get())
    }
    createAttribute(){
        const position = []

        const {count} = this.param
        
        const width = this.size.obj.w
        const height = this.size.obj.h

        const halfWidth = width / 2
        const halfHeight = height / 2

        const w = width / (count - 1)
        const h = this.param.height

        for(let i = 0; i < count; i++){
            const x = -halfWidth + w * i
            const y = halfHeight + h / 2
            // const y = 0

            position.push(x, y, 0)
        }

        return {position}
    }


    // resize
    resize(size){
        this.size = size

        this.resizeLines()
    }
    resizeLines(){
        this.group.clear()
        this.lines.dispose()
        this.create()
        this.play = Array.from({length: this.param.count}, _ => false)
    }


    // animate
    animate(){
        const {count, height, chance} = this.param
        const position = this.lines.getAttribute('aPosition')
        const posArr = position.array

        const halfHeight = this.size.obj.h / 2
        const boundY = halfHeight + height / 2

        for(let i = 0; i < count; i++){
            const play = this.play[i]
            const rand = Math.random()
            
            if(rand > chance && play === false) this.play[i] = true
            if(this.play[i] === false) continue

            const idx = i * 3
            const velocity = this.velocity[i]

            const y = posArr[idx + 1]

            posArr[idx + 1] += -velocity

            if(y < -boundY){
                posArr[idx + 1] = boundY
                this.play[i] = false
            }
        }

        position.needsUpdate = true
    }
}