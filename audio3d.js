/*********************************************************
*                                                        *
*    audio3d - A 3D audio visualiser for JS              *
*    https://github.com/trenavix/                        *
*    Copyright (C) 2020 Trenavix. All rights reserved.   *
*                                                        *
*    License:                                            *
*   GNU/GPLv2 http://www.gnu.org/licenses/gpl-2.0.html   *
*                                                        *
*********************************************************/

var body = document.getElementById('body');
var canvas = document.getElementById('game-surface');
var framecount = 0;

// Ask for non-premultiplied alpha
gl = canvas.getContext("webgl", { premultipliedAlpha: false }); 

//set up global matrices
var xRotationMatrix = new Float32Array(16);
var yRotationMatrix = new Float32Array(16);
var zRotationMatrix = new Float32Array(16);
var worldMatrix = new Float32Array(16);
var viewMatrix = new Float32Array(16);
var projMatrix = new Float32Array(16);
var identityMatrix = new Float32Array(16);
var matWorldUniformLocation;
var matViewUniformLocation;
var matProjUniformLocation;
var camPosition = [0.0,0.0,-8.0];
var camRotation = [-4.725,0.0,0.0]; //start looking backward (-1.5*pi)
var matrixStack = new MatrixStack();


var Render = function (e) 
{
	let touchEvent = 'ontouchstart' in window ? 'touchstart' : 'click'; //If mobile, touch event, otherwise click
	body.addEventListener(touchEvent, function() //do stuff by clicking on canvas
	{
		AudioProcess(); //play audio/visualiser
	});

	resizeCanvas(); //initialise canvas
	window.addEventListener('resize', resizeCanvas, false); //re-initialise on any window resize

	//Keyboard controls for debug camera
	kd.run(function () { kd.tick(); } ); //start listener
	kd.RIGHT.down(function() {camRotation[0] += 0.05} );
	kd.LEFT.down(function() {camRotation[0] -= 0.05 }); 
	kd.UP.down(function() {camRotation[1] += 0.05} );
	kd.DOWN.down(function() {camRotation[1] -= 0.05} );
	kd.D.down(function() {camPosition[0] += 0.2} );
	kd.A.down(function() {camPosition[0] -= 0.2} );
	kd.W.down(function() {camPosition[2] += 0.2} );
	kd.S.down(function() {camPosition[2] -= 0.2} );
	kd.E.down(function() {camPosition[1] += 0.2} );
	kd.Q.down(function() {camPosition[1] -= 0.2} );

	//main variables for particle effects
	var angle_x = 0; var angle_y = 0; var spread = 0; 
	
	generateShaders(); //Initialise shaders for WebGL
	
	//Worldview initialisation
	matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
	mat4.identity(worldMatrix);

	var lookat;  //vec3 lookat
	var addedPos; //Output position for adding to lookAt
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
	mat4.identity(identityMatrix);

	//set up background sound wave vertices and indices
	setWaveVertices();
	setWaveIndices();


	//Blending/alpha params
    gl = canvas.getContext("webgl", { alpha: true });
    gl.depthMask(false);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	//
	// Main render loop
	//
	var loop = function () 
	{
		framecount++;	

		//Set up headers, stacks, presets
        matrixStack = new MatrixStack();

		//set all main variables for particles
		angle_x += 0.0003*avgDB;
		spread = -(avgDB/175);
		var scaler = (avgDB/510);
		var backwardTranslation = 0;
		addEntryToFrontOfArray(angleHistory, angle_x);
		addEntryToFrontOfArray(scalerHistory, scaler);
		addEntryToFrontOfArray(spreadHistory, spread);

		//Renderer initialisation of view
    	gl.viewport(0, 0, window.innerWidth, window.innerHeight);
		gl.clearColor(0, 0, 0, 1.0);
		gl.clear( gl.COLOR_BUFFER_BIT);//Camera
		lookat =  //vec3 lookat pos relative to camRotation
		[
			Math.cos(camRotation[0]) * Math.cos(camRotation[1]),
			Math.sin(camRotation[1]),
			Math.sin(camRotation[0]) * Math.cos(camRotation[1])
		];
		addedPos = [0,0,0]; //ouput variable for vector addition
		addedPos = vec3.add(addedPos, lookat, camPosition); //add cam position to the lookat offset
    	mat4.lookAt(viewMatrix, camPosition, addedPos, [0,1,0]);
		gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix); //update view Matrix

		//idle loop if no audio is playing / all scales are 0 in visualiser
		if(arrayIsEmpty(scalerHistory)) 
		{
			idleLoop();
			requestAnimationFrame(loop);
			return;
		}
		
		//Set colours based on average decibel value
		var red = avgDB/255; //follow audio buffer
		var green = Math.abs(Math.sin(red*3.14)); //green maxes when audiobuffer is in middle
		var blue = 1-red;//inverse audio buffer

		//colour the particles' vertices
		for(var i = 0; i < boxVertices.length; i+=7)
		{
			if (boxVertices[i+1] > 0) //If not centre coord, set colours
			{
				boxVertices[i+3] = red; //red
				boxVertices[i+4] = green; //green
		   		boxVertices[i+5] = blue; //blue
	  		}
		}

		//draw frequency data
		setWaveYVertices();
		gl.disable(gl.CULL_FACE);
		var drawFreqData = function(colour, scale)
		{
			setWaveVertexColours(colour); 
			setAllVertexBuffers(waveVertices, waveIndices); //bind wave polygons into GL buffer
			rotate_Scale_Translate([0,0,0], scale, [0,0,0]);
			gl.drawElements(gl.TRIANGLES, waveIndices.length, gl.UNSIGNED_SHORT, 0);
			rotate_Scale_Translate([0,0,0], [-scale[0], scale[1], scale[2]], [0,0,0]);
			gl.drawElements(gl.TRIANGLES, waveIndices.length, gl.UNSIGNED_SHORT, 0);
		}
		drawFreqData([red, green, blue, 1.0], [1.7, 1.5, 4]);
		drawFreqData([1, 1, 1, 1.0], [0.5, 0.5, 3.8]);
		gl.depthMask(true); 
		gl.colorMask(false, false, false, true); //REQUIRED for alpha stacking
		drawFreqData([1, 1, 1, 0.00], [0.7, 0.5, 3.1]);
		drawFreqData([1, 1, 1, 0.05], [0.9, 0.6, 3.2]);
		drawFreqData([1, 1, 1, 0.12], [1.2, 0.7, 3.3]);
		drawFreqData([1, 1, 1, 0.19], [1.5, 0.8, 3.4]);
		drawFreqData([1, 1, 1, 0.28], [1.9, 1.0, 3.5]);
		drawFreqData([1, 1, 1, 0.36], [2.3, 1.3, 3.6]);
		drawFreqData([1, 1, 1, 0.55], [2.7, 1.6, 3.7]);
		drawFreqData([1, 1, 1, 0.75], [3.1, 1.9, 3.8]);
		drawFreqData([1, 1, 1, 0.85], [3.6, 2.2, 3.9]);
		drawFreqData([1, 1, 1, 0.95], [4.1, 2.2, 3.95]);
		gl.colorMask(true, true, true, true); //reset for non-alpha-stacking
		gl.depthMask(true);
		gl.enable(gl.CULL_FACE);

		//Load cube mesh into buffer for particles
		setAllVertexBuffers(boxVertices, boxIndices);

		//Manipulate particles in front
        gl.enable(gl.BLEND);
		for(var i=0; i< angleHistory.length; i+=8) //for each layer of particles
		{
			matrixStack.save();
			var currentScale = scalerHistory[i]; //the scale of this layer
			var currentSpread = spreadHistory[i]-i*1.5/8; //how far particles spread apart in single layer
			var currentTranslation = [0, currentSpread, backwardTranslation]; //the spread and push-back combined into a translation
			var total_Scale = [currentScale, currentScale, currentScale];
			
			for(let j=0; j<4;j++)
			{
				//var stackedScale = spread - 0.725; //0 to 1.45 is the spread range - move it between negative/positive
				matrixStack.save();
				rotate_Scale_Translate_Stack([angleHistory[i]+(j*1.57), angle_y, 0], total_Scale, currentTranslation);
				matrixStack.save();
				rotate_Scale_Translate_Stack([4*Math.sin(spreadHistory[i]),0,4*Math.sin(angleHistory[i]/4)], [1, 0.1, 1], [0,0,0]);
				//rotate_Stack([4*Math.sin(spreadHistory[i]),0,4*Math.sin(angleHistory[i]/4)]);
				matrixStack.restore();
				gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
				matrixStack.restore();
			}
			matrixStack.restore();
			backwardTranslation+=3.5;
		}
		gl.disable(gl.BLEND);
		
		
		//end main render loop
		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
};

