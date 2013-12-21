/**
 #
 #Copyright (c) 2011-2013 Razortooth Communications, LLC. All rights reserved.
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

/**
* smileplug.js
*
* @class js
* @constructor
*/
var js = require('./lib/js.js');
var routes = require('./routes');
var url = require('url');

var starttime = (new Date()).getTime();

js.CONFIG = {
    'PORT' : process.env.PORT || 80,
    'HOST' : '0.0.0.0',
    'VERSION_TAG' : '1.0.1',
    'VERSION_DESCRIPTION' : 'SMILE Plug Server',
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

/**
    Create a session from smile_teacher_android app
**/
js.put('/smile/createsession', routes.createSessionFromTeacherApp);
js.post('/smile/createsession', routes.createSessionFromTeacherApp);

/**
    Get ALL the questions from existing from existin session, without providing any extra session information
    as provided by /smile/all
    
    XXX Yes, it is misnamed, in that it overloads use of /smile/question horribly.
    @method /smile/question
**/
js.get('/smile/question', routes.handleQuestionGetAll);

/**
    Post/Put the csv questions into existing session
    @method /smile/question/csv
**/
js.put('/smile/question/csv', routes.handleCsvPushQuestions);
js.post('/smile/question/csv', routes.handleCsvPushQuestions);


/**
    Post the IQSet update to an existing :contentid.  If :contentid 
    does not exist, create a new IQSet and return a new :contentid
    If no params are present, send JSON data.
    If q param is present, send JSON data for specific question to change
    If img param is present, send the image content in the message body, or if no
    message body, then parse the img param value for a valid URL to pull content XXX TODO
    Presumably this can be JSON data, but let's just handle the CSV situation for now
    @method /smile/iqset/:contentid
    @param q (optional) the question number.  Default is body will be 
    @param image (optional) 
**/
// js.post('/smile/iqset/:id', routes.handlePostIQSet, true);

/**
    Get the IQSet based on an existing :id.  If :id does not exist
    return { 'error': <Reason> }
**/
js.get('/smile/iqset/:id', routes.handleGetIQSet, true);

/**
    Post the IQSet as a CSV file or JSON IQSet, creating a new IQSet.  Duplicate posts will create
    new IDs.  Note, there is no dup detection.  

    Format for CSV is

    Teacher Name: <data>,
    Title: <data>,
    Group Name: <data>,
    question, choice1, choice2, choice3, choice4, has_image, answers, owner_name, owner_IP
    <data>, <data>, <data>, <data>, <data>, <data>, <data>, <data>, <data>

    for the JSON format, be sure to pass with Content-Type:
    applicaton/json; charset=UTF-8

    And document structure:
    {
    "ducktype": "iqsetdoc",
    "date": "2013-10-25T06:56:18.489Z",
    "title": "JAMsj Barracks Set 2013",
    "teachername": "Mrs. Parker",
    "groupname": "MLK Elementary Grade 5",
    "iqdata": [
        {
            "NAME": "teacher",
            "IP": "127.0.0.1",
            "Q": "question",
            "O1": "choice1",
            "O2": "choice2",
            "O3": "choice3",
            "O4": "choice4",
            "TYPE": "QUESTION",
            "A": "answers"
        },
        {
            "NAME": "teacher",
            "IP": "127.0.0.1",
            "Q": "How did internees NOT solve the problem of dirt and sand blowing in through the spaces between the floorboards and walls?",
            "O1": "They laid large tiles on the floors",
            "O2": "They laid linoleum over floorboards",
            "O3": "They stuffed toilet paper in the wall spaces",
            "O4": "They laid carpeting to cover the floor spaces",
            "TYPE": "QUESTION",
            "A": "1"
        },
        {
            "NAME": "teacher",
            "IP": "127.0.0.1",
            "Q": "What did the WRA NOT issue for each room in the barracks?",
            "O1": "Tables and chairs",
            "O2": "Metal Army cots (without mattresses) and at least two Army blankets per cot",
            "O3": "One heating stove",
            "O4": "One electric light",
            "TYPE": "QUESTION",
            "A": "1"
        }
    ]
}


    @method /smile/iqset
**/

/**
    Save a new iqset from teacher app
**/
js.put('/smile/iqset', routes.handlePostNewIQSet);
js.post('/smile/iqset', routes.handlePostNewIQSet);

/**
    Delete the IQSet based on an existing :id.  If :id does not exist
    return { 'error': <Reason> }
**/
js.delete('/smile/iqset/:id', routes.handleDeleteIQSet, true);

/**
    Get all the inquiry sets

    Returns all the IQSets
    @method /smile/iqset
**/
js.get('/smile/iqsets', routes.handleGetAllIQSets);
/* js.get("/smile/iqmanager", js.staticHandler("smile-iqmanager.html")); */

/**
    get question where :id =  username 

    not really good API design, this is misleading
**/
js.put('/smile/question/:id', routes.handlePushMessage, true);
js.post('/smile/question/:id', routes.handlePushMessage, true);
js.get('/smile/question/:id', routes.handleQuestionGet, true);

js.get('/smile/student', routes.handleStudentGetAll);
js.put('/smile/student', routes.handleStudentPut);
js.post('/smile/student', routes.handleStudentPut);
js.get('/smile/student/:id/status', routes.handleStudentStatusGet, true);
// Use this to get a decent results calculation
js.get('/smile/student/:id/result', routes.handleStudentResultsGet, true);

/**
    Get session results metadata
    @method /smile/results
**/
js.get('/smile/results', routes.handleResultsGet);

/**
    Get all session data for current session in a nice json object
    @method /smile/session/all
**/
js.get('/smile/session/current', routes.handleCurrentSessionDataGet );

/**
    Get all sessions (archived)
    @method /smile/sessions
**/
js.get('/smile/sessions', routes.handleAllSessionsGet );

/**
    Get all sessions (archived)
    @method /smile/session/:id
**/
js.get('/smile/session/:id', routes.handleSessionsGet, true);


/**
    Get session messages in an array
    @method /smile/all
**/
js.get('/smile/all', routes.handleAllMessagesGet);

/**
    XXX TODO: Add debug logging of the session state
    @method /smile/debugdump
 **/
js.get('/smile/debugdump', routes.handleAllMessagesGet);

/** 
    XXX TODO: Potentially useless routes ... should they return more than ok?
    @method /smile/
 **/
js.get('/smile', routes.handleSmileRootGet);
js.get('/smile/', routes.handleSmileRootGet);

js.get('/smile/reset', routes.handleResetGet);
js.put('/smile/reset', routes.handleResetPut);

/**
    Store session data
    XXX TODO Do we really want to expose this??? Shouldn't it be triggered by internal state?
    @method /smile/store
**/
js.put('/smile/store', routes.handleStore);
js.post('/smile/store', routes.handleStore);

/**
    Handle complete DB in couchdb export compatible
    XXX TODO I think we'll need to write a handler reload a PouchDB database from a doc dump.  Is it possible?
    What's the mechanism in couchdb to do the same?
    @method /smile/backup
**/
js.put('/smile/backup', routes.handleBackup);
js.post('/smile/backup', routes.handleBackup);
js.get('/smile/backup', routes.handleBackup);

js.put('/smile/upload/image', routes.handleImageUpload);
js.post('/smile/upload/image', routes.handleImageUpload);


js.get('/smile/view/sessionstats', routes.handleSessionStats, true); // XXX No regex?
js.get('/smile/view/monitoring.html', routes.handleMonitoringHtmlGet, true); // XXX No regex?

js.get('/smile/questionview/:id_result.html', routes.handleQuestionResultHtmlGet, true);
js.get('/smile/questionview/:id.html', routes.handleQuestionHtmlGet, true);
js.get('/smile/questionview/:id.json', routes.handleQuestionJSONGet, true);
js.delete('/smile/questionview/:id.json', routes.handleQuestionJSONDelete, true);
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
    'POST' : {},
    'DELETE': {}
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
    'POST' : {},
    'DELETE': {}
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
