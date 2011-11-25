var js = require('./lib/js.js');
var createServer = require('http').createServer;

js.CONFIG = {
  'PORT':8000,
  'HOST': 'localhost',
  'VERSION_TAG':'0.1.0',
  'VERSION_DESCRIPTION':'Put your app description here',
  'SLIDE_DIR':'./'
};

var server = createServer(function(req, res) {
  try {
    if (req.method === "GET" || req.method === "HEAD") {
      var handler;
      handler = js.ROUTE_MAP[url.parse(req.url).pathname];
      if (!handler) {
        for (var expr in js.RE_MAP) {
          // sys.puts('Test ' + req.url + ' against expr: ' + expr);
          if (js.RE_MAP[expr] && js.RE_MAP[expr].test(url.parse(req.url).pathname)) {
            handler = js.ROUTE_MAP[js.RE_MAP[expr].toString()];
            break;
          } else {
            handler = notFound;
          }
        }
      }
    }

    res.simpleText = function (code, body) {
          res.writeHead(code, { "Content-Type": "text/plain"
                , "Content-Length": body.length
            });
      res.end(body);
    };

    res.simpleJSON = function (code, obj) {
      var body = JSON.stringify(obj);
      res.writeHead(code, { "Content-Type": "text/json"
                , "Content-Length": body.length
            });
      res.end(body);
    };

    handler(req, res);
  } catch(e) {
    console.error("Caught a server-side Node.js exception.  Ouch!  Here's what happened: " + e.name + ". Error message: " + e.message);
    js.internalServerError(req, res);
  }

});

js.listenHttpWS(server, js.CONFIG['PORT'], js.CONFIG['HOST']);
