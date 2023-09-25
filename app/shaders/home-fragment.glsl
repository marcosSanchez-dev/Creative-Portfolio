precision highp float;

uniform float uAlpha;
uniform sampler2D tMap;

varying vec2 vUv;

void main() {
    vec4 texture = texture2D(tMap, vUv);
    
    vec2 centeredUv = vUv - vec2(0.5, 0.5); // Centra las coordenadas UV
    float distanceFromCenter = length(centeredUv); // Calcula la distancia desde el centro
    float fade = 1.0 - smoothstep(0.3, 0.6, distanceFromCenter); // Controla el desvanecimiento y lo invierte
    
    gl_FragColor = texture;
    gl_FragColor.a *= fade * uAlpha; // Aplica el desvanecimiento y multiplica por uAlpha
}
