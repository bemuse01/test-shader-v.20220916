import ShaderMethod from '../../../method/method.shader.js'

export default {
    vertex: `
        varying vec2 vUv;

        void main(){
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

            vUv = uv;
        }
    `,
    fragment: `
        uniform vec2 eResolution;
        uniform vec2 oResolution;
        uniform float width;
        uniform float uSize;
        uniform vec2 uPos;
        uniform sampler2D uSeed;
        uniform float time;

        varying vec2 vUv;
    
        vec2 getCurrentCoord(vec2 fragCoord, vec2 pos, vec2 size){
            vec2 offset = fragCoord - pos;
            vec2 halfSize = size * 0.5;
            vec2 coord = offset / halfSize;

            return coord * 0.5 + 0.5;
        }

        ${ShaderMethod.snoise2D()}
        ${ShaderMethod.executeNormalizing()}

        void main(){
            vec2 fragCoord = gl_FragCoord.xy;
            vec2 coord = gl_FragCoord.xy / eResolution;
            vec2 st = gl_FragCoord.xy - (eResolution * 0.5);

            vec4 seed = texture(uSeed, vUv);

            // get uv
            float oWidthRatio = width / oResolution.x;
            float eWidth = oWidthRatio * eResolution.x;

            vec2 size = vec2(eWidth, eResolution.y);
            vec2 rCoord = getCurrentCoord(st, vec2(0), size);

            // float nPos = snoise2D(vec2(0.1, coord.y) * vec2(1.0, 5.0));
            float nPos = time;
            float posX = executeNormalizing(nPos, 0.475, 0.525, -1.0, 1.0);

            // get radius
            // float oSizeRatio = uSize / oResolution.x;
            // float eSize = oSizeRatio * eResolution.x;

            vec2 pos = vec2(eResolution.x * posX, uPos.y);
            float dist = distance(pos, fragCoord);

            vec4 color = vec4(vec3(1), 0.0);

            if(dist < uSize){
                color.w = 1.0;
            }

            gl_FragColor = color;
        }
    `
}