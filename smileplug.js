/**
 #
 #Copyright (c) 2011-2012 Razortooth Communications, LLC. All rights reserved.
 #
 #Redistribution and use in source and binary forms, with or without modification,
 #are permitted provided that the following conditions are met:
 #
 #    * Redistributions of source code must retain the above copyright notice,
 #      this list of conditions and the following disclaimer.
 #
 #    * Redistributions in binary form must reproduce the above copyright notice,
 #      this list of conditions and the following disclaimer in the documentation
 #      and/or other materials provided with the distribution.
 #
 #    * Neither the name of Razortooth Communications, LLC, nor the names of its
 #      contributors may be used to endorse or promote products derived from this
 #      software without specific prior written permission.
 #
 #THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 #ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 #WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 #DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 #ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 #(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 #LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 #ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 #(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 #SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **/

var js = require('./lib/js.js');
var routes = require('./routes');
var url = require('url');
var starttime = (new Date()).getTime();

js.CONFIG = {
    'PORT' : process.env.PORT || 80,
    'HOST' : '0.0.0.0',
    'VERSION_TAG' : '0.3.0',
    'VERSION_DESCRIPTION' : 'SMILE Server',
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

js.put('/smile/metadata/rating', routes.handleRatingMetadataPut);
js.post('/smile/metadata/rating', routes.handleRatingMetadataPut);
js.get('/smile/metadata/rating', routes.handleRatingMetadataGet);


js.put('/smile/question', routes.handlePushMessage);
js.post('/smile/question', routes.handlePushMessage);
js.get('/smile/question', routes.handleQuestionGetAll);
js.put('/smile/question/csv', routes.handleCsvPushQuestions);
js.post('/smile/question/csv', routes.handleCsvPushQuestions);


js.put('/smile/question/:id', routes.handlePushMessage, true);
js.post('/smile/question/:id', routes.handlePushMessage, true);
js.get('/smile/question/:id', routes.handleQuestionGet, true);

js.get('/smile/student', routes.handleStudentGetAll);
js.put('/smile/student', routes.handleStudentPut);
js.post('/smile/student', routes.handleStudentPut);
js.get('/smile/student/:id/status', routes.handleStudentStatusGet, true);
// Use this to get a decent results calculation
js.get('/smile/student/:id/result', routes.handleStudentResultsGet, true);

js.get('/smile/results', routes.handleResultsGet);
js.get('/smile/all', routes.handleAllMessagesGet);
js.get('/smile', routes.handleSmileRootGet);
js.get('/smile/', routes.handleSmileRootGet);

js.get('/smile/reset', routes.handleResetGet);
js.put('/smile/reset', routes.handleResetPut);

js.put('/smile/store', routes.handleStore);
js.post('/smile/store', routes.handleStore);

js.put('/smile/backup', routes.handleBackup);
js.post('/smile/backup', routes.handleBackup);
js.get('/smile/backup', routes.handleBackup);

js.put('/smile/upload/image', routes.handleImageUpload);
js.post('/smile/upload/image', routes.handleImageUpload);


js.get('/smile/view/monitoring.html', routes.handleMonitoringHtmlGet, true);

js.get('/smile/questionview/:id_result.html', routes.handleQuestionResultHtmlGet, true);
js.get('/smile/questionview/:id.html', routes.handleQuestionHtmlGet, true);
js.get('/smile/questionview/:id.json', routes.handleQuestionJSONGet, true);
js.get('/smile/questionview/:id.jpg', routes.handleQuestionImageGet, true);

// Compatibility with newer SMILE Student MULTILANG
js.post('/smile/pushmsg.php', routes.handlePushMsgPost);
js.get('/smile/current/MSG/smsg.txt', routes.handleCurrentMessageGet);
// This gets the student status by IP, including their answers
js.get('/smile/current/MSG/:id.txt', routes.handleStudentStatusGetByIP, true);
js.get('/smile/current/:id_result.html', routes.handleQuestionResultHtmlGet, true);
js.get('/smile/current/:id.html', routes.handleQuestionHtmlGet, true);
js.get('/smile/current/:id.jpg', routes.handleQuestionImageGet, true);

var restart = function(req, res) {
    app.close();
    app.runServer(js.CONFIG.PORT);
    res.sendText(HTTP_STATUS_OK, OK);
};

js.get('/smile/restart', restart);

// Backward compatibility with JunctionQuiz
js.get('/JunctionServerExecution/current/MSG/smsg.txt', routes.handleCurrentMessageGet);
js.post('/JunctionServerExecution/pushmsg.php', routes.handlePushMsgPost);
js.get('/JunctionServerExecution/current/MSG/:id.txt', routes.handleStudentStatusGetByIP, true);
js.get('/JunctionServerExecution/current/:id_result.html', routes.handleQuestionResultHtmlGet, true);
js.get('/JunctionServerExecution/current/:id.html', routes.handleQuestionHtmlGet, true);
js.get('/JunctionServerExecution/current/:id.jpg', routes.handleQuestionImageGet, true);

// General utility routes
js.get('/smile/echoclientip', routes.handleEchoClientIP);

// Temporary hack for managing /SMILE and uppercase URLs. See https://github.com/SMILEConsortium/node-smile-server/issues/13
var routeMap = {
    'PUT' : {},
    'GET' : {},
    'POST' : {}
};

Object.keys(js.ROUTE_MAP).forEach(function(method) {
    var methodMap = js.ROUTE_MAP[method];
    Object.keys(methodMap).forEach(function(k) {
        var value = methodMap[k];
        routeMap[method][k] = value;
        routeMap[method][k.toUpperCase()] = value;
        routeMap[method][k.replace('smile', 'SMILE')] = value;
    });
});

var reMap = {
    'PUT' : {},
    'GET' : {},
    'POST' : {}
};

Object.keys(js.RE_MAP).forEach(function(method) {
    var methodMap = js.RE_MAP[method];
    Object.keys(methodMap).forEach(function(k) {
        var value = methodMap[k];
        reMap[method][k] = value;
        reMap[method][k.toUpperCase()] = value;
        reMap[method][k.replace('smile', 'SMILE')] = value;
    });
});

js.ROUTE_MAP = routeMap;
js.RE_MAP = reMap;
// Hack end

//console.info(js.ROUTE_MAP);
//console.info(js.RE_MAP);

var app = module.exports = js.server;

if (require.main === module) {
    app.runServer(js.CONFIG.PORT);
}
