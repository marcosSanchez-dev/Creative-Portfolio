#define PI 3.1415926535897932384626433832795

attribute vec3 position;
attribute vec2 uv;

uniform float uSpeed;
uniform float uTime; // añadir tiempo
uniform vec2 uViewportSizes;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;

void main() {
    vUv = uv;

    vec4 newPosition = modelViewMatrix * vec4(position, 1.0);

    // Movimiento ondulatorio con factor de tiempo
    newPosition.z -= (sin(newPosition.y / uViewportSizes.y * PI * 2.0 + uTime) + sin(newPosition.x / uViewportSizes.x * PI * 2.0 + uTime)) * abs(uSpeed);

    gl_Position = projectionMatrix * newPosition;
}
