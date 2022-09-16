export default {
    vertex: `
        attribute vec3 aPosition;

        void main(){
            vec3 nPosition = position;

            nPosition.xy += aPosition.xy;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(nPosition, 1.0);
        }
    `,
    fragment: `
        void main(){
            gl_FragColor = vec4(1);
        }
    `
}