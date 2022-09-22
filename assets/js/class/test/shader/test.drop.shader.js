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
        uniform sampler2D tBg;
        uniform sampler2D tFg;

        varying vec2 vUv;

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

        ${ShaderMethod.snoise2D()}
        ${ShaderMethod.executeNormalizing()}

        void main(){
            vec2 fragCoord = gl_FragCoord.xy;
            vec2 coord = gl_FragCoord.xy / eResolution;
            vec2 st = gl_FragCoord.xy - (eResolution * 0.5);

            // vec4 seed = texture(uSeed, vUv);

            // get uv
            float oWidthRatio = width / oResolution.x;
            float eWidth = oWidthRatio * eResolution.x;

            vec2 size = vec2(eWidth, eResolution.y);
            vec2 rCoord = getCurrentCoord(st, vec2(0), size);

            float nPos = snoise2D(vec2(0.0, uPos.y / eResolution.y) * vec2(1.0, 5.0));
            float posX = executeNormalizing(nPos, 0.4875, 0.5125, -1.0, 1.0);

            // get radius
            // float oSizeRatio = uSize / oResolution.x;
            // float eSize = oSizeRatio * eResolution.x;

            vec2 pos = vec2(eResolution.x * posX, uPos.y);
            float dist = distance(pos, fragCoord);

            vec4 bg = texture(tBg, coord);
  
            // bg.rgb *= 2.0;
            bg.a = 0.0;

            if(dist < uSize){
                float coordX = executeNormalizing(fragCoord.x, 0.0, 1.0, pos.x - uSize, pos.x + uSize);
                float coordY = executeNormalizing(fragCoord.y, 0.0, 1.0, pos.y - uSize, pos.y + uSize);
                vec4 fg = texture(tFg, vec2(coordX, coordY));

                bg.rgb = blendOverlay(bg.rgb, fg.rgb * 1.0, 1.0);
                bg.a = 1.0;
            }

            gl_FragColor = bg;
        }
    `
}