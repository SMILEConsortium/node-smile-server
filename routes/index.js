var Game = require('../lib/smile/game').Game;
var Student = require('../lib/smile/student').Student;
var js = require('../lib/js');
var fs = require('fs');
var csv = require("csv");
var Persisteus = require('../lib/smile/persisteus').Persisteus;
var pdb = new Persisteus();

OK = 'OK';

HTTP_STATUS_OK = '200';

var MESSAGE_START_MAKE_QUESTION = {
    'TYPE' : 'START_MAKE'
};
var MESSAGE_WAIT_CONNECT = {
    'TYPE' : 'WAIT_CONNECT'
};

var game = new Game();

exports.handleQuestionGet = function(req, res) {
    var questions = game.questions.getQuestions(req.id);
    if (questions instanceof Error) {
        res.handleError(questions);
    } else {
        return res.sendJSON(HTTP_STATUS_OK, questions);
    }
};

/**
    @method storeData

    Used to save JSON data to the FS under <root>/storage/<date>.

    This isn't completely useful, but we'll keep it around for historical value, and will use it to backup
    our DB.
**/
function storeData(obj) {
    var json = JSON.stringify(obj);
    var filename = __dirname + "/../storage/" + new Date().toISOString();
    fs.writeFile(filename, json, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("The file was saved in: " + filename);
        }
    });
}

exports.handleStore = function(req, res) {
    storeData(req.body);
    return res.sendText(HTTP_STATUS_OK, OK);
};

exports.handleBackup = function(req, res) {
    storeData(game.messages.past);
    return res.sendText(HTTP_STATUS_OK, OK);
};

exports.handleGetAllIQSets = function(req, res) {
    //
    // Ideally we'd be getting parameters of the incoming request
    //
    pdb.getAllIQSets(null, null, null, function(err, result) {
        if (err) {
            return res.sendJSON(HTTP_STATUS_OK, {
                'error': 'Unable to fetch IQSets'
            });
        } else {
            res.sendJSON(HTTP_STATUS_OK, result);
        }
    });
};

exports.handleGetIQSet = function(req, res) {
    //
    // Ideally we'd be getting parameters of the incoming request
    //
    if (!req.id) {
        return res.sendJSON(HTTP_STATUS_OK, {
                'error': 'ID missing from request'
            });
    }

    pdb.getIQSet(req.id, {}, function(err, result) {
        res.sendJSON(HTTP_STATUS_OK, result);
    });
};

exports.handleDeleteIQSet = function(req, res) {
    //
    // Ideally we'd be getting parameters of the incoming request
    //
    if (!req.id) {
        return res.sendJSON(HTTP_STATUS_OK, {
                'error': 'ID missing from request'
            });
    }

    pdb.getIQSet(req.id, {}, function(err, result) {
        pdb.deleteIQSet(result, {}, function(err, result) {
            if (err) {
                res.sendJSON(HTTP_STATUS_OK, err);
            }
            res.sendJSON(HTTP_STATUS_OK, result);
        });
    });
};