var idleLoop = function()
{
	//Load cube mesh
	setAllVertexBuffers(boxVertices, boxIndices);
	rotate_Scale_Translate([0, framecount*0.1, 0], [1.0,1+Math.sin(framecount*0.01),1.0], [0.0,0.0,0.0]);
	gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
}

var rotate_Scale_Translate = function(angle, scale, translation) //three mtx operations combined into one
{
	mat4.rotate(yRotationMatrix, identityMatrix, angle[0], [0, 0, 1]); //x
	mat4.rotate(xRotationMatrix, identityMatrix, angle[1], [0, 1, 0]); //y
	mat4.rotate(zRotationMatrix, identityMatrix, angle[2], [1, 0, 0]); //z
	mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
	mat4.translate(worldMatrix, worldMatrix, translation);
	mat4.scale(worldMatrix, worldMatrix, scale);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
}

var rotate_Scale_Translate_Stack = function(angle, scale, translation)
{
	rotatem4([angle[2], angle[1], angle[0]], matrixStack);
	matrixStack.translate(translation);
	matrixStack.scale(scale);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, matrixStack.getCurrentMatrix());
}

var rotate_Stack = function(angle)
{
	rotatem4(angle, matrixStack);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, matrixStack.getCurrentMatrix());
}

var scale_Stack = function(scale)
{
	matrixStack.scale(scale);
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, matrixStack.getCurrentMatrix());
}