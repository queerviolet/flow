'use strict';

var fs = require('fs');
var flow = require('./flow.js');

var p = console.log.bind(console);

var src = fs.readFileSync('./sample0.flow');

p(src);

try {
  p(JSON.stringify(flow.parse(src.toString()), null, 2));
} catch(x) {
  p(x);
}