/**
    Save a new iqset from teacher app
**/
exports.handlePostNewIQSet = function(req, res) {
    
    console.log("\n\n[BODY of json request]");
    console.log("\t>> %j\n", req.body);
    console.log("[HEADERS of json request]");
    console.log("\t>> %j\n\n", req.headers);

    var headers = req.headers;
    var iqset;

    if (headers['content-type'] === 'application/json; charset=UTF-8') {	
        console.log('Handle post of iqset from json');
        //
        // Handle the upload from JSON
        //
        var queryData;
        var isValid = true;
        if ((req.method == 'POST') || (req.method == 'PUT')) {
            iqset = req.body;
        }

        if (!iqset.title) {
            // iqset.title = iqdoc.date + "-IQSet";
        }

        if (!iqset.teachername) {
            // iqset.teachername = "Teacher";
        }

        if (!iqset.groupname) {
            // iqset.groupname = "General";
        }

        if (!iqset.iqdata) {
            isValid = false;
        }

        if (isValid === true) {
            //
            // Quickly pre-process the iqsets to inject the PIC and reorder the PICURL if it exists
            //
            for (var i = 0; i < iqset.iqdata.length; i++) {
                // Is it a PICURL?
                console.log("Question TYPE = " + iqset.iqdata[i].TYPE);
                if (iqset.iqdata[i].TYPE === "QUESTION_PIC") {
                    //
                    // PICURL
                    // 1. Get the original index of the image
                    // 2. Change the PICURL to match the new index 
                    //
                    
                    if (iqset.iqdata[i].PICURL) {
                        // /smile/questionview/1.jpg
                        var tmpidx = parseInt(iqset.iqdata[i].PICURL.split('/')[3].split('.')[0], 10);
                        console.log("Handle PIC data at tmpidx = " + tmpidx);
                        // console.log(game.questions.getList());
                        iqset.iqdata[i].PIC = game.questions.getQuestionPicture(tmpidx);
                        iqset.iqdata[i].PICURL = '/smile/questionview/' + tmpidx + '.jpg';
                        console.log("New PICURL = " + iqset.iqdata[i].PICURL);
                        // console.log(iqset.iqdata[i].PIC);
                    }
                }
            }
            console.log('IQSet is valid, commit');
            pdb.putIQSet(iqset, function(err, result) {
                if (!err) {
                    iqset.success = true;
                    return res.sendJSON(HTTP_STATUS_OK, iqset);
                } else {
                    return res.sendJSON(HTTP_STATUS_OK, {
                        'error': 'Unable to persist IQSet data',
                        'success': false
                    });
                }
            });

            
            
        } else {
            console.log('IQSet is not valid, don\'t persist');
            return res.sendJSON(HTTP_STATUS_OK, {
            'error': 'Unable to persist IQSet data, missing IQSet iqdata',
            'success': false
            });
        }
    } else {
        // XXX We wrongly assume this was a CSV upload, need to verify the submission is multipart/mime
        var file = req.file;
        var csvData = fs.readFileSync(file.path, 'utf8');
        csv().from.string(csvData, {comment: '#'} ).to.array( function(data){
            // console.log(data);
            iqset = game.questions.parseCSVtoIQSetObj(data);
            console.log(iqset);
            //
            // Per Fineuploader spec, add the right handler response messages for success/failure
            // http://docs.fineuploader.com/branccharset=UTF-8h/master/endpoint_handlers/traditional.html
            //
            //
            if (iqset.error) {
                console.debug('Error parsing CSV, reason: ' + iqset.error);
                return res.sendJSON(HTTP_STATUS_OK, {
                            'error': 'Error parsing CSV, reason: ' + iqset.error,
                            'success': false
                        });
            } else {
                pdb.putIQSet(iqset, function(err, result) {
                    if (!err) {
                        iqset.success = true;
                        return res.sendJSON(HTTP_STATUS_OK, iqset);
                    } else {
                        return res.sendJSON(HTTP_STATUS_OK, {
                            'error': 'Unable to persist IQSet data',
                            'success': false
                        });
                    }
                });
            }
        }).on('error', function(error){
            console.error(error.message);
            return res.sendJSON(HTTP_STATUS_OK, {
                'error': error.message,
                'success': false
            });
        });
    }
};

exports.handleImageUpload = function(req, res) {
    var file = req.file;
    var imageData = fs.readFileSync(file.path, 'binary');
    var base64data = new Buffer(imageData, 'binary').toString('base64');
    var data = {};
    data.success = "true";
    data.base64 = base64data;
    return res.sendJSON(HTTP_STATUS_OK, data);
};

exports.handleRatingMetadataPut = function(req, res) {
    game.setRatingMetadata(req.body);
    return res.sendText(HTTP_STATUS_OK, OK);
};

exports.handleRatingMetadataGet = function(req, res) {
    return res.sendJSON(HTTP_STATUS_OK, game.getRatingMetadata());
};

exports.handleQuestionGetAll = function(req, res) {
    return res.sendJSON(HTTP_STATUS_OK, game.questions.getAll());
};

exports.handleCurrentMessageGet = function(req, res) {
    return res.sendJSON(HTTP_STATUS_OK, game.getCurrentMessage());
};

