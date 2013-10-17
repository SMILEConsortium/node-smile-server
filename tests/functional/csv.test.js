assert = require('assert');
vows = require('vows');
request = require('request');
app = require('../../smileplug');

PORT = 3001;
BASE_URL = "http://localhost:" + PORT;

HEADERS_JSON = {
    'Content-Type' : 'application/json'
};

HEADERS_CSV = {
    'Content-Type' : 'text/csv'
};

HEADERS_ENCODED = {
    'Content-Type' : 'application/x-www-form-urlencoded'
};

var csvData = 'question,choice1,choice2,choice3,choice4,has_image,answers\r\n' +
              'What color is the sky?,Blue,Green,Yellow,Orange,,choice1\r\n' +
              'Qual a cor do céu?,Azul,Verde,Amarelo,Laranja,,choice1\r\n';

var csvData2 = 'question,choice1,choice2,choice3,choice4,has_image,answers\n' +
              'What color is the sky?,Blue,Green,Yellow,Orange,,choice1\n' +
              'Qual a cor do céu?,Azul,Verde,Amarelo,Laranja,,choice1\n';

var csvData3 = 'Teacher Name:,Mrs. Parker\n' +
               'Title:,JAMsj Barracks Set 2013\n' +
               'Group Name:,MLK Elementary Grade 5\n' +
               'question,choice1,choice2,choice3,choice4,has_image,answers, owner_name, owner_IP\n' +
               'What color is the sky?,Blue,Green,Yellow,Orange,,choice1\n' +
               'Qual a cor do céu?,Azul,Verde,Amarelo,Laranja,,choice1\n';

var iqsetid1 = '0894DDFC-EDDE-430A-8FCF-C86C259D28AC';
var iqset1data = ['JAMsj Barracks Set 2013', 'Mrs. Parker', 'MLK Elementary Grade 5'];

var sessionid1 = '1EE46B2C-E6CD-43FE-9B5A-B6FF82530E75';

// XXX Won't work for same reason as below
var testContentBody = 
    '--foo\r\n' +
    'Content-Disposition: form-data; name="file1"; filename="file1"\r\n' +
    'Content-Type: application/octet-stream\r\n' +
    csvData +
    '--foo--\r\n';

// XXX this also won't work, CRLF boundaries in data
var testContentBody2 =
    '-----------------------------91665575413989190921767050510\r\n' +
    'Content-Disposition: form-data; name="qquuid"\r\n' +
    '\r\n' +
    '8c379945-4660-4727-9126-b9f6386be638\r\n' +
    '-----------------------------91665575413989190921767050510\r\n' +
    'Content-Disposition: form-data; name="qqtotalfilesize"\r\n' +
    '\r\n' +
    csvData.length +
    '-----------------------------91665575413989190921767050510\r\n' +
    'Content-Disposition: form-data; name="qqfile"; filename="nexray_128x128_32bit.png"\r\n' +
    'Content-Type: application/octet-stream\r\n' +
    '\r\n' +
    csvData +
    '-----------------------------91665575413989190921767050510\r\n';

// XXX This case does work, though does not contain the data we need to submit
var body =
    '--foo\r\n' +
    'Content-Disposition: form-data; name="file1"; filename="file1"\r\n' +
    'Content-Type: application/octet-stream\r\n' +
    '\r\nThis is the first file\r\n' +
    '--foo\r\n' +
    'Content-Type: application/octet-stream\r\n' +
    'Content-Disposition: form-data; name="file2"; filename="file2"\r\n' +
    'Content-Transfer-Encoding: unknown\r\n' +
    '\r\nThis is the second file\r\n' +
    '--foo--\r\n';

// XXX This doesn't work with the CRLF boundaries in the data!!! Remove this
var body2 = '--foo\r\n' +
    'Content-Disposition: form-data; name="file1"; filename="file1"\r\n' +
    'Content-Type: application/octet-stream\r\n' +
    csvData +
    '--foo\r\n';

var body3 =
    '--foo\r\n' +
    'Content-Disposition: form-data; name="file1"; filename="file1"\r\n' +
    'Content-Type: application/octet-stream\r\n' +
    '\r\n' + csvData3 + '\r\n' +
    '--foo\r\n';

var suite = vows.describe('Tests "Questions as CSV"');

suite.addBatch({
    "startup" : function() {
        app.runServer(PORT);
    }
});


suite.addBatch({
    "A POST to /smile/question/csv with questions as csv" : {
        topic : function() {
            request({
                uri : BASE_URL + '/smile/question/csv',
                method : 'POST',
                headers : HEADERS_CSV,
                body : csvData,
            }, this.callback);
        },
        "should respond with 200" : function(err, res, body) {
            assert.equal(res.statusCode, 200);
        },
        "should answer with ok" : function(err, res, body) {
            assert.equal(res.body, "OK");
        },
    }
});


