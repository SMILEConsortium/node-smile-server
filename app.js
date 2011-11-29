
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var path = require('path');

var app = module.exports = express.createServer();

// Configuration

/**
 * Module Configuration
 */
app.config = {};
app.config.TMP_DIR = "/tmp/smileplug-server";
app.config.PORT = 3000;



app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
  app.use(express.errorHandler({
    dumpExceptions : true,
    showStack : true
  }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

app.all('/smileplug/*', function(req, res, next){
  req.config = app.config;
  if (req.config) {
    next();
  } else {
    next(new Error('cannot find configuration'));
  }
});

// Routes

app.get('/', routes.index);
// sendMessage
app.put('/smileplug/currentMessage', routes.setCurrentMessage);
// readMessage
app.get('/smileplug/currentMessage', routes.getCurrentMessage);

// Old server compatibility
app.get('/JunctionServerExecution/current/MSG/smsg.txt', routes.getCurrentMessage);

app.runServer = function runServer(port) {
  this.listen(port);
  console.log("Express server listening on port %d in %s mode",
      this.address().port, this.settings.env);
};

if (require.main === module) {
  app.runServer(app.config.PORT);
} 