exports.handleCurrentMessagePut = function(req, res) {
    game.setCurrentMessage(req.body);
    return res.sendText(HTTP_STATUS_OK, OK);
};

exports.handleSmileRootGet = function(req, res) {
    return res.sendText(HTTP_STATUS_OK, OK);
};

exports.handleStartMakeQuestionPut = function(req, res) {
    game.setCurrentMessage(MESSAGE_START_MAKE_QUESTION);

    //
    // Extract Teacher specific Sesssion Data
    //
    // teacherName : <Any text or numerical name>
    // sessionName : <Any text or numerical name>
    // groupName   : <Any text or numerical name>
    //
    var teacherMeta = null;
    var queryData;
    if ((req.method == 'POST') || (req.method == 'PUT')) {
        req.on('data', function(data) {
            queryData += data;
            if(queryData.length > 1e6) {
                queryData = "";
                res.writeHead(413, {'Content-Type': 'text/plain'}).end();
                req.connection.destroy();
            }
        });

        req.on('end', function() {
            teacherMeta = querystring.parse(queryData);
        });
    }

    if (game.teacherName === null || game.sessionName === null || game.groupName === null) {
        
        if (teacherMeta === null || teacherMeta === "") {
            // XXX TODO: Put our defaults somewhere
                game.teacherName = "Teacher";
                game.sessionName = "IQ Session " + new Date().toISOString();
                game.groupName = "IQ Group";
        } else {
            console.log("TeacherMeta: " + teacherMeta);
            // Validate our data or supply defaults
            if (!teacherMeta.teacherName) {
                game.teacherName = "Teacher";
            } else {
                game.teacherName = teacherMeta.teacherName;
            }

            if (!teacherMeta.sessionName) {
                game.sessionName = "IQ Session " + new Date().toISOString();
            } else {
                game.sessionName = teacherMeta.sessionName;
            }

            if (!teacherMeta.groupName) {
                game.groupName = "IQ Group";
            } else {
                game.groupName = teacherMeta.groupName;
            }
        }
    }    
    return res.sendText(HTTP_STATUS_OK, OK);
};

exports.handleSendInitMessagePut = function(req, res) {
    game.setCurrentMessage(MESSAGE_WAIT_CONNECT);
    return res.sendText(HTTP_STATUS_OK, OK);
};

exports.handleStudentGetAll = function(req, res) {
    return res.sendJSON(HTTP_STATUS_OK, game.students.getAll());
};

exports.handleStudentResultsGet = function(req, res) {
    var studentStatus = game.studentsWrapper.getStudentStatus(req.id, game.questions.getNumberOfQuestions());
    var rightAnswers = game.questions.getRightAnswers();
    var myAnswers;
    var RIGHT = 1;
    var WRONG = 0;
    if (studentStatus instanceof Error) {
        res.handleError(studentStatus);
    } else {
        // Augment data with right answers
        studentStatus.RIGHT_ANSWERS = rightAnswers;
        studentStatus.ANSWER_SCORING = [];
        studentStatus.NUM_RIGHT = 0;
        studentStatus.SCORE_AS_PERCENTAGE = 0;
        if (studentStatus.SOLVED === "Y") {
            myAnswers = studentStatus.YOUR_ANSWERS;
            if (myAnswers) {
                // Be careful to only check scores against the total # answered
                for ( var i = 0; i < myAnswers.length; i++) {
                    if (rightAnswers[i] == myAnswers[i]) {
                        studentStatus.ANSWER_SCORING[i] = RIGHT;
                        studentStatus.NUM_RIGHT = studentStatus.NUM_RIGHT + 1;
                    } else {
                        studentStatus.ANSWER_SCORING[i] = WRONG;
                    }
                }

                // Make sure to escape the data
                studentStatus.SCORE_AS_PERCENTAGE = JSON.stringify(studentStatus.NUM_RIGHT / studentStatus.NUMQ);
                studentStatus.NUM_RIGHT = JSON.stringify(studentStatus.NUM_RIGHT);
            }
        }
        return res.sendJSON(HTTP_STATUS_OK, studentStatus);
    }
};

