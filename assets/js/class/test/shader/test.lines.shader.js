export default {
    vertex: `
        attribute vec3 aPosition;

        varying vec2 vPosition;
        varying vec2 oPosition;
        varying vec2 vUv;

        void main(){
            vec3 nPosition = position;

            nPosition.xy += aPosition.xy;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(nPosition, 1.0);

            vPosition = aPosition.xy;
            oPosition = position.xy;
            vUv = uv;
        }
    `,
    fragment: `
        varying vec2 vPosition;
        varying vec2 oPosition;
        varying vec2 vUv;

        uniform sampler2D uTexture;
        uniform vec2 resolution;
        uniform float brightness;

        void main(){
            vec2 coord = (vPosition + resolution * 0.5) / resolution;
            vec2 ratio = (oPosition / resolution);
            vec4 color = texture(uTexture, coord + ratio);
            
            // float dist = distance(vUv * 2.0, vec2(0));
            float dist = distance(vUv.y * 2.0, 0.0);
            float opacity = 1.0 - dist;

            color.rgb *= brightness;
            color.a *= opacity;

            gl_FragColor = color;
        }
    `
}