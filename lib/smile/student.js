var js = require('../js');

var student = exports;

var Student = function Student(name, ip) {
    this.name = name;
    this.ip = ip;
    this.status = new Status();
    this.answers = [];
    this.ratings = [];
    this.score = 0;
};

Student.prototype.retake = function retake() {
    this.status.solved = false;
    this.answers = [];
    this.ratings = [];
    this.score = 0;
};

Student.prototype.getId = function getId() {
    return this.ip;
};

Student.prototype.getName = function getName() {
    return this.name;
};

Student.prototype.getStatus = function getStatus() {
    return this.status;
};

Student.prototype.getAnswers = function getAnswers() {
    return this.answers;
};

Student.prototype.getAnswer = function getAnswer(i) {
    return this.answers[i];
};

Student.prototype.getRating = function getRating(i) {
    return this.ratings[i];
};

Student.prototype.registerAnswers = function registerAnswers(answers) {
    this.status.solved = true;
    this.answers = answers;
};

Student.prototype.registerRatings = function registerRatings(ratings) {
    this.ratings = ratings;
};

Student.prototype.setScore = function setScore(score) {
    this.score = score;
};

Student.prototype.getScore = function getScore() {
    return this.score;
};

Student.prototype.setMadeQuestion = function setMadeQuestion(made) {
    this.status.made = made;
    return this.status.made;
};

Student.prototype.setSolvedQuestion = function setSolvedQuestion(solved) {
    this.status.solved = solved;
    return this.status.solved;
};

var Status = function Status() {
    this.made = false;
    this.solved = false;
};


var Students = function Students() {
    this.currentStudents = {};
    this.numberOfStudents = 0;
};

Students.prototype.addStudent = function addStudent(student) {
    if (!this.currentStudents.hasOwnProperty(student.getId())) {
        this.numberOfStudents++;
    }
    // If student already exists, it is replaced.
    this.currentStudents[student.getId()] = student;
};

Students.prototype.getNumberOfStudents = function getNumberOfStudents() {
    return this.numberOfStudents;
};

Students.prototype.getStudent = function getStudent(id) {
    var student = this.currentStudents[id];
    if (student) {
        return student;
    } else {
        return js.JumboError.notFound("Student does not exist: " + id);
    }
};

Students.prototype.hasStudent = function hasStudent(id) {
    return this.currentStudents.hasOwnProperty(id);
};

Students.prototype.getAll = function getAll() {
    return this.currentStudents;
};

Students.prototype.getStudentStatus = function getStudentStatus(id) {
    var student = this.getStudent(id);
    if (student instanceof Error) {
        return student;
    } else {
        return student.getStatus();
    }
};

student.Student = Student;
student.Students = Students;

//
// Backward compatibility
//

var StudentWrapper = function StudentWrapper(student) {
    this.NAME = student.name;
    this.IP = student.ip;
};

var StudentStatusWrapper = function StudentStatusWrapper(student, numberOfQuestions) {
    this.NAME = student.name;
    this.MADE = student.getStatus().made ? 'Y' : 'N';
    var solved = student.getStatus().solved;
    this.SOLVED = solved ? 'Y' : 'N';
    if (solved) {
        this.NUMQ = numberOfQuestions;
        this.YOUR_ANSWERS = student.getAnswers(); // TODO
    }
};

var StudentsWrapper = function StudentsWrapper(students) {
    this.students = students;
};

StudentsWrapper.prototype.addStudent = function addStudent(message) {
    if (!message.NAME) {
        return js.JumboError.unexpected('Student registration message must contain a valid NAME property.');
    }

    // We need to check for missing IP or self assigned IP
    if ((!message.IP) || (message.IP === "") || (message.IP.indexOf("169") === 0)) {
        return js.JumboError.unexpected('Student registration message must contain a valid IP property.');
    }
    var student = new Student(message.NAME, message.IP);
    this.students.addStudent(student);
};

StudentsWrapper.prototype.getStudent = function getStudent(id) {
    return new StudentWrapper(this.students.getStudent(id));
};

StudentsWrapper.prototype.getStudentStatus = function getStudentStatus(ip, numberOfQuestions) {
    var student = this.students.getStudent(ip);
    if (student instanceof Error) {
        return student;
    } else {
        return new StudentStatusWrapper(student, numberOfQuestions);
    }
};

StudentsWrapper.prototype.getAll = function getAll() {
    all = {};
    for (var id in this.students.getAll()) {
        all[id] = new StudentWrapper(this.students.getStudent(id));
    }
    return all;
};

StudentsWrapper.prototype.registerAnswer = function registerAnswer(message, eventEmitter) {
    if (!message.NAME) {
        return js.JumboError.unexpected('Answer message must contain a valid NAME property.');
    }
    if (!message.IP) {
        return js.JumboError.unexpected('Answer registration message must contain a valid IP property.');
    }
    if (!message.MYANSWER) {
        return js.JumboError.unexpected('Answer registration message must contain a valid MYANSWER property.');
    }
    if (!message.MYRATING) {
        return js.JumboError.unexpected('Answer registration message must contain a valid MYRATING property.');
    }
    var student = this.students.getStudent(message.IP);
    student.registerAnswers(message.MYANSWER);
    student.registerRatings(message.MYRATING);
    return student;
};


student.StudentsWrapper = StudentsWrapper;
