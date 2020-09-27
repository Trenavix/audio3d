/****************************************************************************
*                                                                           *
* audio3d - A 3D audio visualiser for JS                                    *
* https://github.com/trenavix/                                              *
* Copyright (C) 2020 Trenavix. All rights reserved.                         *
*                                                                           *
* License:                                                                  *
* GNU/GPLv2 http://www.gnu.org/licenses/gpl-2.0.html                        *
*                                                                           *
****************************************************************************/

var program; //WebGL Program
var currentcolour = new Float32Array(3);
var angleHistory = new Float32Array(128);
var angleHistoryX = new Float32Array(128);
var scalerHistory = new Float32Array(128);
var spreadHistory = new Float32Array(128);
var waveVertices = new Float32Array(3584); //256 (points) * 7 (floats per vtx) * 2 (up and down)
var waveIndices = new Uint16Array(1530); //255 quads * 2 tris per quad * 3 vtx per tri
var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec3 vertPosition;',
'attribute vec4 vertColor;',
'varying vec4 fragColor;',
'uniform mat4 mWorld;',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'',
'void main()',
'{',
'  fragColor = vertColor;',
'  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
'}'
].join('\n');

var fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec4 fragColor;',
'void main()',
'{',
'  gl_FragColor = fragColor;',
'}'
].join('\n');

var generateShaders = function()
{
    if (!gl) 
	{ 
	console.log('WebGL not supported, falling back on experimental-webgl');
	alert('Your browser does not support WebGL'); 
	}

	gl.clearColor(0, 0, 0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

	//
	// Create shaders
	// 
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) 
	{
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
		return;
	}

	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) 
	{
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
		return;
	}

	program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) 
	{
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return program;
	}
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) 
	{
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return program;
	}

	// Tell OpenGL state machine which program should be active.
    gl.useProgram(program);
}

//
// Create buffer
//
var boxVertices = 
[ 
    // X, Y, Z           R, G, B
	// Top
	-1.0, 1.0, -1.0,   1.0, 1.0, 1.0, 1.0,
	-1.0, 1.0, 1.0,    1.0, 1.0, 1.0, 1.0,
	1.0, 1.0, 1.0,     1.0, 1.0, 1.0, 1.0,
	1.0, 1.0, -1.0,    1.0, 1.0, 1.0, 1.0,

	// Left
	-1.0, 1.0, 1.0,    1.0, 1.0, 1.0, 1.0,
	-1.0, -1.0, 1.0,   0, 0, 0, 1.0,
	-1.0, -1.0, -1.0,  0, 0, 0, 1.0,
	-1.0, 1.0, -1.0,   1.0, 1.0, 1.0, 1.0,

	// Right
	1.0, 1.0, 1.0,    1.0, 1.0, 1.0, 1.0,
	1.0, -1.0, 1.0,   0, 0, 0, 1.0,
	1.0, -1.0, -1.0,  0, 0, 0, 1.0,
	1.0, 1.0, -1.0,   1.0, 1.0, 1.0, 1.0,

	// Front
	1.0, 1.0, 1.0,    1.0, 1.0, 1.0, 1.0,
	1.0, -1.0, 1.0,    0, 0.0, 0, 1.0,
	-1.0, -1.0, 1.0,    0, 0.0, 0, 1.0,
	-1.0, 1.0, 1.0,    1.0, 1.0, 1.0, 1.0,

	// Back
	1.0, 1.0, -1.0,    1.0, 1.0, 1.0, 1.0,
	1.0, -1.0, -1.0,    0.0, 0, 0, 1.0,
	-1.0, -1.0, -1.0,    0.0, 0, 0, 1.0,
	-1.0, 1.0, -1.0,    1.0, 1.0, 1.0, 1.0,

	// Bottom
	-1.0, -1.0, -1.0,   0, 0, 0, 1.0,
	-1.0, -1.0, 1.0,    0, 0, 0, 1.0,
	1.0, -1.0, 1.0,     0, 0, 0, 1.0,
	1.0, -1.0, -1.0,    0, 0, 0, 1.0,
];

