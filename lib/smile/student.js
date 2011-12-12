var student = exports;

var Students = function Students() {
  this.currentStudents = {};
  this.statusOfStudents = {}
}

var buildId = function buildId(name, ip) {
  return name + '-' + ip;
}

Students.prototype.addStudent = function addStudent(message) {
  if (!message.NAME) {
    throw new Error('Student registration message must contain a valid NAME property.')
  }
  if (!message.IP) {
    throw new Error('Student registration message must contain a valid IP property.')
  }
  if (message.TYPE) {
    delete message["TYPE"];
  }
  var id = buildId(message.NAME, message.IP)
  this.currentStudents[id] = message;
  var status = {};
  status['NAME'] = message.NAME;
  status['MADE'] = 'N';
  status['SOLVED'] = 'N';
  this.statusOfStudents[message.IP] = status;
}

Students.prototype.getStudent = function getStudent(id) {
  return this.currentStudents[id];
}

Students.prototype.getStudentStatus = function getStudentStatus(ip) {
  return this.statusOfStudents[ip];
}

Students.prototype.getStudentStatusById = function getStudentStatusById(id) {
  var student = this.currentStudents[id];
  if (student) {
    return this.statusOfStudents[student.IP];
  } else {
    throw new Error("There is no student registered with the id " + id + ".");
  }
}

Students.prototype.getAll = function getAll() {
  return this.currentStudents;
}

student.Students = Students;