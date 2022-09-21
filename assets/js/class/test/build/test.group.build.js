import Drop from './test.drop.build.js'
import Trail from './test.trail.build.js'
import * as THREE from '../../../lib/three.module.js'
import PublicMethod from '../../../method/method.js'

export default class{
    constructor({group, size, images, textures}){
        this.group = group
        this.size = size
        this.images = images
        this.textures = textures

        this.param = {
            width: 10,
            xRange: 0.15,
        }

        this.init()
    }


    // init
    init(){
        this.create()
    }


    // create
    create(){
        const {seed} = this.createTexture()

        this.seed = seed

        this.Trail = new Trail({...this, seed: this.seed})
        this.drop = new Drop({...this, seed: this.seed})
    }
    createTexture(){
        const seed = []

        const height = ~~this.size.el.h
        const {xRange} = this.param

        for(let i = 0; i < height; i++){
            const ratio = i / height

            const rn = SIMPLEX.noise2D(0.0 * 0.2, ratio * 5.0)
            const pn = PublicMethod.normalize(rn, -xRange, xRange, -1, 1)

            seed.push(ratio, pn, 0, 0)
        }

        const seedTexture = new THREE.DataTexture(new Float32Array(seed), 1, height, THREE.RGBAFormat, THREE.FloatType)
        seedTexture.needsUpdate = true

        return {seed: seedTexture}
    }
}