var js = require('./lib/js.js');
var createServer = require('http').createServer;
var routes = require('./routes');
var url = require('url');

js.CONFIG = {
  'PORT' : 8000,
  'HOST' : 'localhost',
  'VERSION_TAG' : '0.1.0',
  'VERSION_DESCRIPTION' : 'Put your app description here',
  'SLIDE_DIR' : './'
};

js.ROUTE_MAP = {
  '/smile/currentmessage' : routes.handleCurrentMessage,
  
  
  // Backward compatibility with JunctionQuiz
  '/JunctionServerExecution/current/MSG/smsg.txt' : routes.handleCurrentMessage,
};

var app = module.exports = createServer(function(req, res) {
  parseJSON = function(req, res, next) {
    var buf = '';
    var next = next;
    req.on('data', function(chunk) {
      buf += chunk
    });
    req.on('end', function() {
      req.body = JSON.parse(buf);
      next(req, res);
    });
  };

  sendText = function(code, body) {
    res.writeHead(code, {
      "Content-Type" : "text/plain",
      "Content-Length" : body.length
    });
    res.end(body);
  };

  sendJSON = function(code, obj) {
    var body = JSON.stringify(obj);
    res.writeHead(code, {
      "Content-Type" : "text/json",
      "Content-Length" : body.length
    });
    res.end(body);
  };
  
  try {
    var handler;
    pathname = url.parse(req.url).pathname;
    handler = js.ROUTE_MAP[pathname];
    if (!handler) {
      for ( var expr in js.RE_MAP) {
        if (js.RE_MAP[expr]
            && js.RE_MAP[expr].test(url.parse(req.url).pathname)) {
          handler = js.ROUTE_MAP[js.RE_MAP[expr].toString()];
          break;
        } else {
          handler = notFound;
        }
      }
    }

    res.sendText = sendText;
    res.sendJSON = sendJSON;
    
    if (req.method === 'PUT') {
      parseJSON(req, res, handler);
    } else {
      handler(req, res);
    }
    
  } catch (e) {
    console
        .error("Caught a server-side Node.js exception.  Ouch!  Here's what happened: "
            + e.name + ". Error message: " + e.message);
    js.internalServerError(req, res);
  }

});

app.runServer = function runServer(port) {
  js.listenHttpWS(this, port, js.CONFIG['HOST']);
  console.log("Express server listening on port %d", port);
};

if (require.main === module) {
  app.runServer(js.CONFIG['PORT']);
}
