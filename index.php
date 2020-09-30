<!DOCTYPE html>
error_reporting(E_ALL);
    <head>
        <title>Audio3D</title>
        <style>
            html, body 
            {
                width:  100%;
                height: 100%;
                margin: 0px;
                border: 0;
                overflow: hidden;
                display: block;
                position: relative;
            }
            .clickStart
            {
	        z-index: 1;
            position: fixed;
            top: 50%;
            left: 25%;
            height: 150px;
            width: 50%;
            line-height: 200px;
            text-align: center;
            margin-top: -50px;
	        background-color: #64646464;
            }
            .txtWindow
            {
            display: inline-block;
            vertical-align: middle;
            line-height: 150px;
                font-size: 4vw;
                color: #CECECEFF;
            }
            .subTxtWindow
            {
            display: inline-block;
            vertical-align: middle;
            line-height: 40px;
                font-size: 1.5vw;
                color: #CECECEFF;
            }
            div.keepleft
            {
                position:absolute;
                left:0px;
                bottom:0px;
            }
            .background 
            {
            position:absolute;
            left:0px;
            top:0px;
            margin: 0px;
            padding: 0px;
            z-index:-1;	
            }

        </style>
    </head>
    <div class="keepleft"><audio id="htmlaudio" src="carbon.mp3" ></audio></div>
    <body id="body">
        <div id="clickStart" class="clickStart">
            <div class="txtWindow"><u>Click to play a song!</u></div><br>
            <div class=subTxtWindow><i>Note: iOS may not support audio buffer!</i></div>
        </div>
        <br />
        <i>Uh oh! Looks like we've got a problem with WebGL. <br> Either your device sucks or Trenavix sucks.</i>
        <div class="background">
            <canvas id="game-surface" style='position:fixed; left:0px; top:0px; z-index: -1;'>
            <script src='directories.php'></script>
                <script src="dependencies/gl-matrix.js"></script>
                <script src="dependencies/functions.js"></script>
                <script src="dependencies/keydrown.js"></script>
                <script src="shadersAndBuffers.js"></script>
                <script src="audio.js"></script>
                <script src="audio3d.js"></script>
                <script>Render();</script>
            </canvas>
        </div>
        
    </body>