var question = exports;

var Questions = function Questions() {
  this.currentQuestions = {};
  this.numberOfQuestions = 0;
  this.listOfQuestions = [];
}

Questions.prototype.addQuestion = function addQuestion(question) {
  if (!question.NAME) {
    throw new Error('Question registration message must contain a valid NAME property.')
  }
  var questionUserName = this.currentQuestions[question.NAME]; 
  if (questionUserName) {
    questionUserName.push(question);
  } else {
    this.currentQuestions[question.NAME] = [question];
  }
  this.listOfQuestions.push(question);
  this.numberOfQuestions++;
}

Questions.prototype.getQuestions = function getQuestions(name) {
  return this.currentQuestions[name];
}

Questions.prototype.getAll = function getAll() {
  return this.currentQuestions;
}

Questions.prototype.getList = function getList() {
  return this.listOfQuestions;
}

Questions.prototype.getRightAnswers = function getRightAnswers() {
  var rightAnswers = [];
  var questions = this.getAll();
  for (var key in questions) {
    var questionArray = questions[key];
    for (var i in questionArray) {
      var question = questionArray[i];
      rightAnswers.push(question.A);
    }
  }
  return rightAnswers;
}

Questions.prototype.getAll = function getAll() {
  return this.currentQuestions;
}

Questions.prototype.getNumberOfQuestions = function getNumberOfQuestions() {
  return this.numberOfQuestions;
}

question.Questions = Questions;