/**
 * Shader author: alteredq / http://alteredqualia.com/
 *
 * Depth-of-field shader with bokeh
 * ported from GLSL shader by Martins Upitis
 * http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
 */

pc.extend(pc.posteffect, function () {
    /**
     * @name pc.posteffect.Bokeh
     * @class Implements the Bokeh post processing effect
     * @extends {pc.posteffect.PostEffect}
     * @param {pc.gfx.Device} graphicsDevice The graphics device of the application
     * @property {Number} maxBlur The maximum amount of blurring. Ranges from 0 to 1
     * @property {Number} aperture Bigger values create a shallower depth of field
     * @property {Number} focus Controls the focus of the effect
     * @property {Number} aspect Controls the blurring effect
     */
    function Bokeh(graphicsDevice) {
        this.needsDepthBuffer = true;

        this.shader = new pc.gfx.Shader(graphicsDevice, {
            attributes: {
                aPosition: pc.gfx.SEMANTIC_POSITION
            },
            vshader: [
                "attribute vec2 aPosition;",
                "",
                "varying vec2 vUv0;",
                "",
                "void main(void)",
                "{",
                "    gl_Position = vec4(aPosition, 0.0, 1.0);",
                "    vUv0 = (aPosition.xy + 1.0) * 0.5;",
                "}"
            ].join("\n"),
            fshader: [
                "precision " + graphicsDevice.precision + " float;",
                "",
                "varying vec2 vUv0;",
                "",
                "uniform sampler2D uColorBuffer;",
                "uniform sampler2D uDepthMap;",
                "",
                "uniform float uMaxBlur;",  // max blur amount
                "uniform float uAperture;", // uAperture - bigger values for shallower depth of field
                "",
                "uniform float uFocus;",
                "uniform float uAspect;",
                "",
                "void main()",
                "{",
                "    vec2 aspectCorrect = vec2( 1.0, uAspect );",
                "",
                "    vec4 depth1 = texture2D( uDepthMap, vUv0 );",
                "",
                "    float factor = depth1.x - uFocus;",
                "",
                "    vec2 dofblur = vec2 ( clamp( factor * uAperture, -uMaxBlur, uMaxBlur ) );",
                "",
                "    vec2 dofblur9 = dofblur * 0.9;",
                "    vec2 dofblur7 = dofblur * 0.7;",
                "    vec2 dofblur4 = dofblur * 0.4;",
                "",
                "    vec4 col;",
                "",
                "    col  = texture2D( uColorBuffer, vUv0 );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2(  0.0,   0.4  ) * aspectCorrect ) * dofblur );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2(  0.15,  0.37 ) * aspectCorrect ) * dofblur );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2(  0.29,  0.29 ) * aspectCorrect ) * dofblur );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2( -0.37,  0.15 ) * aspectCorrect ) * dofblur );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2(  0.40,  0.0  ) * aspectCorrect ) * dofblur );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2(  0.37, -0.15 ) * aspectCorrect ) * dofblur );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2(  0.29, -0.29 ) * aspectCorrect ) * dofblur );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2( -0.15, -0.37 ) * aspectCorrect ) * dofblur );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2(  0.0,  -0.4  ) * aspectCorrect ) * dofblur );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2( -0.15,  0.37 ) * aspectCorrect ) * dofblur );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2( -0.29,  0.29 ) * aspectCorrect ) * dofblur );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2(  0.37,  0.15 ) * aspectCorrect ) * dofblur );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2( -0.4,   0.0  ) * aspectCorrect ) * dofblur );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2( -0.37, -0.15 ) * aspectCorrect ) * dofblur );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2( -0.29, -0.29 ) * aspectCorrect ) * dofblur );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2(  0.15, -0.37 ) * aspectCorrect ) * dofblur );",
                "",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2(  0.15,  0.37 ) * aspectCorrect ) * dofblur9 );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2( -0.37,  0.15 ) * aspectCorrect ) * dofblur9 );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2(  0.37, -0.15 ) * aspectCorrect ) * dofblur9 );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2( -0.15, -0.37 ) * aspectCorrect ) * dofblur9 );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2( -0.15,  0.37 ) * aspectCorrect ) * dofblur9 );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2(  0.37,  0.15 ) * aspectCorrect ) * dofblur9 );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2( -0.37, -0.15 ) * aspectCorrect ) * dofblur9 );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2(  0.15, -0.37 ) * aspectCorrect ) * dofblur9 );",
                "",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2(  0.29,  0.29 ) * aspectCorrect ) * dofblur7 );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2(  0.40,  0.0  ) * aspectCorrect ) * dofblur7 );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2(  0.29, -0.29 ) * aspectCorrect ) * dofblur7 );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2(  0.0,  -0.4  ) * aspectCorrect ) * dofblur7 );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2( -0.29,  0.29 ) * aspectCorrect ) * dofblur7 );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2( -0.4,   0.0  ) * aspectCorrect ) * dofblur7 );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2( -0.29, -0.29 ) * aspectCorrect ) * dofblur7 );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2(  0.0,   0.4  ) * aspectCorrect ) * dofblur7 );",
                "",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2(  0.29,  0.29 ) * aspectCorrect ) * dofblur4 );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2(  0.4,   0.0  ) * aspectCorrect ) * dofblur4 );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2(  0.29, -0.29 ) * aspectCorrect ) * dofblur4 );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2(  0.0,  -0.4  ) * aspectCorrect ) * dofblur4 );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2( -0.29,  0.29 ) * aspectCorrect ) * dofblur4 );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2( -0.4,   0.0  ) * aspectCorrect ) * dofblur4 );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2( -0.29, -0.29 ) * aspectCorrect ) * dofblur4 );",
                "    col += texture2D( uColorBuffer, vUv0 + ( vec2(  0.0,   0.4  ) * aspectCorrect ) * dofblur4 );",
                "",
                "    gl_FragColor = col / 41.0;",
                "    gl_FragColor.a = 1.0;",
                "}"
            ].join("\n")
        });

        // Uniforms
        this.maxBlur = 1;
        this.aperture = 0.025;
        this.focus = 1;
        this.aspect = 1;
    }

    Bokeh = pc.inherits(Bokeh, pc.posteffect.PostEffect);

    Bokeh.prototype = pc.extend(Bokeh.prototype, {
        render: function (inputTarget, outputTarget, rect) {
            var device = this.device;
            var scope = device.scope;

            scope.resolve("uMaxBlur").setValue(this.maxBlur);
            scope.resolve("uAperture").setValue(this.aperture);
            scope.resolve("uFocus").setValue(this.focus);
            scope.resolve("uAspect").setValue(this.aspect);
            scope.resolve("uColorBuffer").setValue(inputTarget.colorBuffer);
            scope.resolve("uDepthMap").setValue(this.depthMap);
            pc.posteffect.drawFullscreenQuad(device, outputTarget, this.vertexBuffer, this.shader, rect);
        }
    });

    return {
        Bokeh: Bokeh
    };
}());