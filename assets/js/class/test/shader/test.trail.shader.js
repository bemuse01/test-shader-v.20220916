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
        uniform float time;

        ${ShaderMethod.snoise2D()}
        ${ShaderMethod.executeNormalizing()}

        vec2 getCurrentCoord(vec2 fragCoord, vec2 pos, vec2 size){
            vec2 offset = fragCoord - pos;
            vec2 halfSize = size * 0.5;
            vec2 coord = offset / halfSize;

            return coord * 0.5 + 0.5;
        }

        void main(){
            vec2 coord = gl_FragCoord.xy / eResolution;
            vec2 st = gl_FragCoord.xy - (eResolution * 0.5);

            // // ratio in object size
            float oRatio = width / oResolution.x;

            // // calc width in element size width oRatio
            float eWidth = oRatio * eResolution.x;

            // vec2 pos = vec2(0);
            vec2 size = vec2(eWidth, eResolution.y);
            vec2 rCoord = getCurrentCoord(st, vec2(0), size);

            // // float r = snoise2D(vec2(time * 0.1, rCoord.x));
            // float r = snoise2D(rCoord);
            // float n = (r * 0.5) + 0.5;

            vec4 color = vec4(vec3(1), 0.0);

            // color.w = 1.0 - n;
            // // color.w = rCoord.x;

            // // gl_FragColor = vec4(coord, 1.0, 1.0);
            // gl_FragColor = color;

            float minRange = 0.45;
            float maxRange = 0.55;
            float nPos = snoise2D(rCoord * 2.0);
            float pos = executeNormalizing(nPos, minRange, maxRange, -1.0, 1.0);

            if(rCoord.x > pos - 0.1 && rCoord.x < pos + 0.1) color.w = 1.0;

            gl_FragColor = color;
        }
    `
}