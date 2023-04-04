void main() {
    vec4 model = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * model;
}