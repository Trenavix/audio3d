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
var maxFreqRange = 0;
var avgFreq = 0;
var AudioBufferArray = new Array(256);
var AudioBufferThirds = new Array(3);
var mp3s = ["carbon.mp3", "dreamstate_logic.mp3", "darklord.mp3", "blackmill.m4a", "luv_letter.mp3", "derelicts.mp3"];
var currentMP3 = 4;
var currentAudio = document.getElementById("htmlaudio");
var context;
var src;
var analyser;
var AudioProcess = function () 
{
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
  if(context == null) context = new AudioContext(currentAudio);
  if(src == null) src = context.createMediaElementSource(currentAudio);
  if(analyser == null) analyser = context.createAnalyser();

    src.connect(analyser);
    analyser.connect(context.destination);

    analyser.fftSize = 256;

    var bufferLength = analyser.frequencyBinCount;

    var dbArray = new Uint8Array(bufferLength);

    var x = 0;

    function renderFrame() 
  	{
      requestAnimationFrame(renderFrame);

      x = 0;

      analyser.getByteFrequencyData(dbArray);
      var total = 0;
      var thirds = bufferLength/3;
      var maxLevelDB = 0;
      avgFreq = 0;
      AudioBufferThirds = new Float32Array(3);
      var freqArray = new Float32Array(256);
      for (var i = 0; i< bufferLength; i++)
      {
        freqArray[dbArray[i]] = i; //Frequency array INDEX = DB, its VALUE = freq
      }
      for (var i = 0; i< bufferLength; i++)
      {
        avgFreq += freqArray[i]; //total all freq values
      }
      avgFreq /= bufferLength; //average
      for (var i = 0; i < bufferLength; i++) 
      {
		  AudioBufferArray[i] = dbArray[i];
          total += dbArray[i];
          if(dbArray[i] > maxLevelDB) {maxLevelDBIdx = dbArray[i]; maxFreqRange = i;}
          if(i < thirds) {AudioBufferThirds[0] += dbArray[i];}
          else if(i < thirds*2) {AudioBufferThirds[1] += dbArray[i];}
          else {AudioBufferThirds[2] += dbArray[i];}
      }
      //console.log(maxLevelDB.toString());
      for(var i = 0; i < AudioBufferThirds.length; i++) AudioBufferThirds[i] /= thirds;
	  avgDB = total/dbArray.length; //average decibel across ALL frequencies
    avgDB *= 1.8; //Expiramental: Multiplier for greater differences
    if(currentMP3 == 4) avgDB /= 1.285; //m4a has wider freq range
    if (avgDB > 255) avgDB = 255;
    }
    currentAudio.play();
    renderFrame();
}