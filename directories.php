var mp3s = <?php 
$path = './songs';
$files = array_values(array_diff(scandir($path), array('.', '..')));
$directories = array();
foreach ($files as $filename) 
{
    $directories[] = $path . "/" . $filename;
}
echo json_encode($directories); ?>;
