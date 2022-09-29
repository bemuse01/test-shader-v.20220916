import ShaderMethod from '../../../method/method.shader.js'

export default {
    vertex: `
        attribute vec2 objPos;
        attribute vec2 elPos;
        attribute float seed;
        attribute float idx;
        attribute float scale;

        varying vec2 vUv;
        varying vec2 vObjPos;
        varying vec2 vElPos;
        varying float vSeed;
        varying float vIdx;
        varying float vScale;

        void main(){
            vec3 nPosition = position;

            nPosition.xy += objPos;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(nPosition, 1.0);

            vUv = uv;
            vObjPos = objPos;
            vElPos = elPos;
            vSeed = seed;
            vIdx = idx;
            vScale = scale;
        }
    `,
    fragment: `
        uniform vec2 eResolution;
        uniform vec2 oResolution;
        uniform float width;
        uniform float radius;
        uniform sampler2D tBg;
        uniform sampler2D tFg;
        uniform sampler2D tSeed;
        uniform float minCurveRange;
        uniform float maxCurveRange;

        varying vec2 vUv;
        varying vec2 vObjPos;
        varying vec2 vElPos;
        varying float vSeed;
        varying float vIdx;
        varying float vScale;

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

            vec4 seed = texture(tSeed, vec2(vIdx, vElPos.y / eResolution.y));

            float centerRatio = executeNormalizing(seed.x, minCurveRange, maxCurveRange, -1.0, 1.0);

            // 
            vec2 oRatio = vObjPos / oResolution;
            vec2 ePos = oRatio * eResolution;

            vec2 centerPos = vec2(eResolution.x * centerRatio + ePos.x, vElPos.y);
            float dist = distance(centerPos, fragCoord);

            vec4 bg = texture(tBg, coord);
  
            bg.a = 0.0;

            float radX = radius * vScale * 0.8;
            float radY = radius * vScale * 1.25;

            float rx = fragCoord.x - centerPos.x;
            float ry = fragCoord.y - centerPos.y;
            float radian = atan(ry, rx);

            float px = cos(radian) * radX;
            float py = sin(radian) * radY;
            vec2 p = vec2(px, py);

            if(dist < length(p)){
                float coordX = executeNormalizing(fragCoord.x, 0.0, 1.0, centerPos.x - length(p), centerPos.x + length(p));
                float coordY = executeNormalizing(fragCoord.y, 0.0, 1.0, centerPos.y - length(p), centerPos.y + length(p));
                vec4 fg = texture(tFg, vec2(coordX, coordY));

                float opacity = 1.0 - coordY;

                bg.rgb = blendOverlay(bg.rgb, fg.rgb * 1.0, 1.0);
                bg.a = opacity;
            }

            gl_FragColor = bg;
        }
    `
}