exports.handleStartSolveQuestionPut = function(req, res) {
    var timeLimit = 10; // The same time limit of old implementation.
    if (req.body.TIME_LIMIT) {
        timeLimit = req.body.TIME_LIMIT;
    }
    var numberOfQuestions = game.questions.getNumberOfQuestions();
    var rightAnswers = game.questions.getRightAnswers();
    var message = {};
    message.TYPE = 'START_SOLVE';
    message.NUMQ = numberOfQuestions;
    message.RANSWER = rightAnswers;
    message.TIME_LIMIT = timeLimit;

    game.setCurrentMessage(message);
    return res.sendText(HTTP_STATUS_OK, OK);
};

exports.handleStudentStatusGet = function(req, res) {
    var studentStatus = game.students.getStudentStatus(req.id);
    if (studentStatus instanceof Error) {
        res.handleError(studentStatus);
    } else {
        return res.sendJSON(HTTP_STATUS_OK, studentStatus);
    }
};

exports.handleStudentPut = function(req, res) {
    var message = req.body;
    var student = new Student(message.name, message.ip);
    game.students.addStudent(student);
    return res.sendText(HTTP_STATUS_OK, OK);
};

exports.handleResultsGet = function(req, res) {
    var results = game.calculateResults();
    
    return res.sendJSON(HTTP_STATUS_OK, results);
};

exports.handleSendShowResultsPut = function(req, res) {
    var result = game.calculateResults();
    var message = {};
    message.TYPE = 'START_SHOW';
    message.WINSCORE = result.bestScoredStudentNames;
    message.WINRATING = result.bestRatedQuestionStudentNames;
    message.HIGHSCORE = result.winnerScore;
    message.HIGHRATING = result.winnerRating;
    message.NUMQ = result.numberOfQuestions;
    message.RANSWER = result.rightAnswers;
    message.AVG_RATINGS = result.averageRatings;
    message.RPERCENT = result.questionsCorrectPercentage;
    if (!game.resultsSaved) {
        console.log("About to store session");
        pdb.putSession(game.getAllSessionData(), function(err, result) {
            if (err) { // XXX TODO: Add in logger instead of console logging
                console.err(err);
            } else {
                console.log('Stored session successfully');
                console.log(result);
                game.resultsSaved = true;
            }
        });
    }
    game.setCurrentMessage(message);
    return res.sendText(HTTP_STATUS_OK, OK);
};

exports.handleCurrentSessionDataGet = function(req, res) {
    return res.sendJSON(HTTP_STATUS_OK, game.getAllSessionData());
};

exports.handleAllSessionsGet = function(req, res) {
    pdb.getAllSessions(null, null, null, function(err, result) {
        if (err) {
            return res.sendJSON(HTTP_STATUS_OK, {
                error: 'Unable to get all sessions'
            });
        } else {
            return res.sendJSON(HTTP_STATUS_OK, result);
        }
    });
};

exports.handleSessionsGet = function(req, res) {
    //
    // Ideally we'd be getting parameters of the incoming request
    //
    if (!req.id) {
        return res.sendJSON(HTTP_STATUS_OK, {
                'error': 'ID missing from request'
            });
    }

    pdb.getSession(req.id, {}, function(err, result) {
        res.sendJSON(HTTP_STATUS_OK, result);
    });
};

exports.handleAllMessagesGet = function(req, res) {
    return res.sendJSON(HTTP_STATUS_OK, game.messages.past);
};

reset = function() {
    oldGame = game;
    game = new Game(); // XXX Point to ponder, do we need to save before we destroy the server?
    game.setCurrentMessage({ TYPE: 'RESET' , TIMESTAMP: (new Date()).toUTCString(), EXPIRY: 1500});
    setTimeout(function() {
        console.log("Remove RESET");
        game.setCurrentMessage({});
    }, 2000);
};

exports.handleResetGet = function(req, res) {
    reset();
    return res.sendText(HTTP_STATUS_OK, OK);
};

exports.handleResetPut = function(req, res) {
    reset();
    return res.sendText(HTTP_STATUS_OK, OK);
};

