

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2        u_resolution;

uniform sampler2D   u_tex0;
uniform vec2        u_tex0Resolution;

uniform sampler2D   u_doubleBuffer0;
uniform sampler2D   u_buffer0;

#include "lygia/math/saturate.glsl"
#include "lygia/morphological/lucasKanade.glsl"
#include "lygia/filter/edge/sobel.glsl"
#include "lygia/filter/gaussianBlur.glsl"
#include "lygia/distort/stretch.glsl"

void main (void) {
    vec4 color = vec4(0.0);
    vec2 pixel = 1.0/u_resolution.xy;
    vec2 st = gl_FragCoord.xy * pixel;

    vec2 vel = lucasKanade(u_tex0, u_doubleBuffer0, st, pixel);

#if defined(BUFFER_0)
    float speed = pow( length(vel) * 0.2, 10.0);
    float edge = edgeSobel(u_tex0, st, pixel * 5.);

    color = vec4(vec3(speed * edge), 1.0);

#elif defined(DOUBLE_BUFFER_0)
    vec4 currentFrame = texture2D(u_tex0, st);
    // currentFrame = stretch(u_tex0, st, vel * pixel * 1.);
    vec4 previousFrame = texture2D(u_doubleBuffer0, st);
    // previousFrame = stretch(u_doubleBuffer0, st, vel * pixel * .0015);

    color += mix(previousFrame, currentFrame, 0.1); 

    float amount = gaussianBlur(u_tex0, st, pixel * 10.).r;
    color = mix(currentFrame, previousFrame, 1.0-amount); 

#else 

    color = texture2D(u_doubleBuffer0, st);

#endif

    gl_FragColor = color;
}
