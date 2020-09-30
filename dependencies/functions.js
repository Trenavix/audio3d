var resizeCanvas = function ()
{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}


var addEntryToFrontOfArray = function(array, newValue)
{
    for(var i = array.length-1; i>=0; i--)
    {
        array[i] = array[i-1];
    }
    array[0] = newValue;
}

var extendArrayWithData = function(array, extraArray)
{
    var newArray = new Array(array.length+extraArray.length);
    for(var i=0; i<array.length; i++)
    {
        newArray[i] = array[i];
    }
    var offset = array.length;
    for(var i=0; i<extraArray.length; i++)
    {
        newArray[offset+i] = extraArray[i];
    }
    return newArray;
}

var injectIntoArray = function(array, injectingArray, index)
{
    for(var i = 0; i < injectingArray.length; i++)
    {
        array[index+i] = injectingArray[i];
    }
}

var arrayIsEmpty = function(array)
{
  var total = 0;
  for(let i=0; i<array.length; i++) total += array[i]; //add up all of array's values
  return (total == 0);
}
