let cax = 0.0;
let cay = 0.0;
let caz = 0.0;
let cpx = 0.0;
let cpy = 0.0;
let cpz = -1.0;
let t_cpx = cpx;
let t_cpz = cpz;
const sensitivity = 0.15;
const speed = 0.05;
const smoothFactor = 0.1; // Adjust this value to control smoothness

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
precision lowp float;

attribute vec3 vpos;
attribute vec3 vcolor;
varying vec3 vcolor_trans;

uniform vec3 c_ang;
uniform vec3 c_pos;

void main() {
    mat3 xrot = mat3(
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, cos(radians(c_ang.x)), -sin(radians(c_ang.x))),
        vec3(0.0, sin(radians(c_ang.x)), cos(radians(c_ang.x)))
    );
    
    mat3 yrot = mat3(
        vec3(cos(radians(c_ang.y)), 0.0, sin(radians(c_ang.y))),
        vec3(0.0, 1.0, 0.0),
        vec3(-sin(radians(c_ang.y)), 0.0, cos(radians(c_ang.y)))
    );
    
    mat3 zrot = mat3(
        vec3(cos(radians(c_ang.z)), -sin(radians(c_ang.z)), 0.0),
        vec3(sin(radians(c_ang.z)), cos(radians(c_ang.z)), 0.0),
        vec3(0.0, 0.0, 1.0)
    );

    vec3 vpos_m = (vpos - c_pos) * xrot * yrot * zrot;
    
    gl_Position = vec4(vpos_m.xy, 0.0, vpos_m.z);
    vcolor_trans = vcolor;
}
`;

const fssrc = `
precision lowp float;

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

canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock; 
canvas.onclick = function() {
    canvas.requestPointerLock();
};

canvas.addEventListener("mousemove", function(event) {
    const deltaX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const deltaY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
    
    cay -= deltaX * sensitivity;
    cax -= deltaY * sensitivity;

    if (cax >= 90) {
        cax = 89.9;
    } else if (cax <= -90) {
        cax = -89.9;
    }
});

document.addEventListener("keydown", function (event) {
    switch (event.code) {
        case "KeyW":
        t_cpz += Math.cos(cay * Math.PI / 180) * speed;
        t_cpx -= Math.sin(cay * Math.PI / 180) * speed;
    break;
    case "KeyS":
        t_cpz -= Math.cos(cay * Math.PI / 180) * speed;
        t_cpx += Math.sin(cay * Math.PI / 180) * speed;
    break;
    case "KeyA":
        t_cpx -= Math.cos(cay * Math.PI / 180) * speed;
        t_cpz -= Math.sin(cay * Math.PI / 180) * speed;
    break;
    case "KeyD":
        t_cpx += Math.cos(cay * Math.PI / 180) * speed;
        t_cpz += Math.sin(cay * Math.PI / 180) * speed;
    break;
    }
});

gl.useProgram(prog);

function loop() {
    cpx += (t_cpx - cpx) * smoothFactor;
    cpz += (t_cpz - cpz) * smoothFactor;

    gl.uniform3fv(gl.getUniformLocation(prog, "c_ang"), [cax, cay, caz]);
    gl.uniform3fv(gl.getUniformLocation(prog, "c_pos"), [cpx, cpy, cpz]);
    
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
