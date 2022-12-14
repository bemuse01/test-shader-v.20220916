import InstancedCircle from '../../objects/InstancedCircle.js'
import * as THREE from '../../../lib/three.module.js'
import Shader from '../shader/test.droplets.shader.js'
import PublicMethod from '../../../method/method.js'

export default class{
    constructor({group, size, position, param, textures, images, attributes, gpu, renderOrder}){
        this.group = group
        this.size = size
        this.textures = textures
        this.gpu = gpu
        this.position = position
        // this.drops = comp['Drop']
        this.images = images
        this.renderOrder = renderOrder
        this.radius = (param.radius / this.size.el.w) * this.size.obj.w
        this.count = param.count
        this.attributes = attributes

        // this.dropsParam = this.drops.param

        const w = ~~(100 / RATIO)
        const h = ~~(100 / RATIO)

        this.param = {
            w,
            h,
            count: w * h,
            radius: 0.5,
            seg: 64,
            scaleY: 0.85,
            bgViewScale: 3
        }

        this.scale = {min: 0.5, max: 1.5}

        this.play = false

        this.init()
    }


    // init
    init(){
        this.create()
        this.createGPGPU()
    }


    // create
    create(){
        const [_, waterMap] = this.textures

        const {w, h, count, radius, seg, scaleY} = this.param

        const bg = this.createTexture(this.images[0])
        const {tPosition, tParam} = this.createTextures()

        this.droplet = new InstancedCircle({
            count,
            radius,
            seg,
            materialName: 'ShaderMaterial',
            materialOpt: {
                vertexShader: Shader.vertex,
                fragmentShader: Shader.fragment,
                transparent: true,
                uniforms: {
                    tPosition: {value: tPosition},
                    tParam: {value: tParam},
                    bg: {value: bg},
                    waterMap: {value: waterMap},
                    resolution: {value: new THREE.Vector2(this.size.obj.w, this.size.obj.h)},
                    rad: {value: radius},
                    size: {value: new THREE.Vector2(w, h)},
                    scaleY: {value: scaleY},
                    bgViewScale: {value: this.param.bgViewScale}
                }
            }
        })

        const {coord, scale} = this.createAttribute(w, h)

        this.droplet.setInstancedAttribute('coord', new Float32Array(coord), 2)
        this.droplet.setInstancedAttribute('scale', new Float32Array(scale), 1)

        this.droplet.get().renderOrder = this.renderOrder

        this.group.add(this.droplet.get())

        this.play = true
    }
    createAttribute(w, h){
        const coord = []
        const scale = []
        
        for(let i = 0; i < h; i++){
            for(let j = 0; j < w; j++){
                coord.push(j, i)
                scale.push(THREE.Math.randFloat(this.scale.min, this.scale.max))
            }
        }

        return{
            coord,
            scale
        }
    }


    // texture
    createTextures(){
        const {w, h} = this.param

        const position = []
        const param = []
        const width = this.size.obj.w
        const height = this.size.obj.h

        for(let i = 0; i < h; i++){
            for(let j = 0; j < w; j++){
                const px = Math.random() * width - width / 2
                const py = Math.random() * height - height / 2
                position.push([px, py, 0, 0])

                // const size = THREE.Math.randFloat(this.scale.min, this.scale.max)
                const alpha = 1
                param.push([0, alpha, 0, 0])
            }
        }

        const tPosition = new THREE.DataTexture(new Float32Array(position.flat()), w, h, THREE.RGBAFormat, THREE.FloatType)
        const tParam = new THREE.DataTexture(new Float32Array(param.flat()), w, h, THREE.RGBAFormat, THREE.FloatType)

        tPosition.needsUpdate = true
        tParam.needsUpdate = true

        return{
            tPosition,
            tParam,
        }
    }
    createTexture(img){
        const canvas = PublicMethod.createTextureFromCanvas({img, width: this.size.el.w, height: this.size.el.h})
        const bg = new THREE.CanvasTexture(canvas)
        return bg
    }


    // gpgpu
    createGPGPU(){
        this.createGpuKernels()
    }
    createGpuKernels(){
        this.detectCollision = this.gpu.createKernel(function(param1, pos1, pos2, scale){
            const i = this.thread.x
            const idx = i * 4
            const rad1 = this.constants.radius1
            const rad2 = this.constants.radius2
            const count2 = this.constants.count2

            const x1 = pos1[idx + 0]
            const y1 = pos1[idx + 1]

            let x = param1[idx + 0]
            let alpha = param1[idx + 1]
            let z = param1[idx + 2]
            let w = param1[idx + 3]

            if(Math.random() > 0.995 && alpha === 0){
                alpha = 1
            }

            if(alpha !== 0){
                // do not use continue...
                for(let i2 = 0; i2 < count2; i2++){
                    const idx2 = i2 * 2
                    const x2 = pos2[idx2 + 0]
                    const y2 = pos2[idx2 + 1]
                    const s = scale[i2]

                    const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
                    const rad = (rad1 + rad2) * 0.8 * s

                    if(dist < rad){
                        alpha = 0
                    }
                }

            }

            return [x, alpha, z, w]
        }).setDynamicOutput(true)
    }


    // dispose
    dispose(){
        this.play = false
        this.droplet.dispose()
    }


    // animate
    animate(){
        if(!this.play) return

        this.updateDroplet()
    }
    updateDroplet(){
        const {count, radius} = this.param
        const radius2 = this.radius
        const count2 = this.count

        const position1Arr = this.droplet.getUniform('tPosition').image.data
        const position2Arr = this.position

        const param1 = this.droplet.getUniform('tParam')
        const param1Arr = this.droplet.getUniform('tParam').image.data
        // const param2Arr = this.drops.drop.getAttribute('aParam').array
        const scale = this.attributes.scale
        
        this.detectCollision.setOutput([count])
        this.detectCollision.setConstants({
            radius1: radius,
            radius2,
            count2
        })

        const temp = []
        const res = this.detectCollision(param1Arr, position1Arr, position2Arr, scale)

        for(let i = 0; i < res.length; i++) temp.push(...res[i])

        param1.image.data = new Float32Array(temp)
        param1.needsUpdate = true
    }
}