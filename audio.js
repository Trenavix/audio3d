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

var avgDB = 0;
var avgFreq = 0;
var AudioBufferArray = new Array(256);
var mp3s = 
[
  "songs/carbon.mp3", 
  "songs/dreamstate_logic.mp3", 
  "songs/darklord.mp3", 
  "songs/blackmill.m4a", 
  "songs/luv_letter.mp3", 
  "songs/centralplains.mp3", 
  "songs/derelicts.mp3"
];
var currentMP3 = 4;
var currentAudio = document.getElementById("htmlaudio");
var context;
var src;
var analyser;
var AudioProcess = function () 
{
  console.log(mp3s[0]);
  var elem = document.getElementById('clickStart');
  if(elem != null)  elem.parentNode.removeChild(elem);
  currentAudio.crossOrigin = "anonymous";
  currentAudio.pause();
  console.log("AudioProcess is a go");
  currentMP3++;
  if(currentMP3 >= mp3s.length) currentMP3 = 0;
  currentAudio.src = mp3s[currentMP3];
  currentAudio.controls = true;
  currentAudio.load();
  currentAudio.play();
  currentAudio.controls = true;
  if(context == null) 
  {
    context = new AudioContext(currentAudio);
    if(src == null) src = context.createMediaElementSource(currentAudio);
    if(analyser == null) analyser = context.createAnalyser();
  }

  src.connect(analyser);
  analyser.connect(context.destination);

  analyser.fftSize = 256;

  var bufferLength = analyser.frequencyBinCount;

  var dbArray = new Uint8Array(bufferLength);

  function renderFrame() 
  {
    requestAnimationFrame(renderFrame);

    analyser.getByteFrequencyData(dbArray);
    var total = 0;
    avgFreq = 0;
      avgFreq /= bufferLength; //average
      for (var i = 0; i < bufferLength; i++) 
      {
		    AudioBufferArray[i] = dbArray[i];
        total += dbArray[i];
      }
	  avgDB = total/dbArray.length; //average decibel across ALL frequencies
    avgDB *= 1.8; //Expiramental: Multiplier for greater differences
    if(mp3s[currentMP3].localeCompare("songs/blackmill.m4a") == 0) avgDB /= 1.285; //m4a has wider freq range
    if (avgDB > 255) avgDB = 255;
    }
    currentAudio.play();
    renderFrame();
}