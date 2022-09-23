import ShaderMethod from '../../../method/method.shader.js'

export default {
    vertex: `
        attribute vec2 aPosition;
        attribute float posY;
        attribute float seed;

        varying vec2 vUv;
        varying vec2 vPosition;
        varying float vPosY;
        varying float vSeed;

        void main(){
            vec3 nPosition = position;

            nPosition.xy += aPosition;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(nPosition, 1.0);

            vUv = uv;
            vPosition = aPosition;
            vPosY = posY;
            vSeed = seed;
        }
    `,
    fragment: `
        uniform vec2 eResolution;
        uniform vec2 oResolution;
        uniform float width;
        uniform float radius;
        uniform sampler2D tBg;
        uniform sampler2D tFg;

        varying vec2 vUv;
        varying vec2 vPosition;
        varying float vPosY;
        varying float vSeed;

        float blendOverlay(float base, float blend) {
            return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
        }
        
        vec3 blendOverlay(vec3 base, vec3 blend) {
            return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
        }
        
        vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
            return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
        }
    
        ${ShaderMethod.snoise2D()}
        ${ShaderMethod.executeNormalizing()}

        void main(){
            vec2 fragCoord = gl_FragCoord.xy;
            vec2 coord = gl_FragCoord.xy / eResolution;
            vec2 st = gl_FragCoord.xy - (eResolution * 0.5);

            // get uv
            float oWidthRatio = width / oResolution.x;
            float eWidth = oWidthRatio * eResolution.x;

            float nPos = snoise2D(vec2(0.0, vPosY / eResolution.y) * vec2(1.0, 2.5 * vSeed));
            float posX = executeNormalizing(nPos, 0.4875, 0.5125, -1.0, 1.0);

            // 
            vec2 oRatio = vPosition / oResolution;
            vec2 ePos = oRatio * eResolution;

            vec2 pos = vec2(eResolution.x * posX + ePos.x, vPosY);
            float dist = distance(pos, fragCoord);
            // float distX = distance(pos.x, fragCoord.x);
            // float distY = distance(pos.y, fragCoord.y);

            vec4 bg = texture(tBg, coord);
            // vec4 bg = vec4(1);
  
            bg.a = 0.0;

            float radX = radius * 0.8;
            float radY = radius * 1.25;

            float rx = fragCoord.x - pos.x;
            float ry = fragCoord.y - pos.y;
            float radian = atan(ry, rx);

            float px = cos(radian) * radX;
            float py = sin(radian) * radY;
            vec2 p = vec2(px, py);

            if(dist < length(p)){
                float coordX = executeNormalizing(fragCoord.x, 0.0, 1.0, pos.x - length(p), pos.x + length(p));
                float coordY = executeNormalizing(fragCoord.y, 0.0, 1.0, pos.y - length(p), pos.y + length(p));
                vec4 fg = texture(tFg, vec2(coordX, coordY));

                float opacity = 1.0 - coordY;

                bg.rgb = blendOverlay(bg.rgb, fg.rgb * 1.0, 1.0);
                bg.a = opacity;
                // bg.a = 1.0;
            }

            gl_FragColor = bg;
        }
    `
}