suite.addBatch({
    "A POST to /smile/iqset with a csv containing a properly formed IQSet": {
        topic: function() {
            request({
                uri: BASE_URL + '/smile/iqset',
                method: 'POST',
                headers: {
                'Content-Length': body3.length,
                'Content-Type': 'multipart/form-data; boundary=foo'
                },
                body: body3,
            }, this.callback);
        },
        "should respond with 200": function(err, res, body) {
            assert.equal(res.statusCode, 200);
        },
        "should answer with data": function(err, res, body) {
            console.error("Received request body:");
            // console.error(body2);
            assert.ok(res.body.iqdata !== null);
        },
    }
});

suite.addBatch({
    "A GET to /smile/iqsets to return all properly formed IQSets": {
        topic: function() {
            request({
                uri: BASE_URL + '/smile/iqsets',
                method: 'GET',
            }, this.callback);
        },
        "should respond with 200": function(err, res, body) {
            assert.equal(res.statusCode, 200);
        },
        "should answer with data": function(err, res, body) {
            var dat = JSON.parse(body);
            console.error("Received request body:");
            // console.error(body);
            assert.ok(body.rows !== null);
            assert.ok(dat.total_rows > 0);
        },
    }
});

suite.addBatch({
    "A GET to /smile/iqset/:id to return an IQSet": {
        topic: function() {
            request({
                uri: BASE_URL + '/smile/iqset/' + iqsetid1,
                method: 'GET',
            }, this.callback);
        },
        "should respond with 200": function(err, res, body) {
            assert.equal(res.statusCode, 200);
        },
        "should answer with data": function(err, res, body) {
            var dat = JSON.parse(body);
            console.error("Received request body:");
            // console.error(body);
            assert.ok(body !== null);
            assert.ok(!dat.error);
            /*
            ducktype: 'iqsetdoc',
            date: '2013-10-17T04:46:22.753Z',
            title: 'JAMsj Barracks Set 2013',
            teachername: 'Mrs. Parker',
            groupname: 'MLK Elementary Grade 5',
            iqdata:
            */
            assert.equal('iqsetdoc',dat.ducktype);
            assert.equal('2013-10-17T04:46:22.753Z', dat.date);
            assert.equal('JAMsj Barracks Set 2013', dat.title);
            assert.equal('Mrs. Parker', dat.teachername);
            assert.equal('MLK Elementary Grade 5', dat.groupname);
            assert.ok(dat.iqset !== null);
        },
    }
});

suite.addBatch({
    "A GET to /smile/sessions to return sessions": {
        topic: function() {
            request({
                uri: BASE_URL + '/smile/sessions',
                method: 'GET',
            }, this.callback);
        },
        "should respond with 200": function(err, res, body) {
            assert.equal(res.statusCode, 200);
        },
        "should answer with data": function(err, res, body) {
            var dat = JSON.parse(body);
            console.error("Received request body:");
            // console.error(body);
            assert.ok(dat.rows !== null);
            assert.ok(dat.total_rows > 0);
        },
    }
});

suite.addBatch({
    "A GET to /smile/session/:id to return an IQSet": {
        topic: function() {
            request({
                uri: BASE_URL + '/smile/session/' + sessionid1,
                method: 'GET',
            }, this.callback);
        },
        "should respond with 200": function(err, res, body) {
            assert.equal(res.statusCode, 200);
        },
        "should answer with data": function(err, res, body) {
            var dat = JSON.parse(body);
            console.error("Received request body:");
            // console.error(body);
            assert.ok(body !== null);
            assert.ok(!dat.error);
            /*
            ducktype: 'iqsetdoc',
            date: '2013-10-17T04:46:22.753Z',
            title: 'JAMsj Barracks Set 2013',
            teachername: 'Mrs. Parker',
            groupname: 'MLK Elementary Grade 5',
            iqdata:
            */
            assert.equal('sessiondoc',dat.ducktype);
            assert.equal('2013-10-17T06:34:59.069Z', dat.date);
            assert.equal('2013-10-17T06:34:59.069Z Session', dat.title);
            assert.equal('Teacher', dat.teachername);
            assert.equal('General', dat.groupname);
            assert.ok(dat.iqset !== null);
        },
    }
});


suite.addBatch({
    "A GET to /smile/question should return a list containing the posted questions" : {
        topic : function() {
            request({
                uri : BASE_URL + '/smile/question',
                method : 'GET'
            }, this.callback);
        },
        "should have registered the questions" : function(err, res, body) {
            var obj = {};
            var questionTeacher1 = {
                NAME : 'teacher',
                Q : 'What color is the sky?',
                O1 : 'Blue',
                O2 : 'Green',
                O3 : 'Yellow',
                O4 : 'Orange',
                A : '1',
                TYPE : 'QUESTION'
            };
            var questionTeacher2 = {
                NAME : 'teacher',
                Q : 'Qual a cor do céu?',
                O1 : 'Azul',
                O2 : 'Verde',
                O3 : 'Amarelo',
                O4 : 'Laranja',
                A : '1',
                TYPE : 'QUESTION'
            };
            obj.teacher = [ questionTeacher1, questionTeacher2 ];
            assert.equal(JSON.stringify(obj), res.body);
        },
    }
});


suite.addBatch({
    "shutdown" : function() {
        app.close();
    }
});

suite.run();
