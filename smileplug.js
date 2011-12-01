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

//
// Routes
//
js.put('/smile/currentmessage', routes.handleCurrentMessagePut);
js.get('/smile/currentmessage', routes.handleCurrentMessageGet);
js.put('/smile/startmakequestion', routes.handleStartMakeQuestionPut);

// Backward compatibility with JunctionQuiz
js.get('/JunctionServerExecution/current/MSG/smsg.txt',
    routes.handleCurrentMessageGet);

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
      "Content-Type" : "application/json",
      "Content-Length" : body.length
    });
    res.end(body);
  };

  try {
    var handler;
    pathname = url.parse(req.url).pathname;
    handler = js.ROUTE_MAP[req.method][pathname];
    if (!handler) {
      if (req.method === "GET") {
        for ( var expr in js.RE_MAP) {
          if (js.RE_MAP[expr]
              && js.RE_MAP[expr].test(url.parse(req.url).pathname)) {
            handler = js.ROUTE_MAP[js.RE_MAP[expr].toString()];
            break;
          } else {
            handler = js.notFound;
            console.warn(pathname);
          }
        }
      } else {
        handler = js.notFound;
      }
    }

    res.sendText = sendText;
    res.sendJSON = sendJSON;
    
    if (handler) {
      if (req.method === 'PUT') {
        parseJSON(req, res, handler);
      } else {
        handler(req, res);
      }
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
