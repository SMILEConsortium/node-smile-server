var question = exports;

var Questions = function Questions() {
  this.currentQuestions = {};
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
}

Questions.prototype.getQuestions = function getQuestions(name) {
  return this.currentQuestions[name];
}

Questions.prototype.getAll = function getAll() {
  return this.currentQuestions;
}

question.Questions = Questions;