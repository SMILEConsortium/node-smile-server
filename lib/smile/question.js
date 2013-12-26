var js = require('../js');
var sha1 = require('sha1');
var csv = require("csv");

var question = exports;

var Questions = function Questions() {
    this.currentQuestions = {}; // XXX This is completely not named correctly, it has other messages in it besides questions
    this.numberOfQuestions = 0;
    this.listOfQuestions = [];
    this.listOfQuestionPictures = {};
    this.questionHashes = {};
};

Questions.prototype.createKeyFromQuestion = function createKeyFromQuestion(question) {
    var keyProperties = [ "Q", "O1", "O2", "O3", "O4", "A" ];
    var keySuffixComponents = "";
    for ( var property in keyProperties) {
        keySuffixComponents += question[keyProperties[property]];
    }

    return question.NAME + "-" + sha1(keySuffixComponents);
};

Questions.prototype.addQuestion = function addQuestion(question) {
    if (!question.NAME) {
        return js.JumboError.unexpected('Question registration message must contain a valid NAME property.');
    }
    var userKey = question.NAME;
    if (!this.currentQuestions[userKey]) {
        this.currentQuestions[userKey] = [];
    }

    var questionKey = this.createKeyFromQuestion(question);
    var existentQuestion = this.questionHashes[questionKey];
    if (existentQuestion) {
        js.error("WARNING: Ignoring duplicated question: " + question.Q + " (" + questionKey + ").");
    } else {
        if (question.PIC) {
            var questionNumber = this.listOfQuestions.length;
            question.PICURL = '/smile/questionview/' + questionNumber + '.jpg';
            this.listOfQuestionPictures[questionNumber] = question.PIC;
            delete question.PIC;
        }
        this.questionHashes[questionKey] = true;
        this.currentQuestions[userKey].push(question);
        this.listOfQuestions.push(question);
        this.numberOfQuestions++;
    }

    if (!question.SessionID) {
        question.SessionID = questionKey;
    }
};

Questions.prototype.getQuestionPicture = function(questionNumber) {
    return this.listOfQuestionPictures[questionNumber];
};

/**
 *
 * getQuestions(name) - returns array list of questions by username
 *
 * Where array list of questions by user consists of questions
 * in JSON format:
 *  see getAll()
 *
 **/
Questions.prototype.getQuestions = function getQuestions(name) {
    var questions = this.currentQuestions[name];
    if (!questions) {
        return js.JumboError.notFound('There are no questions associated with: ' + name);
    }
    return questions;
};

/**
 *
 * getAll() - return JSON object containing all questions indexed by username
 *
 * returns:
 *        { username: [array list of questions by user],
 *          username2: [array list of questions by user],
 *          ...
 *          usernameN: [array list of questions by user]}
 *
 * Where array list of questions by user consists of questions
 * in JSON format:
 *
 * {
 * "NAME" : "test",
 * "Q" : "qwerty",
 * "PIC" : "foo"
 * "A" : "3",
 * "IP" : '10.0.2.14',
 * "O4" : "r",
 * "O3" : "e",
 * "O2" : "w",
 * "O1" : "q",
 * "TYPE" : 'QUESTION_PIC'
 * }
 *
 **/
Questions.prototype.getAll = function getAll() {
    return this.currentQuestions;
};

/**
 * getList() - returns array list of all questions
 * Where array list of questions by user consists of questions
 * 
 *  see also, getAll() for JSON format
 *
 **/
Questions.prototype.getList = function getList() {
    return this.listOfQuestions;
};

/**
 * deleteQuestion(idx) - Deletes the question item at idx
 * returns the deleted question or 0 if none
 * XXX Eventually we should delete the items, just change the status
 **/
