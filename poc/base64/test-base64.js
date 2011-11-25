var fs = require('fs');
var path = require('path');
var assert = require('assert');

var imageData = fs.readFileSync(path.join(process.cwd(), 'actminds.jpg'), 'binary');
var base64Data = fs.readFileSync('actminds.b64').toString();
var dataBuffer = new Buffer(base64Data, 'base64').toString('binary');

assert.ok(dataBuffer === imageData);

// Uncomment the line below if you want to see an output of the conversion from base64 data to a JPG image
// fs.writeFileSync('out.jpg', dataBuffer, encoding='binary')
