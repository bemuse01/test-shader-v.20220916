import ShaderMethod from '../../../method/method.shader.js'

export default {
    vertex: `
        attribute vec2 objPos;
        attribute vec2 elPos;
        attribute float seed;
        attribute float opacity;
        attribute float idx;
        attribute float scale;

        varying vec2 vUv;
        varying vec2 vObjPos;
        varying vec2 oPosition;
        varying vec2 vElPos;
        varying float vSeed;
        varying float vOpacity;
        varying float vIdx;
        varying float vScale;

        void main(){
            vec3 nPosition = position;

            nPosition.xy += objPos;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(nPosition, 1.0);

            vUv = uv;
            vObjPos = objPos;
            oPosition = position.xy;
            vElPos = elPos;
            vSeed = seed;
            vOpacity = opacity;
            vIdx = idx;
            vScale = scale;
        }
    `,
    fragment: `
        uniform vec2 eResolution;
        uniform vec2 oResolution;
        uniform float width;
        uniform sampler2D tBg;
        uniform sampler2D tFg;
        uniform sampler2D tSeed;
        uniform float radius;

        varying vec2 vUv;
        varying vec2 vObjPos;
        varying vec2 oPosition;
        varying vec2 vElPos;
        varying float vSeed;
        varying float vOpacity;
        varying float vIdx;
        varying float vScale;

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
            vec2 oRatio = (vObjPos + oResolution * 0.5) / oResolution;
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

            vec2 coord2 = (vObjPos + oResolution * 0.5) / oResolution;
            vec2 ratio = (oPosition / oResolution);
            vec4 bg = texture(tBg, coord2 + ratio);

            bg.a = 0.0;

            vec4 seed = texture(tSeed, vec2(vIdx, coord.y));
            float centerRatio = executeNormalizing(seed.x, 0.4875, 0.5125, -1.0, 1.0);

            float gap = 0.2 * vScale;

            vec2 oRatio = vObjPos / oResolution;
            vec2 ePos = oRatio * eResolution;
            vec2 centerPos = vec2(eResolution.x * centerRatio + ePos.x, vElPos.y);

            float dist2 = distance(coord.y, 1.0);
            float yOpacity = executeNormalizing(dist2, 0.1, 1.0, 0.0, 1.0);

            if(fragCoord.x > centerPos.x - radius && fragCoord.x < centerPos.x + radius){
                float coordX = executeNormalizing(fragCoord.x, 0.0, 1.0, centerPos.x - radius, centerPos.x + radius);
                
                vec4 fg = texture(tFg, vec2(coordX, coord.y));

                bg.rgb = blendOverlay(bg.rgb, fg.rgb * 1.0, 1.125);

                float dist = distance(centerPos.x, fragCoord.x);
                float xOpacity = executeNormalizing(dist, 0.0, 1.0, 0.0, radius);

                float edgeOpacity = smoothstep(fragCoord.y, fragCoord.y * 0.95, vElPos.y) * 0.9;

                bg.a = (1.1 - xOpacity) * edgeOpacity * vOpacity;
            }

            bg.a *= yOpacity;

            gl_FragColor = bg;
        }
    `
}