import ShaderMethod from '../../../method/method.shader.js'

export default {
    vertex: `
        attribute vec2 aPosition;

        varying vec2 vUv;
        varying vec2 vPosition;
        varying vec2 oPosition;

        void main(){
            vec3 nPosition = position;

            nPosition.xy += aPosition;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(nPosition, 1.0);

            vUv = uv;
            vPosition = aPosition.xy;
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
        uniform float currentY;

        varying vec2 vUv;
        varying vec2 vPosition;
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
            vec2 oRatio = (vPosition + oResolution * 0.5) / oResolution;
            vec2 ePos = oRatio * eResolution;

            vec2 offset = ePos;
            vec2 halfSize = size * 0.5;
            float coordX = executeNormalizing(fragCoord.x, 0.0, 1.0, offset.x - halfSize.x, offset.x + halfSize.x); 
            float coordY = executeNormalizing(fragCoord.y, 0.0, 1.0, offset.y - halfSize.y, offset.y + halfSize.y); 

            return vec2(coordX, coordY);
        }

        void main(){
            vec2 fragCoord = gl_FragCoord.xy;
            vec2 coord = gl_FragCoord.xy / eResolution;
            vec2 st = gl_FragCoord.xy - (eResolution * 0.5);

            vec2 coord2 = (vPosition + oResolution * 0.5) / oResolution;
            vec2 ratio = (oPosition / oResolution);
            vec4 bg = texture(tBg, coord2 + ratio);

            // .xyz *= 2.0;
            bg.a = 0.0;

            float oRatio = width / oResolution.x;
            float eWidth = oRatio * eResolution.x;

            vec2 size = vec2(eWidth, eResolution.y);
            vec2 rCoord = getCurrentCoord(fragCoord, vec2(0), size);

            float nPos = snoise2D(vec2(0.0, coord.y) * vec2(1.0, 2.5));
            float pos = executeNormalizing(nPos, 0.2, 0.8, -1.0, 1.0);

            float gap = 0.2;

            if(rCoord.x > pos - gap && rCoord.x < pos + gap){
                float uvX = executeNormalizing(rCoord.x, 0.0, 1.0, pos - gap, pos + gap);

                vec4 fg = texture(tFg, vec2(uvX, rCoord.y));

                bg.rgb = blendOverlay(bg.rgb, fg.rgb * 1.0, 1.125);

                float dist = distance(pos, rCoord.x);
                float opacity = executeNormalizing(dist, 0.0, 1.0, 0.0, gap);

                float opacity2 = step(1.0 - currentY, rCoord.y);

                bg.a = (1.0 - opacity) * opacity2;
                // bg.a = (1.0 - opacity);

                // bg.a = 1.0;
            }

            gl_FragColor = bg;
        }
    `
}