function MatrixStack() {
  this.stack = [];

  // since the stack is empty this will put an initial matrix in it
  this.restore();
}

// Pops the top of the stack restoring the previously saved matrix
MatrixStack.prototype.restore = function() {
  this.stack.pop();
  // Never let the stack be totally empty
  if (this.stack.length < 1) {
    this.stack[0] = m4.identity();
  }
};

// Pushes a copy of the current matrix on the stack
MatrixStack.prototype.save = function() {
  this.stack.push(this.getCurrentMatrix());
};

// Gets a copy of the current matrix (top of the stack)
MatrixStack.prototype.getCurrentMatrix = function() {
  return this.stack[this.stack.length - 1].slice();
};

// Lets us set the current matrix
MatrixStack.prototype.setCurrentMatrix = function(m) {
  this.stack[this.stack.length - 1] = m;
  return m;
};

// Translates the current matrix
MatrixStack.prototype.translate = function([x, y, z]) {
  if (z === undefined) {
    z = 0;
  }
  var m = this.getCurrentMatrix();
  this.setCurrentMatrix(m4.translate(m, x, y, z));
};

// Rotates the current matrix around X
MatrixStack.prototype.rotateX = function(angleInRadians) {
    var m = this.getCurrentMatrix();
    this.setCurrentMatrix(m4.xRotate(m, angleInRadians));
  };
  
// Rotates the current matrix around Y
MatrixStack.prototype.rotateY = function(angleInRadians) {
    var m = this.getCurrentMatrix();
    this.setCurrentMatrix(m4.yRotate(m, angleInRadians));
  };

// Rotates the current matrix around Z
MatrixStack.prototype.rotateZ = function(angleInRadians) {
  var m = this.getCurrentMatrix();
  this.setCurrentMatrix(m4.zRotate(m, angleInRadians));
};

    

// Scales the current matrix
MatrixStack.prototype.scale = function([x, y, z]) {
  if (z === undefined) {
    z = 1;
  }
  var m = this.getCurrentMatrix();
  this.setCurrentMatrix(m4.scale(m, x, y, z));
};

/*var createMatrix = function(sizex, sizey)
{
    var matrix = [];
    for(var i=0; i<sizey; i++) {
        matrix[i] = new Array(sizex);
    }
    return matrix;
}*/
