function newScope(base, frame) {
  var scope = Object.create(base);
  if (frame) {
    for (var prop in frame) {
      scope[prop] = frame[prop];
    }
  }
  return scope;
}


function Sprocket() {
  this.reader = null;
  this.writer = null;
}

Sprocket.prototype.writeNow = function(value) {
  if (this.reader) {
    this.reader(value);
    this.reader = null;
    return value;
  }
}

Sprocket.prototype._send = function() {
  if (this.reader && this.writer) {
    var value = this.writer();
    this.reader(value);
    this.reader = null;
    this.writer = null;
    return true;
  }
  return false;
}

Sprocket.prototype.write = function(value) {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (self.writer) {
      throw new Error('unexpected writer');
    }
    self.writer = function() {
      resolve(value);
      return value;
    };
    self._send();
  });
};

Sprocket.prototype.readNow = function() {
  if (this.writer) {
    var value = this.writer();
    this.writer = null;
    return value;
  }
};

Sprocket.prototype.read = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (self.reader) {
      throw new Error('unexpected reader');
    }
    self.reader = function(value) {
      resolve(value);
      return value;
    };
    self._send();
  });
};

function $pump(gen, value, onDone) {
//  console.log('$pump', gen, value, onDone);
  var returnValue = undefined;
  var task = gen.next(value);
//  console.log('  ->', task);
  if (task.done) {
    if (onDone) {
      return onDone(task.value);
    }
  }
  if (task.value instanceof Promise) {
//    console.log('  is promise');
    task.value.then(function(value) {
//      console.log('  did resolve to', value);
      $pump(gen, value, onDone);
    });
  }
}

function $run(scope, args, func, co) {
  var self = this;
  return new Promise(function(resolve, reject) {
    $pump(func.call(self, scope, args), undefined, resolve);
    if (co) { $pump(co.call(self, scope, args), undefined, null); }
  });
}



function *B(sprock, args) {
  console.log(yield sprock.data.read());
  return 'finally.';
}

function A() {
  $run(newScope(null, {data: new Sprocket()}), {}, B, function*(sprock) {
    yield sprock.data.write('hello sss world');
  }).then(function(val) {
    console.log('val:', val);
  });
}

A();

/*

console.log('x=', stack.top().x);
stack.top().x = 14;
console.log('stack.top after assignment:', stack.top())
stack.push();
stack.top().y = 22;
var frame = stack.top();
for (var prop in frame) {
  console.log(' topmost: ' + prop + '=' + frame[prop])
}
stack.pop();
frame = stack.top();
for (var prop in frame) {
  console.log(' bottommost: ' + prop + '=' + frame[prop])
}
console.log(stack.top());*/