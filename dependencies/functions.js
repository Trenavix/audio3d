function addToMasterVtxList(vtxList, idxList, newVertices, newIndices)
{
    var initVertSize = vtxList.length;
    var initIdxSize = idxList.length;
    resizeArray(vtxList, initVertSize+newVertices.length, 0);
    resizeArray(idxList, initIdxSize+newIndices.length, 0);
    for(let i=initVertSize; i< vtxList.length; i++) //from newest vertex index and on...
    {
        vtxList[i] = newVertices[i-initVertSize]; //Fill in new vertex data
    }
    for(let i=initIdxSize; i< idxList.length; i++) //from newest index and on...
    {
        //Fill in new index data, but ADD TO EACH INDEX the vtx count before we added to array
        idxList[i] = newIndices[i-initIdxSize]+(initVertSize/7); //7 floats/array indices per vertex
    }
}

function resizeCanvas()
{
    canvas.width = document.body.clientWidth;//width of window
    canvas.height = document.body.clientHeight;
}

function resizeArray(arr, newSize, defaultValue) 
{
    while(newSize > arr.length)
        arr.push(defaultValue);
    arr.length = newSize;
}

function addEntryToFrontOfArray(array, newValue)
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

function injectIntoArray(array, injectingArray, index)
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

function rotatem4(angle, matrixStack) //scale is a size 3 float array
{
    matrixStack.rotateX(angle[0]);
    matrixStack.rotateY(angle[1]);
    matrixStack.rotateZ(angle[2]);
}
