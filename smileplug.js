var js = require('./lib/js.js');
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

js.put('/smile/startsolvequestion', routes.handleStartSolveQuestionPut);
js.post('/smile/startsolvequestion', routes.handleStartSolveQuestionPut);

js.put('/smile/sendinitmessage', routes.handleSendInitMessagePut);
js.post('/smile/sendinitmessage', routes.handleSendInitMessagePut);

js.put('/smile/question', routes.handlePushMessage);
js.post('/smile/question', routes.handlePushMessage);
js.get('/smile/question', routes.handleQuestionGetAll);

js.put('/smile/question/:id', routes.handlePushMessage, true);
js.post('/smile/question/:id', routes.handlePushMessage, true);
js.get('/smile/question/:id', routes.handleQuestionGet, true);

js.get('/smile/student', routes.handleStudentGetAll);
js.get('/smile/student/:id/status', routes.handleStudentStatusGet, true);

// Backward compatibility with JunctionQuiz
js.get('/JunctionServerExecution/current/MSG/smsg.txt',
    routes.handleCurrentMessageGet);
js.post('/JunctionServerExecution/pushmsg.php',
    routes.handlePushMsgPost);
js.get('/JunctionServerExecution/current/MSG/:id.txt', routes.handleStudentStatusGetByIP, true);

//console.info(js.ROUTE_MAP);
//console.info(js.RE_MAP);

var app = module.exports = js.server;

if (require.main === module) {
  app.runServer(js.CONFIG['PORT']);
}
