varying vec2 vertexUV;
varying vec3 vectorNormal;

void main() {
    vectorNormal = normalize(normalMatrix * normal);
    vertexUV = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
} 
