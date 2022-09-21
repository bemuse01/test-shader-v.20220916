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
        uniform sampler2D tBg;
        uniform sampler2D tFg;
        uniform sampler2D uSeed;
        uniform float currentY;

        varying vec2 vUv;
        varying vec2 oPosition;

        ${ShaderMethod.snoise2D()}
        ${ShaderMethod.executeNormalizing()}

        float blendOverlay(float base, float blend) {
            return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
        }
        
        vec3 blendOverlay(vec3 base, vec3 blend) {
            return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
        }
        
        vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
            return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
        }

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

            vec4 bg = texture(tBg, uv);
            vec4 seed = texture(uSeed, vUv);

            // .xyz *= 2.0;
            bg.a = 0.0;

            float oRatio = width / oResolution.x;
            float eWidth = oRatio * eResolution.x;

            vec2 size = vec2(eWidth, eResolution.y);
            vec2 rCoord = getCurrentCoord(st, vec2(0), size);

            // float nPos = snoise2D(vec2(0.0, seed.x) * vec2(1.0, 5.0));
            // float pos = executeNormalizing(nPos, 0.35, 0.65, -1.0, 1.0);
            float pos = 0.5 + seed.y;
            // float posY = eResolution.y * 0.5 / eResolution.y;

            float gap = 0.2;

            if(rCoord.x > pos - gap && rCoord.x < pos + gap){
                float uvX = executeNormalizing(rCoord.x, 0.0, 1.0, pos - gap, pos + gap);

                vec4 fg = texture(tFg, vec2(uvX, rCoord.y));

                bg.rgb = blendOverlay(bg.rgb, fg.rgb * 1.0, 1.0);

                float dist = distance(pos, rCoord.x);
                float opacity = executeNormalizing(dist, 0.0, 1.0, 0.0, gap);

                float opacity2 = step(1.0 - currentY, rCoord.y);

                // bg.a = (1.0 - opacity) * opacity2;
                bg.a = (1.0 - opacity);
            }

            gl_FragColor = bg;
        }
    `
}