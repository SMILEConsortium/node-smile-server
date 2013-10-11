var js = require('../js');
var sha1 = require('sha1');
var csv = require("csv");

var question = exports;

var Questions = function Questions() {
    this.currentQuestions = {};
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
 * in JSON format:
 *  see getAll()
 *
 **/
Questions.prototype.getList = function getList() {
    return this.listOfQuestions;
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

Questions.prototype.parseCSVtoIQSetObj = function parseCSVtoIQSetObj(csvData) {
    var iqset = this.getCommonIQSetObj();
    if (!csvData) {
        error = new Error("No questions to parse.");
        return {
            'error': 'No CSV Data Received'
        }; // XXX Need to return error
    }

    // console.log(csvData);
    // XXX We need some other guard here
    csvData.shift(); // Pop off the header row

    // 
    // At this point, we are not expecting a JSON object 
    // or real CSV data, but rather, an array of the data
    // XXX Need to sort this out, since our parse is async
    // And this is BRITTLE AS ALL GOODNESS ...
    // Add some error handling
    csvData.forEach(function(rawQuestion) {
        var question = {};
        question.NAME = "teacher"; // XXX This is a bummer, all questions load as teacher
        question.Q = rawQuestion[0];
        question.O1 = rawQuestion[1];
        question.O2 = rawQuestion[2];
        question.O3 = rawQuestion[3];
        question.O4 = rawQuestion[4];
        question.TYPE = rawQuestion[5] === "true" ? "QUESTION_PIC" : "QUESTION";
        question.A = rawQuestion[6].replace("choice", "");
        
        // XXX We need to handle error cases where data is not properly formed, otherwise, we'll 
        // mess up the running session
        iqset.iqdata.push(question);
    });

    return iqset;
};
question.Questions = Questions;