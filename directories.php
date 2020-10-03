var mp3s = <?php 
$path = './songs';
$out = array_values(array_diff(scandir($path), array('.', '..')));
$out2 = array();
foreach ($out as $filename) 
{
    $out2[] = $path . "/" . $filename;
}
echo json_encode($out2); ?>;
