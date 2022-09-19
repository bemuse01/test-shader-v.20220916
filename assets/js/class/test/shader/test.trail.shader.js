import ShaderMethod from '../../../method/method.shader.js'

export default {
    vertex: `
        void main(){
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragment: `
        uniform vec2 eResolution;
        uniform vec2 oResolution;
        uniform float width;

        ${ShaderMethod.snoise2D()}

        vec2 getCurrentCoord(vec2 fragCoord, vec2 pos, vec2 size){
            vec2 offset = fragCoord - pos;
            vec2 halfSize = size * 0.5;
            vec2 coord = offset / halfSize;

            return coord * 0.5 + 0.5;
        }

        void main(){
            vec2 coord = gl_FragCoord.xy / eResolution;
            vec2 st = gl_FragCoord.xy - (eResolution * 0.5);

            // ratio in object size
            float oRatio = width / oResolution.x;

            // calc width in element size width oRatio
            float eWidth = oRatio * eResolution.x;

            vec2 pos = vec2(0);
            vec2 size = vec2(eWidth, eResolution.y);
            vec2 rCoord = getCurrentCoord(st, pos, size);

            float r = snoise2D(rCoord);
            float n = (r * 0.5) + 0.5;

            vec4 color = vec4(1);

            // color.w = n;
            // color.w = rCoord.x;
            if(coord.x > 0.5) color.xyz = vec3(1.0, 0.0, 0.0);

            // gl_FragColor = vec4(coord, 1.0, 1.0);
            gl_FragColor = color;
        }
    `
}