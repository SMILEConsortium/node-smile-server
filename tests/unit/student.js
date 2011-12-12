var assert = require('assert');

var Students = require('../../lib/smile/student').Students;

var msgOK = {
  "NAME" : "test",
  "IP" : "172.16.129.242",
}

var msgOK2 = {
  "NAME" : "test2",
  "IP" : "172.16.129.243",
}

var msgNoIP = {
  "NAME" : "test",
}

var msgNoName = {
  "IP" : "172.16.129.242",
}

exports.testEmptyStudents = function(test) {
  test.expect(1);
  var myStudents = new Students();
  test.ok(true, !myStudents.getStudent(""));
  test.done();
};

exports.testOneStudent = function(test) {
  test.expect(1);
  var myStudents = new Students();
  myStudents.addStudent(msgOK);
  test.ok(true, myStudents.getStudent("test-172.16.129.242") === msgOK);
  test.done();
};

exports.testTwoStudents = function(test) {
  test.expect(3);
  var myStudents = new Students();
  myStudents.addStudent(msgOK);
  myStudents.addStudent(msgOK2);
  test.ok(myStudents.getStudent("test-172.16.129.242") === msgOK);
  test.ok(myStudents.getStudent("test2-172.16.129.243") === msgOK2);
  var obj = {};
  obj["test-172.16.129.242"] = msgOK;
  obj["test2-172.16.129.243"] = msgOK2;
  test.equal(JSON.stringify(myStudents.getAll()), JSON.stringify(obj));
  test.done();
};

exports.testMissingProperties = function(test) {
  test.expect(2);
  var myStudents = new Students();
  test.throws(function() {
    myStudents.addStudent(msgNoIP);
  });
  test.throws(function() {
    myStudents.addStudent(msgNoName);
  });
  test.done();
};

exports.testStatusOfStudents = function(test) {
  test.expect(3);
  var myStudents = new Students();
  myStudents.addStudent(msgOK);
  myStudents.addStudent(msgOK2);
  var obj = {};
  obj["test-172.16.129.242"] = msgOK;
  obj["test2-172.16.129.243"] = msgOK2;
  var status1 = {"NAME":"test","MADE":"N","SOLVED":"N"}
  var status2 = {"NAME":"test2","MADE":"N","SOLVED":"N"}
  test.equal(JSON.stringify(status1), JSON.stringify(myStudents.getStudentStatus("172.16.129.242")));
  test.equal(JSON.stringify(status2), JSON.stringify(myStudents.getStudentStatus("172.16.129.243")));
  test.throws(function() {
    myStudents.getStudentStatusById("foo");
  });
  test.done();
};