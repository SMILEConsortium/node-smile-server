var js = require('./lib/js.js');
var routes = require('./routes');
var url = require('url');

js.CONFIG = {
  'PORT' : 80,
  'HOST' : '0.0.0.0',
  'VERSION_TAG' : '0.1.5-beta2-<' + Date() + '>',
  'VERSION_DESCRIPTION' : 'SMILE Junction Server',
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

js.put('/smile/sendshowresults', routes.handleSendShowResultsPut);
js.post('/smile/sendshowresults', routes.handleSendShowResultsPut);

js.put('/smile/question', routes.handlePushMessage);
js.post('/smile/question', routes.handlePushMessage);
js.get('/smile/question', routes.handleQuestionGetAll);

js.put('/smile/question/:id', routes.handlePushMessage, true);
js.post('/smile/question/:id', routes.handlePushMessage, true);
js.get('/smile/question/:id', routes.handleQuestionGet, true);

js.get('/smile/student', routes.handleStudentGetAll);
js.put('/smile/student', routes.handleStudentPut);
js.post('/smile/student', routes.handleStudentPut);
js.get('/smile/student/:id/status', routes.handleStudentStatusGet, true);

js.get('/smile/results', routes.handleResultsGet);
js.get('/smile/all', routes.handleAllMessagesGet);
js.get('/smile', routes.handleSmileRootGet);
js.get('/smile/', routes.handleSmileRootGet);

js.get('/smile/reset', routes.handleResetGet);
js.put('/smile/reset', routes.handleResetPut);

js.get('/smile/questionview/:id_result.html', routes.handleQuestionResultHtmlGet, true);
js.get('/smile/questionview/:id.html', routes.handleQuestionHtmlGet, true);
js.get('/smile/questionview/:id.jpg', routes.handleQuestionImageGet, true);

var restart = function(req, res) {
  app.close();
  app.runServer(js.CONFIG['PORT']);
  res.sendText(HTTP_STATUS_OK, OK);
}

js.get('/smile/restart', restart);

// Backward compatibility with JunctionQuiz
js.get('/JunctionServerExecution/current/MSG/smsg.txt', routes.handleCurrentMessageGet);
js.post('/JunctionServerExecution/pushmsg.php', routes.handlePushMsgPost);
js.get('/JunctionServerExecution/current/MSG/:id.txt', routes.handleStudentStatusGetByIP, true);
js.get('/JunctionServerExecution/current/:id_result.html', routes.handleQuestionResultHtmlGet, true);
js.get('/JunctionServerExecution/current/:id.html', routes.handleQuestionHtmlGet, true);
js.get('/JunctionServerExecution/current/:id.jpg', routes.handleQuestionImageGet, true);


//console.info(js.ROUTE_MAP);
//console.info(js.RE_MAP);

var app = module.exports = js.server;

if (require.main === module) {
  app.runServer(js.CONFIG['PORT']);
}