exports.handleCsvPushQuestions = function(req, res) {
    var rawQuestions = req.body;
    if (!rawQuestions) {
        error = new Error("No questions to parse.");
        return res.handleError(error);
    }

    rawQuestions.forEach(function(rawQuestion) {
        var question = {};
        question.NAME = "teacher";
        question.Q = rawQuestion.question;
        question.O1 = rawQuestion.choice1;
        question.O2 = rawQuestion.choice2;
        question.O3 = rawQuestion.choice3;
        question.O4 = rawQuestion.choice4;
        question.A = rawQuestion.answers.replace("choice", "");
        question.TYPE = rawQuestion.has_image === "true" ? "QUESTION_PIC" : "QUESTION";
        game.addQuestion(question);
    });
    return res.sendText(HTTP_STATUS_OK, OK);
};

//
// Backward compatibility
//

exports.handlePushMessage = function(req, res) {
    var message = req.body;
    game.registerMessage(message);
    var type = message.TYPE || null;
    if (type.indexOf("RE_TAKE") != -1) { // XXX What the heck is this?
        type = 'RE_TAKE';
    }
    // console.log(message);
    var error = null;
    switch (type) {
    case null:
        // Ignoring the message does not have a type
        console.warn("Unrecognized type: " + type);
        break;
    case 'QUESTION':
        error = game.addQuestion(message);
        break;
    case 'QUESTION_PIC':
        error = game.addQuestion(message);
        break;
    case 'ANSWER':
        error = game.registerAnswerByMessage(message);
        break;
    case 'HAIL':
        error = game.studentsWrapper.addStudent(message);
        break;
    case 'RE_TAKE':
        game.setCurrentMessage(message);
        error = game.retake();
        break;
    case 'RESET':
        game.setCurrentMessage({ TYPE: 'RESET'});
        break;
    default:
        error = new Error("Unrecognized type: " + type);
        break;
    }
    if (error) {
        // Something wrong happened
        return res.handleError(error);
    } else {
        if (req.id) {
            var msg = "This server does not support question update. The question you sent has been added to: " + req.id;
            return res.sendText(HTTP_STATUS_OK, msg);
        } else {
            return res.sendText(HTTP_STATUS_OK, OK);
        }
    }
};

/**
	Creating a session with teacher name, session title, and group name
**/
exports.createSessionFromTeacherApp = function(req, res) {

    try {
        // console.log('\n## JSON from "createSessionFromTeacherApp" ##');
        console.log('\n\t>> %j', req.body);
        console.log('\t>> '+req.body.teacherName);
        console.log('\t>> '+req.body.sessionName);
        console.log('\t>> '+req.body.groupName+'\n');

        if (req.body.teacherName) {
            game.teacherName = req.body.teacherName;
        }

        if (req.body.sessionName) {
            game.sessionName = req.body.sessionName;
        }

        if (req.body.groupName) {
            game.groupName = req.body.groupName;
        }
    } catch (e) {
        res.handleError("Can't parse Incoming JSON in createSessionFromTeacherApp method");
    }

    return res.sendText(HTTP_STATUS_OK, OK);
};

exports.handlePushMsgPost = function(req, res) {
    var message = req.body.MSG;
    try {
        req.body = JSON.parse(message);
        exports.handlePushMessage(req, res);
    } catch (e) {
        res.handleError("Can't parse Incoming JSON");
    }
};

exports.handleStudentStatusGetByIP = function(req, res) {
    var studentStatus = game.studentsWrapper.getStudentStatus(req.id, game.questions.getNumberOfQuestions());
    if (studentStatus instanceof Error) {
        res.handleError(studentStatus);
    } else {
        return res.sendJSON(HTTP_STATUS_OK, studentStatus);
    }
};

exports.handleSessionStats = function(req, res) {
    return res.sendJSON(HTTP_STATUS_OK, game.getSessionStats());
};

