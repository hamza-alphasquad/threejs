uniform sampler2D visibility;
uniform sampler2D shape;

varying vec2 vUv;
varying vec3 vColor;


void main() {


vec4 v = texture2D(visibility, vUv);

gl_FragColor = vec4( vColor, 1.0 );


}