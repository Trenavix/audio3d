var mp3s = <?php 
$path = './songs';
$out = array_values(array_diff(scandir($path), array('.', '..')));
foreach ($out as $filename) {
    $filename = $path . "/" . $filename;
}
echo json_encode($out); ?>;