exports.handleMonitoringHtmlGet = function(req, res) {
    //    # of students
    //    Each student name + IP address
    //    Highlight in red self assigned IP, and duplicates
    //    # of questions submitted
    //    # of students who has answered questions
    var numberOfStudents = game.students.numberOfStudents;
    var students = game.students.currentStudents;
    var numberOfQuestions = game.questions.numberOfQuestions;
    var numberOfStudentsAnswered = 0;

    res.writeHead(200, {
        'Content-Type' : 'text/html; charset=utf-8',
    });
    res.write("<html>\n<head><title>SMILE Server Monitoring Tool</title></head>\n<body>\n");
    res.write("<p>Number of students: " + numberOfStudents + "</p>\n");
    res.write("<p>Number of questions: " + numberOfQuestions + "</p>\n");

    res.write("<table border=\"1\"><thead><th>Student Name</th><th>Student IP</th></thead><tbody>\n");
    var ipMap = {};
    for ( var k in students) {
        student = students[k];
        name = student.name;
        ip = student.ip;
        if (ipMap.hasOwnProperty(ip)) {
            ipMap[ip].push(name);
        } else {
            ipMap[ip] = [ name ];
        }
        if (student.getStatus().solved) {
            numberOfStudentsAnswered++;
        }
    }
    for ( var key in students) {
        var student = students[key];
        var name = student.name;
        var ip = student.ip;
        var color = ip.indexOf("169.254") != -1 || ipMap[ip].length > 1 ? "red" : "green";
        res.write("<tr><td>" + name + "</td><td style=\"color: " + color + "\">" + ip + "</td></tr>\n");
    }

    res.write("</tbody></table>\n");

    res.write("<p>Number of students who has answered questions: " + numberOfStudentsAnswered + "</p>\n");
    res.write("</body></html>\n");
    res.end();
};

exports.handleQuestionHtmlGet = function(req, res) {
    var questionNumber = parseInt(req.id, 10);
    var question = game.questions.getList()[questionNumber];
    if (!question) {
        return res.handleError(js.JumboError.notFound('Question not found: ' + questionNumber));
    }
    var studentName = question.NAME; // XXX
    res.writeHead(200, {
        'Content-Type' : 'text/html; charset=utf-8',
    });
	
	// Preparing values for solving questions screen
	var json_solving_questions = {
		questionNum: (questionNumber + 1),
		author: studentName,
		question: question.Q,
		questionType: question.TYPE,
		picturePath: '/smile/current/'+questionNumber+".jpg", 
		option1: question.O1,
		option2: question.O2,
		option3: question.O3,
		option4: question.O4
	};

	var solving_questions = JSON.stringify(json_solving_questions);

	var headers = {
		'Content-Type': 'application/json',
		'Content-Length': solving_questions.length
	};

	var options = {
		host: 'localhost',
		port: 80,
		path: '/smile/current/'+questionNumber+'.html',
		method: 'POST',
		headers: headers
	};
	
// Setup the request.  The options parameter is the object defined above.
var http = require('http');
req = http.request(options, function(res) {
  res.setEncoding('utf-8');

  var responseString = '';

  res.on('data', function(data) {
    responseString += data;
  });

  res.on('end', function() {
    var resultObject = JSON.parse(responseString);
  });
});

req.on('error', function(e) {
  // TODO: handle error.
});

console.log('JSON request ==> '+solving_questions);

res.write(solving_questions);
    res.end();
};

