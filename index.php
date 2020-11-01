<!DOCTYPE html>
    <head>
        <title>Audio3D</title>
        <link rel="stylesheet" type="text/css" href="styles.css">
    </head>
    <div class="keepleft"><audio id="htmlaudio"></audio></div>
    <body id="body">
        <div id="clickStart" class="clickStart">
            <div class="txtWindow"><u>Click to play a song!</u></div><br>
            <div class=subTxtWindow><i>Note: iOS may not support audio buffer!</i></div>
        </div>
        <br />
        <i>Uh oh! Looks like we've got a problem with WebGL. <br> Either your device sucks or Trenavix sucks.</i>
        <div class="background">
            <canvas id="game-surface" style='position:fixed; left:0px; top:0px; z-index: -1;'>
                <!--- PHP dependent script below!-->
                <script src='directories.php'></script>
                <script src="https://unpkg.com/react@16/umd/react.development.js" crossorigin></script>
                <script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js" crossorigin></script>
                <script src="audio.js"></script>
                <script src="dependencies/gl-matrix.js"></script>
                <script src="dependencies/functions.js"></script>
                <script src="dependencies/keydrown.js"></script>
                <script src="https://webglfundamentals.org/webgl/resources/m4.js"></script>
                <script src="dependencies/matrixStack.js"></script>    
                <script src="shadersAndBuffers.js"></script>
                <script src="audio3d.js"></script>
                <script src="styles.js"></script>
                <script>Render();</script>
            </canvas>
        </div>
        
    </body>