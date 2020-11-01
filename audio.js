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

var avgDB = 0; //global average decibel variable
var audioBufferSize = 512;
var AudioBufferArray = new Array(audioBufferSize); //global audiobuffer decibel 
var currentMP3 = mp3s.length-1; //start index at first mp3
var currentAudio = document.getElementById("htmlaudio"); //get audio/controls
var context; //init AudioContext
var src; //init Audio src file str
var analyser;  //init 

var AudioProcess = function () 
{
  var elem = document.getElementById('clickStart');
  if(elem != null)  elem.parentNode.removeChild(elem); //remove "Click Start to play" element

  currentAudio.crossOrigin = "anonymous"; //CORS bypass to access files
  currentAudio.pause(); //If Audio is loaded, pause/end it
  currentMP3++; //Move to next song in index
  if(currentMP3 >= mp3s.length) currentMP3 = 0; //if end of song array, restart

  currentAudio.src = mp3s[currentMP3]; //set file src
  currentAudio.controls = true;
  currentAudio.load();
  currentAudio.play();

  //Initialise audiocontext ONLY if it has not been done so already
  if(context == null) 
  {
    context = new AudioContext(currentAudio);
    src = context.createMediaElementSource(currentAudio);
    analyser = context.createAnalyser();
  }

  //Connect analyser to source
  src.connect(analyser);
  analyser.connect(context.destination);

  //set up buffer byte data
  analyser.fftSize = audioBufferSize;
  var bufferLength = analyser.frequencyBinCount;
  var dbArray = new Uint8Array(bufferLength);

  function renderFrame() 
  {
    requestAnimationFrame(renderFrame);

    analyser.getByteFrequencyData(dbArray);
    var total = 0; //initialise summation of dB across all frequencies
    for (var i = 0; i < bufferLength; i++) 
    {
		  AudioBufferArray[i] = dbArray[i];
      total += dbArray[i];
    }
	  avgDB = total/bufferLength; //average decibel across ALL frequencies
    avgDB *= 2; //Expiramental: Multiplier for greater differences
    if(mp3s[currentMP3].localeCompare("songs/blackmill.m4a") == 0) avgDB /= 1.285; //m4a has wider freq range thus higher avg dB
    //if (avgDB > 255) avgDB = 255; //overflow protection
  }
  currentAudio.play();
  renderFrame();
}