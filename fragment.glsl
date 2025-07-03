// fragment.glsl
precision highp float;
uniform vec2 iResolution;
uniform vec2 iMouse;

float Circle(vec2 uv, vec2 p, float r, float blur) {
    float d = length(uv - p);
    return smoothstep(r, r - blur, d);
}

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution;
    vec2 uvMouse = iMouse / iResolution;

    uvMouse -= 0.5;
    uvMouse.x *= iResolution.x / iResolution.y;
    uv -= 0.5;
    uv.x *= iResolution.x / iResolution.y;

    vec3 mask = vec3(Circle(uv, uvMouse, .3, 0.002));
    mask = mix(mask, vec3(0.0), Circle(uv, uvMouse, .29, 0.002));
    mask += Circle(uv, uvMouse, .03, 0.002);

    vec3 red = vec3(1.0, 0.0, 0.0);
    mask = mix(mask, red,
               Circle(uv, normalize(vec2(0.1) - uvMouse) * .29 + uvMouse,
                      .03, 0.002));

    gl_FragColor = vec4(mask, 1.0);
}
