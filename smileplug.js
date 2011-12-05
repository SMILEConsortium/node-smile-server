var js = require('./lib/js.js');
var createServer = require('http').createServer;
var routes = require('./routes');
var url = require('url');

js.CONFIG = {
  'PORT' : 80,
  'HOST' : '0.0.0.0',
  'VERSION_TAG' : '0.1.0',
  'VERSION_DESCRIPTION' : 'Put your app description here',
  'SLIDE_DIR' : './'
};

//
// Routes
//
js.put('/smile/currentmessage', routes.handleCurrentMessagePut);
js.post('/smile/currentmessage', routes.handleCurrentMessagePut);
js.get('/smile/currentmessage', routes.handleCurrentMessageGet);

js.put('/smile/startmakequestion', routes.handleStartMakeQuestionPut);
js.post('/smile/startmakequestion', routes.handleStartMakeQuestionPut);

js.put('/smile/sendinitmessage', routes.handleSendInitMessagePut);
js.post('/smile/sendinitmessage', routes.handleSendInitMessagePut);

js.put('/smile/question', routes.handleQuestionPut);
js.post('/smile/question', routes.handleQuestionPut);
js.put('/smile/question/:id', routes.handleQuestionPut, true);
js.post('/smile/question/:id', routes.handleQuestionPut, true);
js.get('/smile/question/:id', routes.handleQuestionGet, true);

// Backward compatibility with JunctionQuiz
js.get('/JunctionServerExecution/current/MSG/smsg.txt',
    routes.handleCurrentMessageGet);
js.post('/JunctionServerExecution/pushmsg.php',
    routes.handlePushMsgPost);

//console.info(js.ROUTE_MAP);
//console.info(js.RE_MAP);

var app = module.exports = createServer(function(req, res) {
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
    var pathName = url.parse(req.url).pathname;
    var routeMap = js.ROUTE_MAP[req.method];
    handler = routeMap[pathName];
    if (!handler) {
      var reMap = js.RE_MAP[req.method];
      for (var path in reMap) {
        var expression = reMap[path];
        if (expression && expression.test(pathName)) {
          req.id = RegExp.$1;
          handler = routeMap[expression];
          break;
        }
      }
      if (!handler) {
        handler = js.notFound;
        console.warn("Not found: " + pathName);
      }
    }

    res.sendText = sendText;
    res.sendJSON = sendJSON;
    
    if (handler) {
      if (req.method === 'PUT' || req.method === 'POST') {
        var contentType = req.headers['content-type'];
        js.parsers[contentType](req, res, handler);
      } else {
        handler(req, res);
      }
    }

  } catch (e) {
    console
        .error("\nCaught a server-side Node.js exception.  Ouch!  Here's what happened: "
            + e.name + ". Error message: " + e.message + "\nStack:\n" + e.stack);
    js.internalServerError(req, res);
  }

});

app.runServer = function runServer(port) {
  js.listenHttpWS(this, port, js.CONFIG['HOST']);
}

if (require.main === module) {
  app.runServer(js.CONFIG['PORT']);
}