var setWaveVertices = function()
{
	var size = 256;
	var waveIndex = 0;
	for(var i = 0; i < size*7; i+=7) //7 floats in vertex
	{
		waveIndex = i/7;
		waveVertices[i] = ((waveIndex)/16); //X coords: centre at midpoint of audiobuffer, divided by 64 for 3 coord delta
		//waveVertices[i+1] = AudioBufferArray[waveIndex]/128; //y coords = decibel values up to +2 coord range
		waveVertices[i+2] = 6.0; //z coords preset for now
	}
	for(var i = size*7; i < waveVertices.length; i+=7) //7 floats in vertex, start at next half
	{
		waveIndex = (i-(size*7))/7;
		waveVertices[i] = ((waveIndex)/16); //X coords: centre at midpoint of audiobuffer
		//waveVertices[i+1] = -(AudioBufferArray[waveIndex]/128); //y coords = -decibel values up to -2 coord range
		waveVertices[i+2] = 6.0; //z coords preset for now
	}
}

var setWaveYVertices = function()
{
	var size = 256;
	for(var i = 0; i < size*7; i+=7) //7 floats in vertex
	{
		waveIndex = i/7;
		waveVertices[i+1] = AudioBufferArray[waveIndex]/128; //y coords = decibel values up to +2 coord range
	}
	for(var i = size*7; i < waveVertices.length; i+=7) //7 floats in vertex, start at next half
	{
		waveIndex = (i-(size*7))/7;
		waveVertices[i+1] = -(AudioBufferArray[waveIndex]/128); //y coords = -decibel values up to -2 coord range
	}
}

var setWaveVertexColours = function(colour)
{
	for(let i = 0; i < waveVertices.length; i+=7) //7 floats in vertex, start at next half
	{
		waveVertices[i+3] = colour[0]; //for(var j = i+3; j<i+7; j++) vertexArray[j] = 1; //preset r,g,b,a values to 1 for now
		waveVertices[i+4] = colour[1];
		waveVertices[i+5] = colour[2];
		waveVertices[i+6] = colour[3];
	}
}

var setWaveIndices = function()
{
	var size = 256;
	var currentcoord = 0; //Max Y coord idx in vtx array
	var nextcoord = 0;
	for(var i = 0; i<waveIndices.length; i+=6) //for each 2 triangles
	{
		currentcoord = i/6;
		nextcoord = currentcoord+1;
		waveIndices[i] = currentcoord; 
		waveIndices[i+1] = nextcoord; //next index
		waveIndices[i+2] = currentcoord+size; //bottom
		waveIndices[i+3] = nextcoord; 
		waveIndices[i+4] = nextcoord+size; //bottom
		waveIndices[i+5] = currentcoord+size; //bottom next index
	}
}

var boxIndices =
[
	// Top
	0, 1, 2,
	0, 2, 3,

	// Left
	5, 4, 6,
	6, 4, 7,

	// Right
	8, 9, 10,
	8, 10, 11,

	// Front
	13, 12, 14,
	15, 14, 12,

	// Back
	16, 17, 18,
	16, 18, 19,

	// Bottom
	21, 20, 22,
	22, 20, 23
];

var setAllVertexBuffers = function(vertices, indices)
{
	var vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW); //dynamic so we may modify vertices live
	setVertexAttributes();
	var indexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
}

var subBufferVertexPositions = function(vertices)
{
	for(var i = 0; i < vertices.length; i+=7)
		{
			var pos = vertices.slice(i, i+3); //vertPos array of 3 coords
			gl.bufferSubData(gl.ARRAY_BUFFER, Float32Array.BYTES_PER_ELEMENT*i, pos); //buffer
		}
}

var bufferVertexColours = function(vertices)
{
	for(var i = 3; i < vertices.length; i+=7)
	{
		var colour = vertices.slice(i, i+4); //colour array of 4 floats
		gl.bufferSubData(gl.ARRAY_BUFFER, Float32Array.BYTES_PER_ELEMENT*i, colour); //buffer
	}
}

var setVertexAttributes = function()
{
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
	gl.vertexAttribPointer
  	(
	    positionAttribLocation, // Attribute location
	    3, // Number of elements per attribute
	    gl.FLOAT, // Type of elements
	    gl.FALSE,
	    7 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
	    0 // Offset from the beginning of a single vertex to this attribute
	);
	gl.vertexAttribPointer
  	(
	    colorAttribLocation, // Attribute location
	    4, // Number of elements per attribute
	    gl.FLOAT, // Type of elements
	    gl.FALSE,
	    7 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
	    3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);
}

var bufferDataPartially = function(vertices)
{
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

var bindBufferSubData = function()
{
	var boxVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
	gl.bufferSubData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), boxVertexBufferObject)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
	gl.vertexAttribPointer
  	(
	    colorAttribLocation, // Attribute location
	    4, // Number of elements per attribute
	    gl.FLOAT, // Type of elements
	    gl.FALSE,
	    7 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
	    3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(colorAttribLocation);
}