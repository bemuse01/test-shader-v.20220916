import ShaderMethod from '../../../method/method.shader.js'

export default {
    vertex: `
        varying vec2 vUv;
        // varying vec2 vPosition;
        varying vec2 oPosition;

        void main(){
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

            vUv = uv;
            // vPosition = aPosition.xy;
            oPosition = position.xy;
        }
    `,
    fragment: `
        uniform vec2 eResolution;
        uniform vec2 oResolution;
        uniform float width;
        uniform float time;
        uniform sampler2D uTexture;

        varying vec2 vUv;
        varying vec2 oPosition;

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
            vec2 uv = (oPosition + oResolution * 0.5) / oResolution;
            // vec2 ratio = (oPosition / oResolution);

            // vec4 color = vec4(vec3(1), 0.0);
            vec4 color = texture(uTexture, uv);

            color.xyz *= 2.0;
            color.w = 0.0;

            float oRatio = width / oResolution.x;
            float eWidth = oRatio * eResolution.x;

            // vec2 pos = vec2(0);
            vec2 size = vec2(eWidth, eResolution.y);
            vec2 rCoord = getCurrentCoord(st, vec2(0), size);

            float minRange = 0.35;
            float maxRange = 0.65;
            float nPos = snoise2D(rCoord * vec2(0.2, 5.0));
            float pos = executeNormalizing(nPos, minRange, maxRange, -1.0, 1.0);

            float gap = 0.2;

            // if(rCoord.x > pos - gap && rCoord.x < pos + gap) color.w = 1.0;
            // if(rCoord.x < pos - gap || rCoord.x > pos + gap) discard;
            if(rCoord.x > pos - gap && rCoord.x < pos + gap){
                float dist = distance(pos, rCoord.x);
                float opacity = executeNormalizing(dist, 0.0, 1.0, 0.0, gap);
                color.w = 1.0 - opacity;
            }

            gl_FragColor = color;
        }
    `
}