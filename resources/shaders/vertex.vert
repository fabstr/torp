#version 300 es
in vec2 a_position;
in vec2 a_textureCoordinates;

uniform mat3 u_matrix;

out vec2 v_textureCoordinates;

void main() {
    gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
    
    // pass the texture coordinates to the fragment shader
    v_textureCoordinates = a_textureCoordinates;
}