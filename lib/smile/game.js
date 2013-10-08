var events = require('events');
var Questions = require('./question').Questions;
var Students = require('./student').Students;
var Student = require('./student').Student;
var StudentsWrapper = require('./student').StudentsWrapper;
var js = require('../js');

var game = exports;

var Game = function Game() {
    this.questions = new Questions();
    this.students = new Students();
    this.studentsWrapper = new StudentsWrapper(this.students);
    this.messages = {};
    this.messages.current = {};
    this.messages.past = [];
    this.questionRatings = {};
    this.questionCorrectCountMap = {};
    this.ratingMetadata = {
        1 : "Low Quality Question",
        2 : "Adequate Question",
        3 : "Average Question",
        4 : "Good Question",
        5 : "High Quality Question"
    };

};

Game.prototype.getRatingMetadata = function getRatingMetadata() {
    return this.ratingMetadata;
};

Game.prototype.setRatingMetadata = function setRatingMetadata(metadata) {
    for (var i = 1; i <= 5; i++) { // Makes sure we have only five ratings. It is a simple way to validate input.
        this.ratingMetadata[i] = metadata[i];
    }
};

Game.prototype.retake = function retake() {
    this.questionRatings = {};
    this.questionCorrectCountMap = {};
    for (var k in this.students.currentStudents) {
        this.students.currentStudents[k].retake();
    }
};

Game.prototype.setCurrentMessage = function setCurrentMessage(message) {
    this.messages.current = message;
    this.registerMessage(message);
};

Game.prototype.registerMessage = function registerMessage(message) {
    this.messages.past.push(message);
};

Game.prototype.getCurrentMessage = function getCurrentMessage() {
    return this.messages.current;
};

Game.prototype.addQuestion = function addQuestion(message) {
    if (message.NAME == 'teacher') {
        // We need to make sure student doesn't use teacher's name
        return this.questions.addQuestion(message);
    } else {
        // Let's reject anyone who doesn't have an IP address
        if (message.IP && this.students.hasStudent(message.IP)) {
            this.students.getStudent(message.IP).setMadeQuestion(true);
            console.log("trying do add question '" + message.Q + "' by IP " + message.IP);
            return this.questions.addQuestion(message);
        } else {
            return js.JumboError
                    .unexpected('The question provided refers to nonexistent student: ' + message.IP + ", name=" + message.NAME);
        }
    }
};

/**
 * isDupQuestion(message) - verify if a question message is a duplicate.
 *
 * Algorithm:
 * 1. Check if we have questions for users by this name
 * 2. For each question in list for this user, check if Question text matches
 *
 * returns:
 *      true if a duplicate
 *      false if not a duplicate
 *
 **/
Game.prototype.isDupQuestion = function isDupQuestion(message) {
    var name = message.NAME;
    if (name) {
        var messageHash = this.questions.createKeyFromQuestion(message);
        var qlist = this.questions.getList();
        var isDup = false;
        for ( var i = 0; i < qlist.length; i++) {
            isDup = messageHash === this.questions.createKeyFromQuestion(qlist[i]);
            if (isDup) {
                return true;
            }
        }
    }
    return false;
};

Game.prototype.registerAnswerByMessage = function registerAnswerByMessage(message) {
    var student = this.studentsWrapper.registerAnswer(message);
    if (student instanceof Error) {
        return student;
    }
    this.answerRegistered(student);
};

Game.prototype.registerAnswer = function registerAnswer(student, answers, ratings) {
    student.registerAnswers(answers);
    student.registerRatings(ratings);
    this.answerRegistered(student);
};

Game.prototype.answerRegistered = function answerRegistered(student) {
    this.calcScoreAndRating(student); // XXX Is this right???
};

Game.prototype.getQuestionAverageRating = function getAverageRating(questionIndex) {
    var ratings = this.questionRatings[questionIndex];
    var sum = 0;
    for ( var n in ratings) {
        sum += ratings[n];
    }
    return sum / ratings.length;
};

