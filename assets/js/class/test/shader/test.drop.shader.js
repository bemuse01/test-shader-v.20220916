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
        uniform float uSize;
    
        vec2 getCurrentCoord(vec2 fragCoord, vec2 pos, vec2 size){
            vec2 offset = fragCoord - pos;
            vec2 halfSize = size * 0.5;
            vec2 coord = offset / halfSize;

            return coord * 0.5 + 0.5;
        }

        void main(){
            vec2 coord = gl_FragCoord.xy / eResolution;
            vec2 st = gl_FragCoord.xy - (eResolution * 0.5);

            // get uv
            float oWidthRatio = width / oResolution.x;
            float eWidth = oWidthRatio * eResolution.x;

            vec2 size = vec2(eWidth, eResolution.y);
            vec2 rCoord = getCurrentCoord(st, vec2(0), size);

            // get radius
            float oSizeRatio = uSize / oResolution.x;
            // float eSize = oSizeRatio * eResolution.x;

            vec2 pos = vec2(0.5);
            float dist = distance(pos, rCoord);

            vec4 color = vec4(vec3(1), 0.0);

            if(oSizeRatio < dist){
                color.a = 1.0;
            }

            gl_FragColor = color;
        }
    `
}