Questions.prototype.deleteQuestion = function deleteQuestion(idx) {
    var qdata;

    if (idx === null && idx === undefined) {
        console.log("Delete Question failed, idx is not set");
        return 0;
    }

    if (idx >= this.listOfQuestions.length) {
        console.warn("Deleting index out of bounds, ignoring");
        return 0;
    }

    if (idx < 0) {
        console("Delete Question failed, idx is negative");
        return 0;
    }

    // XXX We should validate whether idx is an int
    // this.questionHashes.splice(idx, 1);
    
    // XXX We need to maybe remove a students questions, but we aren't passing that info ... save this for later
    // this.currentQuestions[userKey].push(question);
    this.numberOfQuestions--;
    
    //
    // Get a copy of the question to delete
    //
    qdata = this.listOfQuestions[idx];
    //
    // Handle listOfQuestions array
    //
    this.listOfQuestions.splice(idx, 1);

    //
    // remove the question from the currentQuestions
    //
    for (var userkey in this.currentQuestions) {
        if (this.currentQuestions.hasOwnProperty(userkey)) {
            var userQs = this.currentQuestions[userkey];
            for (var i = 0; i < userQs.length; i++) {
                console.log("Try to match currentQuestions for deletion: SessionID = " + qdata.SessionID);
                if (userQs[i].SessionID === qdata.SessionID) {
                    console.log("Deleting question from currentQuestions matching SessionID = " + qdata.SessionID);
                    delstatus = this.currentQuestions[userkey].splice(i, 1); // Drop the deleted question
                    return qdata;
                }
            }
        }
    }
    return 0;
};


Questions.prototype.getRightAnswers = function getRightAnswers() {
    var rightAnswers = [];
    var questions = this.listOfQuestions;
    for ( var key in questions) {
        var question = questions[key];
        rightAnswers.push(parseInt(question.A, 10));
    }
    return rightAnswers;
};

Questions.prototype.getNumberOfQuestions = function getNumberOfQuestions() {
    return this.numberOfQuestions;
};

Questions.prototype.getCommonIQSetObj = function getCommonIQSetObj() {
    var dt = new Date().toISOString();
    return {
        'ducktype': 'iqsetdoc',
        'date': dt,
        'title': dt + '-IQSet',
        'teachername': 'Teacher',
        'groupname': 'General',
        'iqdata': []
    };
};

/**

    @method parseCSVtoIQSetObj

    Header info (first four rows) must include:


    Teacher:    Joe Tay                         
    Title:  JAMSj Resistance Set 2013                           
    Group Name: MLK Elementary Grade 5                          
    question    choice1 choice2 choice3 choice4 has_image   answers owner_name  owner_IP

**/
Questions.prototype.parseCSVtoIQSetObj = function parseCSVtoIQSetObj(csvData) {
    var iqset = this.getCommonIQSetObj();
    var teachername = null;
    var title = null;
    var groupname = null;

    if (!csvData) {
        error = new Error("No questions to parse.");
        return {
            'error': 'No CSV Data Received'
        }; // XXX Need to return error
    }

    // console.log(csvData);
    // XXX We need some other guard here
    // If this is not an Array, we will throw exception
    
    //
    // Header: Teacher Name:
    // XXX TODO: Guard against missing fields
    teachername = csvData.shift();
    iqset.teachername = teachername[1];
    title = csvData.shift();
    iqset.title = title[1];
    groupname = csvData.shift();
    iqset.groupname = groupname[1];
    csvData.shift(); // Drop the header row

    // 
    // At this point, we are not expecting a JSON object 
    // or real CSV data, but rather, an array of the data
    // XXX Need to sort this out, since our parse is async
    // And this is BRITTLE AS ALL GOODNESS ...
    // Add some error handling
    //

    csvData.forEach(function(rawQuestion) {
        console.log(rawQuestion);
        var question = {};
        question.NAME = "teacher"; // XXX This is a bummer, all questions load as teacher
        question.IP = "127.0.0.1"; // XXX Another unfortunate design choice, we must only be localhost IP address for CSV upload
        question.Q = rawQuestion[0];
        question.O1 = rawQuestion[1];
        question.O2 = rawQuestion[2];
        question.O3 = rawQuestion[3];
        question.O4 = rawQuestion[4];
        question.TYPE = rawQuestion[5] === "true" ? "QUESTION_PIC" : "QUESTION";
        question.A = rawQuestion[6].replace("choice", "");
        
        // XXX We need to handle error cases where data is not properly formed, otherwise, we'll 
        // mess up the running session
        if (!question.Q || !question.O1 || !question.O2 || !question.O3 || !question.O4 || !question.TYPE || !question.A) {
            console.log("Skipping csv data, incomplete/malformed row");
        } else {
            iqset.iqdata.push(question);
        }
    });

    return iqset;
};
question.Questions = Questions;