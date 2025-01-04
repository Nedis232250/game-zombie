const canvas = document.getElementById("game-surface");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gl = canvas.getContext("webgl");

if (!gl) {
    gl = canvas.getContext("experimental-webgl");
    console.log("WebGL not functioning. Falling back on experimental-WebGL");
}

if (!gl) {
    console.warn("Your browser does not support WebGL or experimental WebGL. Please switch to a browser that supports wither of those");
}

const vssrc = `
precision highp float;

attribute vec3 vpos;
attribute vec3 vcolor;
varying vec3 vcolor_trans;

void main() {
    gl_Position = vec4(vpos, 1.0);
    vcolor_trans = vcolor;
}
`;

const fssrc = `
precision highp float;

varying vec3 vcolor_trans;

void main() {
    gl_FragColor = vec4(vcolor_trans, 1.0);
}
`;

gl.clearColor(0.3, 0.6, 0.7, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

const vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, vssrc);
gl.compileShader(vs);

if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
    console.warn("ERROR: compiling vertex shader; " + gl.getShaderInfoLog(vs));    
}

const fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, fssrc);
gl.compileShader(fs);

if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
    console.warn("ERROR: compiling fragment shader; " + gl.getShaderInfoLog(fs));    
}

const prog = gl.createProgram();
gl.attachShader(prog, vs);
gl.attachShader(prog, fs);
gl.linkProgram(prog);
gl.validateProgram(prog);

const vertices = [
    0.0, 0.5, 0.0, 1.0, 0.0, 0.0,
    -0.5, -0.5, 0.0, 0.0, 1.0, 0.0,
    0.5, -0.5, 0.0, 0.0, 0.0, 1.0
];

const indices = [
    0, 1, 2
];

const vbuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

const ibuf = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

gl.vertexAttribPointer(gl.getAttribLocation(prog, "vpos"), 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
gl.vertexAttribPointer(gl.getAttribLocation(prog, "vcolor"), 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
gl.enableVertexAttribArray(gl.getAttribLocation(prog, "vpos"));
gl.enableVertexAttribArray(gl.getAttribLocation(prog, "vcolor"));

gl.useProgram(prog);
gl.drawArrays(gl.TRIANGLES, 0, indices.length);