// XXX Clearly this needs work
Game.prototype.calcScoreAndRating = function calcScoreAndRating(student) {
    var studentScore = 0;
    var listOfQuestions = this.questions.getList();
    for ( var i = 0; i < listOfQuestions.length; i++) {
        var correctAnswer = parseInt(listOfQuestions[i].A, 10);
        var studentAnswer = student.getAnswer(i);
        var questionCorrectCountMap = this.questionCorrectCountMap;
        var currentQuestionCorrectCount = 0;
        if (questionCorrectCountMap.hasOwnProperty(i)) {
            currentQuestionCorrectCount = questionCorrectCountMap[i];
        }
        if (correctAnswer === parseInt(studentAnswer, 10)) {
            studentScore++;
            currentQuestionCorrectCount++;
        }
        questionCorrectCountMap[i] = currentQuestionCorrectCount;
        var studentRating = student.getRating(i);
        var questionRatingList = this.questionRatings[i] || [];
        questionRatingList.push(studentRating);
        this.questionRatings[i] = questionRatingList;
    }
    student.setScore(studentScore);
    return student;
};

Game.prototype.calcQuestionsCorrectPercentage = function calcQuestionsCorrectPercentage() {
    var percentages = [];
    var numberOfStudents = this.students.getNumberOfStudents();
    for (var key in this.questionCorrectCountMap) {
        var count = this.questionCorrectCountMap[key];
        percentages[key] = parseInt((count / numberOfStudents) * 100, 10);
    }
    return percentages;
};

Game.prototype.calculateResults = function calculateResults() {
    var listOfQuestions = this.questions.getList();
    var scoresMap = {};
    var winnerScore = 0;
    for (var key in this.students.getAll()) {
        var student = this.students.getStudent(key);
        var studentScore = student.getScore();
        if (winnerScore <= studentScore) {
            winnerScore = studentScore;
            if (winnerScore !== 0) {
                if (scoresMap.hasOwnProperty(studentScore)) {
                    scoresMap[studentScore].push(student.getName());
                } else {
                    scoresMap[studentScore] = [ student.getName() ];
                }
            }
        }
    }

    var winnerRating = 0;
    var ratingsMap = {};
    var averageRatings = [];
    for (key in this.questionRatings) {
        var question = listOfQuestions[key];
        var averageRating = this.getQuestionAverageRating(key);
        averageRatings.push(averageRating);
        if (winnerRating <= averageRating) {
            winnerRating = averageRating;
            if (ratingsMap.hasOwnProperty(averageRating)) {
                ratingsMap[averageRating].push(question.NAME);
            } else {
                ratingsMap[averageRating] = [ question.NAME ];
            }
        }
    }

    var result = new Result();
    result.winnerScore = winnerScore;
    result.bestScoredStudentNames = scoresMap[winnerScore];
    result.winnerRating = winnerRating;
    result.bestRatedQuestionStudentNames = ratingsMap[winnerRating];
    result.numberOfQuestions = this.questions.getNumberOfQuestions();
    result.rightAnswers = this.questions.getRightAnswers();
    result.averageRatings = averageRatings;
    result.questionsCorrectPercentage = this.calcQuestionsCorrectPercentage();
    return result;

};

Game.prototype.getSessionStats= function getSessionStats() {
    var numberOfStudentsAnswered = 0;
    var students = game.students.currentStudents;
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
    return { 
        "numberOfStudents" : game.students.numberOfStudents,
        "numberOfQuestions" : game.questions.numberOfQuestions,
        "numberOfStudentsPostingAnswers" : numberOfStudentsAnswered
    };
};
/* 

SessionData spec

{
    iqset: { <"all the questions" > },
    sessionstats: { <"all stats"> },
    students: { <"student { name, results } "> },
    results: { <"all results">},
    metadata: { <"all metadata"}
}
*/
Game.prototype.getAllSessionData = function getAllSessionData() {
    return {
        "iqset": game.questions.getAll(),
        "sessionstats": game.getSessionStats(),
        "students": game.students.getAll(),
        "results": game.calculateResults(),
        "metadata": game.getRatingMetadata()
    };
};

game.Game = Game;

var Result = function Result() {
    this.winnerScore = 0;
    this.winnerRating = 0;
    this.bestScoredStudentNames = [];
    this.bestRatedQuestionStudentNames = [];
    this.numberOfQuestions = 0;
    this.rightAnswers = [];
};