exports.handleQuestionJSONGet = function(req, res) {
    var questionNumber = parseInt(req.id, 10);
    var question = game.questions.getList()[questionNumber];
    if (!question) {
        return res.sendJSON(HTTP_STATUS_OK, {'error': 'Question not found: ' + questionNumber});
    }

    res.sendJSON(HTTP_STATUS_OK, question);
};
exports.handleQuestionJSONDelete = function(req, res) {
    var questionNumber = parseInt(req.id, 10);
    var question = game.questions.getList()[questionNumber];

    //
    // Is the Question ID existing
    //
    if (!question) {
        console.log("no question found matching ID = " + req.id);
        return res.sendJSON(HTTP_STATUS_OK, {'error': 'Cannot find question matching ID, cannot delete'
        });
    } else {
        console.log("Attempting to delete question #" + questionNumber);
    }

    //
    // Is it Make Questions State?
    //
    if (game.getCurrentMessage().TYPE !== "START_MAKE") {
        console.log("Can only delete in START_MAKE, current phase: " + game.getCurrentMessage().TYPE);
        return res.sendJSON(HTTP_STATUS_OK, {'error': 'Can only delete a question during START_MAKE phase'
        });
    }

    //
    // Handle deletion
    //
    var status = game.questions.deleteQuestion(questionNumber);

    console.log(status);

    // Verify we get back an SessionID of the deleted question
    if (status !== 0) {
        var msgs = game.messages.past;

        for (var i = 0; i < msgs.length; i++) {
            if ((msgs[i].SessionID !== undefined) && (msgs[i].SessionID === status.SessionID) ){
                console.log("Deleting question from game.messages.past with SessionID = " + status.SessionID);
                game.messages.past.splice(i, 1); // Delete the question from the ghost of messages past
            }
        }
    }
    res.sendJSON(HTTP_STATUS_OK, {'status': status});
};

exports.handleQuestionImageGet = function(req, res) {
    var questionNumber = parseInt(req.id, 10);
    var question = game.questions.getList()[questionNumber];
    if (!question) {
        return res.handleError(js.JumboError.notFound('Question not found: ' + questionNumber));
    }
    if (question.TYPE != "QUESTION_PIC") {
        return res.handleError(js.JumboError.notFound('Question does not have picture: ' + questionNumber));
    }
    var dataBuffer = new Buffer(game.questions.getQuestionPicture(questionNumber), 'base64');
    res.writeHead(200, {
        'Content-Type' : 'image/jpeg',
    });
    res.write(dataBuffer);
    res.end();
};

exports.handleQuestionResultHtmlGet = function(req, res) {
    var questionNumber = parseInt(req.id, 10);
    var question = game.questions.getList()[questionNumber];
    if (!question) {
        return res.handleError(js.JumboError.notFound('Question not found: ' + questionNumber));
    }
    var studentName = question.NAME; // XXX
    res.writeHead(200, {
        'Content-Type' : 'text/html; charset=utf-8',
    });
	
	
	// Preparing values for detailresult.xml	
	var detail_result = {
		questionNum: (questionNumber + 1),
		author: studentName,
		question: question.Q,
		questionType: question.TYPE,
		picturePath: '/smile/current/'+questionNumber+".jpg", 
		answer: question.A,
		option1: question.O1,
		option2: question.O2,
		option3: question.O3,
		option4: question.O4,
		numCorrectPeople: game.questionCorrectCountMap[questionNumber],
		numberOfStudents: game.students.getNumberOfStudents(),
		averageRating: game.getQuestionAverageRating(questionNumber) 
	};

	var detail_resultString = JSON.stringify(detail_result);

	var headers = {
		'Content-Type': 'application/json',
		'Content-Length': detail_resultString.length
	};

	var options = {
		host: 'localhost',
		port: 80,
		path: '/smile/current/'+questionNumber+'_result.html',
		method: 'POST',
		headers: headers
	};
	
// Setup the request.  The options parameter is the object defined above.
var http = require('http');
req = http.request(options, function(res) {
  res.setEncoding('utf-8');

  var responseString = '';

  res.on('data', function(data) {
    responseString += data;
  });

  res.on('end', function() {
    var resultObject = JSON.parse(responseString);
  });
});

req.on('error', function(e) {
  // TODO: handle error.
});

// XXX What is this for??
console.log('JSON request ==> '+detail_resultString);
	res.write(detail_resultString);
    res.end();
};

// Attribution: https://gist.github.com/1626318
exports.handleEchoClientIP = function(req, res) {

    var clientip = null;
    clientip = req.headers['x-forwarded-for'];
    if (clientip) {
        clientip.split(',');
        clientip = clientip[0];
    } else {
        clientip = req.connection.remoteAddress;
    }
    if (!clientip) {
        clientip = '127.0.0.1';
    }
    console.log('received ping from ' + clientip);
    return res.sendJSON(HTTP_STATUS_OK, {
        'ip' : clientip
    });
};
