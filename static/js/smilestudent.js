/**
#
#Copyright (c) 2011 Razortooth Communications, LLC. All rights reserved.
#
#Redistribution and use in source and binary forms, with or without modification,
#are permitted provided that the following conditions are met:
#
#    * Redistributions of source code must retain the above copyright notice,
#      this list of conditions and the following disclaimer.
#
#    * Redistributions in binary form must reproduce the above copyright notice,
#      this list of conditions and the following disclaimer in the documentation
#      and/or other materials provided with the distribution.
#
#    * Neither the name of Razortooth Communications, LLC, nor the names of its
#      contributors may be used to endorse or promote products derived from this
#      software without specific prior written permission.
#
#THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
#ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
#WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
#DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
#ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
#(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
#LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
#ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
#(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
#SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
**/

//
// GLOBALS
//
var STARTTIME;
var ALPHASEQ = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
var DIGITSEQ = [0,1,2,3,4,5,6,7,8,9];
var CLIENTIP = '127.0.0.1';
var EVENTLOOPCYCLE = 1500; // LOOP WAIT TIME in MILLISECONDS
var EVENTLOOPINTERVAL = null;
var SMILEROUTES = {
	"pushmsg" : "/JunctionServerExecution/pushmsg.php"
	,"smsg" : "/JunctionServerExecution/current/MSG/smsg.txt"
	,"mystate" : "/JunctionServerExecution/current/MSG/%s.txt"
	,"postinquiry" : "/smile/question"
}
var VERSION = '0.9.10';

//
// 1 - login screen
// 2 - logged in, waiting
// 3 - making questions
// 4 - answering questions
// 5 - results
//
var STATEMACHINE = {
						"1": { "label": "Login"
							  	,"id": "#login-pane1"
							  }
						,"2": { "label": "Get Ready"
								  	,"id": "#start-pane1"
							  }
						,"3": { "label": "Make Qs"
								 ,"id": "#makeq-pane1"
							  }
						,"4": { "label": "Answer Qs"
								,"id": "#answerq-pane1"
							  }
						,"5": { "label": "Results"
								 ,"id": "#results-pane1"
							  }
					};  // We should store transitions
var SMILESTATE = "1";

//
// KO Extenders
// 
// This adds the required extender for validation
ko.extenders.required = function(target, overrideMessage) {
    //add some sub-observables to our observable
    target.hasError = ko.observable();
    target.validationMessage = ko.observable();
 
    //define a function to do validation
    function validate(newValue) {
       target.hasError(newValue ? false : true);
       target.validationMessage(newValue ? "" : overrideMessage || "This field is required");
    }
 
    //initial validation
    validate(target());
 
    //validate whenever the value changes
    target.subscribe(validate);
 
    //return the original observable
    return target;
};


//
// Data Models
//
// Multimodel approach: See fiddle here: http://jsfiddle.net/npJZM/10/
// Another good approach:  http://bit.ly/QzIgHP 
//

/*
"NAME" : "default.15",
"Q" : "qwerty",
"PIC" : "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",
"A" : "3",
"IP" : '10.0.2.15',
"O4" : "r",
"O3" : "e",
"O2" : "w",
"O1" : "q",
"TYPE" : 'QUESTION_PIC'
*/

/**
  Model for SMILE Inquiry Type 2 - For use with SMILE 2.x clients and servers

  Note: This should get generalized into the common protocol, though we should try to maintain 
  backwards compatibility for Type 2 clients and servers
  
*/
var SMILEInquiry2 = function(question, answer1, answer2, answer3, answer4, rightanswer, picurl) {
	var self = this;
	self.question = question;
	self.answer1 = answer1;
	self.answer2 = answer2;
	self.answer3 = answer3;
	self.answer4 = answer4;
	self.rightanswer = rightanswer;
	self.picurl = picurl;
	if ((self.picurl === "") || (self.picurl === undefined)) {
		self.type = "QUESTION";
	} else {
		self.type = "QUESTION_PIC";
	}
}

/**
 * We should refactor out any items that belong in specialized child ViewModels
 * Candidates: 
 * - LoginModel
 * - MsgModel
 * - StateModel
 * 
 */
var GlobalViewModel =  {
    username : ko.observable(nameGen(8)).extend({ required: "Please enter a username" })
    ,realname : ko.observable("")
 	,clientip : ko.observable("")
	,loginstatusmsg : ko.observable("")
	,sessionstatemsg : ko.observable("")
	,hasSubmitted : ko.observable(false)
	,iqx : ko.observableArray([new SMILEInquiry2()])
	,answer : ko.observable("")
	,question: ko.observable("")
	,a1 : ko.observable("")
	,a2 : ko.observable("")
	,a3 : ko.observable("")
	,a4 : ko.observable("")
	,rightanswer: ko.observable("a1")
	,picurl : ko.observable("")
	,version : VERSION
};

GlobalViewModel.fullName = ko.computed(function() {
	var self = this;
    // Knockout tracks dependencies automatically. It knows that fullName depends on firstName and lastName, because these get called when evaluating fullName.
    return self.username + " " + self.realname;
}, self);

GlobalViewModel.doLogin = function() {
	var self = this;
	if (!self.hasSubmitted()) {
		console.log('doLogin');
		smileAlert('#globalstatus', 'Logging in ' + self.username(), 'green', 5000);
		doSmileLogin(self.clientip(), self.username(), self.realname());
	}
	self.hasSubmitted(true);

	return false;
}

GlobalViewModel.doLoginReset = function() {
	this.username(nameGen(8));
	this.realname("");
	this.hasSubmitted(false);
	return false;
}

GlobalViewModel.doInquiryReset = function() {
	var self = this;
	self.a1("");
	self.a2("");
	self.a3("");
	self.a4("");
	self.answer("");
	self.rightanswer("a1");
	self.question("");
	self.picurl("");
}

GlobalViewModel.doSubmitQ = function() {
	var self = this;
	console.log(">>>>>>>>>>doSubmitQ");
	var jsondata = generateJSONInquiry(self.clientip(), self.username(), self.question(), self.a1(), self.a2(), self.a3(), self.a4(), self.rightanswer(), self.picurl());
	doPostInquiry(jsondata, function() {
		self.doInquiryReset();
	});
}

GlobalViewModel.doSubmitQandDone = function() {
	var self = this;
	console.log("doSubmitQandDone");
	var jsondata = generateJSONInquiry(self.clientip(), self.username(), self.question(), self.a1(), self.a2(), self.a3(), self.a4(), self.rightanswer(), self.picurl());
	doPostInquiry(jsondata, function() {
		self.doInquiryReset();
		// XXX Localize this
		$('div#inquiry-form-area').block({ 
			message: '<h1>Done.  Please wait for the rest of the students to Creating Questions</h1>', 
			css: { border: '3px solid #a00'
			 	   ,width: '80%'
			} 
		});
	});
}

$(document).ready(function() {
	//
	// Init globals
	//
	STARTTIME = Date.now();
	setClientIP();
	SMILESTATE = "1";
	
	//
	// Init Data Model
	//
	ko.applyBindings(GlobalViewModel);
	
	//
	// Init UI
	//
	restoreLoginState();
	
	//
	// Init Handlers
	//
	$('dl.tabs dd a.wizard').on('click.fndtn', function (e) {
		e.stopPropagation();
		var $activetab = $(this).parent().parent().find('dd.active a');
		if ($(this).hasClass('disabled')) {
			var txt =$activetab.text().split('.'); // XXX This is non-defensive
			smileAlert('#globalstatus', 'Please wait for phase <em>' + txt[1].trim() + '</em> to complete.', '', 5000);
			return false; // Do something else in here if required
		} else {
			// smileAlert('#globalstatus', 'Bubble ' + $(this).text(), 'green');
			$(this).removeClass('disabled');
			$activetab.addClass('disabled');
			console.log('clicked ' + $(this).attr('href'));
			window.location.href = $(this).attr('href');
		}
	});
});

//
// App functions
//
function smileAlert(targetid, text, alerttype, lifetime) {
	var defaultalert = 'secondary';
	var redalert = 'alert';
	var bluealert = '';
	var greenalert = 'success';
	var formatstr = '<div class="alert-box %s"> \
		%s \
	  	<a href="" class="close">&times;</a> \
		</div>';
	if (!alerttype) {
		alerttype = defaultalert;
	} else if (alerttype === 'red') {
		alerttype = redalert;
		var trace = printStackTrace();
		text = text + ' : ' + trace;
	} else if (alerttype === 'blue') {
		alerttype = bluealert;
	} else if (alerttype === 'green') {
		alerttype = greenalert;
	} else {
		alerttype = defaultalert;
	}
	if (targetid) {
		$(targetid).append(sprintf(formatstr, alerttype, text));
	}
	if (lifetime) {
		setInterval(function() {
			$(targetid).find('.alert-box').fadeOut().remove();
		}, lifetime)
	}
}

function nameGen(namelen) {
	var dice;
	var alphasetsize = ALPHASEQ.length;
	var digitsetsize = DIGITSEQ.length;
	var name = "";

	// Get alpha portion
	for (var i = 0; i < namelen; i++) {
		dice = Math.floor((Math.random()*alphasetsize));
		name = name + ALPHASEQ[dice];
	}
	
	// Get digit portion, fixed at 4 digits
	for (var i = 0; i < 4; i++) {
		dice = Math.floor((Math.random()*digitsetsize));
		name = name + DIGITSEQ[dice];
	}
	return name;
}

function randomIPGen() {
	var baseip = '127.0.0.';
	var MAXVAL = 255;
	var dice = dice = Math.floor((Math.random()*MAXVAL) + 1); // A value of 1-255
	return(baseip + dice);
}

function setClientIP() {
	var clientip;
	$.ajax({ cache: false
			   , type: "GET" // XXX should be POST
			   , dataType: "json"
			   , url: "/smile/echoclientip"
			   , data: {}
			   , error: function (xhr, text, err) {
					smileAlert('#globalstatus', 'Cannot obtain client IP address.  Please verify your connection or server status.', 'red');
				 }
			   , success: function(data) {
					clientip = data.ip; // XXX We should be defensive in case garbage comes back
					if (clientip !== '127.0.0.1') {
						CLIENTIP = clientip;
					} else {
						// I've no idea why this would happen, other than on localhost without a real 
						// ip address assigned.  But the game doesn't really function if there are multiple
						// duplicate IPs.  To avoid this during testing scenarios generate fake IPs.
						CLIENTIP = randomIPGen();
						smileAlert('#globalstatus', 'Using fake IP address ' + CLIENTIP, 'blue', 5000);
					}
					GlobalViewModel.clientip(CLIENTIP);
				}
	});
}

function doSmileLogin(clientip, username, realname) {
	var clientip;
	$.ajax({ cache: false
			   , type: "POST"
			   , dataType: "text"
			   , url: SMILEROUTES["pushmsg"]
			   , data: generateEncodedHail(clientip, username)
			   , error: function (xhr, text, err) {
					smileAlert('#globalstatus', 'Unable to login.  Reason: ' + xhr.status + ':' + xhr.responseText + '.  Please verify your connection or server status.', 'red');
				 	GlobalViewModel.hasSubmitted(false); // Reset this so clicks will work
				}
			   , success: function(data) {
					smileAlert('#globalstatus', 'Successfully logged in', 'green', 10000);
					// Move to state 2 now
					statechange(1,2);
					GlobalViewModel.loginstatusmsg("Logged In");
					// GlobalViewModel.sessionstatus();
					// $('#login-status').empty().append(LOGGED_IN_TPL);
					startSmileEventLoop();
				}
	});
}

function doPostInquiry(inquirydata, cb) {
	$.ajax({ cache: false
			   , type: "POST"
			   , dataType: "text"
			   , url: SMILEROUTES["postinquiry"]
			   , data: inquirydata
			   , error: function (xhr, text, err) {
					// TODO: XXX Decide what to do if this post fails
					smileAlert('#globalstatus', 'Unable to post inquiry.  Reason: ' + xhr.status + ':' + xhr.responseText + '.  Please verify your connection or server status.', 'red');
				}
			   , success: function(data) {
					smileAlert('#globalstatus', 'Sent Inquiry Question', 'green', 5000);
					if (cb) {
						cb();
					}
					//
					// We should track a count of successful submits
					//
					
					//
					// We should call our CB 
					//
				}
	});
}

/**
 *
 * doSMSG - This handles server side polling.  TODO - get rid of server side polling and use socket.io
 * 
 * On success : review incoming messages to see what state we are in
 * On error : smileAlert
 */
function doSMSG() {
	$.ajax({ cache: false
		   , type: "GET"
		   , dataType: "json"
		   , url: SMILEROUTES["smsg"]
		   , data: {}
		   , error: function (xhr, text, err) {
				smileAlert('#globalstatus', 'Status Msg Error.  Reason: ' + xhr.status + ':' + xhr.responseText + '.', 'red');
			 }
		   , success: function(data) {
				if (data) {
					msg = data["TYPE"];
					// console.log(data); // XXX Remove debug
					if (msg === "START_MAKE") { statechange(2,3) };
					if (msg === "WAIT_CONNECT") {};
					if (msg === "START_SOLVE") {};
					if (msg === "START_SHOW") {};
					if (msg === "WARN") {};
					if ((msg === "") || (msg === null) || (msg === undefined)) { statechange(SMILESTATE, 1); }
					// Ignore anything else that we receive
					// We should have a RESET_GAME
				} else {
					console.log('no data');
				}
			}
	});
}

function statechange(from,to) {
	if (from == 1) { // FROM 1
		if (SMILESTATE != 1) { return; }
		// We can only loop back to 1 or go to 2 (waiting)
		if (to == 1) {
			restoreLoginState();
			return;
		} // This is effectively a reset, logout the user
		if (to != 2) {
			smileAlert('#globalstatus', 'Cannot move to phase ' + to +' yet.', 'red', 5000);
		} else { // Move to 2. Get Ready Phase
			SMILESTATE = 2;
			var $next = $('dl.tabs dd').find('a[href="' + STATEMACHINE["2"].id + '"]');
			if ($next) {
				smileAlert('#globalstatus', 'Jump to: ' + STATEMACHINE["2"].label + ' phase.', 2500);
				console.log('go to href = ' + $next.attr('href'));
				$('#logoutarea').show();
				// Note, we won't disable the login screen, user can click back to it
				$next.removeClass('disabled');
				var a = $next[0]; // get the dom obj
				var evt = document.createEvent('MouseEvents');
				evt.initEvent( 'click', true, true );
				a.dispatchEvent(evt);
			}
		}
	} else if (from == 2) { // FROM 2
		if (SMILESTATE != 2) { return; }
		if (to == 1) {} // Teacher reset game ... hang in phase 2
		if (to == 3) { // Enter Make Questions Phase
			SMILESTATE = 3;
			$('div#inquiry-form-area').unblock();
			var $next = $('dl.tabs dd').find('a[href="' + STATEMACHINE["3"].id + '"]');
			if ($next) {
				smileAlert('#globalstatus', 'Jump to: ' + STATEMACHINE["3"].label + ' phase.', 2500);
				console.log('go to href = ' + $next.attr('href'));
				$next.removeClass('disabled');
				var a = $next[0]; // get the dom obj
				var evt = document.createEvent('MouseEvents');
				evt.initEvent( 'click', true, true );
				GlobalViewModel.sessionstatemsg("Start Making Questions until the teacher is ready to start Answering Questions")
				a.dispatchEvent(evt);
			}
		} else if (to == 4) { // Enter Answer Questions Phase
			
		}
	}
}

function restoreLoginState() {
	// 
	// XXX This needs to clean up the sidebar area too
	//
	var $next = $('dl.tabs dd').find('a[href="' + STATEMACHINE["1"].id + '"]');
	$('#logoutarea').hide();
	if ($next) {
		stopSmileEventLoop();
		smileAlert('#globalstatus', 'Jump to: ' + STATEMACHINE["1"].label + ' phase.', 2500);
		console.log('go to href = ' + $next.attr('href'));
		$next.removeClass('disabled');
		var a = $next[0]; // get the dom obj
		var evt = document.createEvent('MouseEvents');
		evt.initEvent( 'click', true, true );
		a.dispatchEvent(evt);
		GlobalViewModel.hasSubmitted(false);
		GlobalViewModel.sessionstatemsg("Waiting for teacher to begin"); // XXX Need to pull out localization msgs
		GlobalViewModel.loginstatusmsg("Please Login.  Then the teacher will tell you instructions."); // XXX Need to pull out localization msgs  
	}
}

/* 
 * This is brittle and awful - XXX TODO refactor, inquiry should be an object we pass in
 * We won't validdate anything here, let the server do it
 * That's dangerous, and we should plan to encode any funky unicode input or other malicious attempts to break 
 * something
 */
function generateJSONInquiry(clientip, username, question, answer1, answer2, answer3, answer4, rightanswer, picurl) {
	var jsonmsg = {};
	
	jsonmsg.NAME = username;
	jsonmsg.IP = clientip;
	jsonmsg.O1 = answer1;
	jsonmsg.O2 = answer2;
	jsonmsg.O3 = answer3;
	jsonmsg.O4 = answer4;
	if ((picurl === "") || (picurl === undefined)) {
		jsonmsg.TYPE = "QUESTION";
	} else {
		jsonmsg.TYPE = "QUESTION_PIC";
		jsonmsg.PIC = picurl;
	}
	jsonmsg.Q = question;
	jsonmsg.A = rightanswer[1]; // Drop the leading 'a'
	
	return jsonmsg;
}
function generateEncodedHail(clientip, username) {
	var key = "MSG";
	var encodedmsg;
	var template = '{"TYPE":"HAIL","IP":"%s","NAME":"%s"}';
	encodedmsg = key + '=' + encodeURIComponent(sprintf(template, clientip, username));
    return encodedmsg;
}

function startSmileEventLoop() {
	EVENTLOOPINTERVAL = setInterval(function() {
		doSMSG();
		console.log(Date.now() + " - tick");
	}, EVENTLOOPCYCLE);
}

function stopSmileEventLoop() {
	if (EVENTLOOPINTERVAL) {
		clearInterval(EVENTLOOPINTERVAL);
		EVENTLOOPINTERVAL = null;
	}
}

$(window).unload(function () {
	// XXX Implement something here to tell the server we've left
	// partSession();
	// setTimeout(partSession(), 60000);  // XXX Give the user a minute to return
});

var LOGGED_OUT_TPL = ' \
<h4>Instructions for <div data-bind="text: username" id="student-username">Student</div> <div data-bind="text: realname" id="student-realname"></div></h4> \
<div id="login-status"> \
<p>Please Login.  Then the teacher will tell you instructions.</p> \
</div>';

var LOGGED_IN_TPL = ' \
  <div id="login-panel" class="panel callout radius"> \
  <h5>Logged In</h5> \
  <p>@<div data-bind="text: clientip" id="student-clientip">127.0.0.1</div></p> \
  <div id="session-state"> \
  <p>Waiting for teacher to begin</p> \
  </div> \
  </div> \
  <p><a data-bind="click: doLoginReset" class="secondary button" href="#logout-action">Logout</a></p> \
  ';

var SESSION_STATE_START_MAKE_TPL = ' \
	<p>Start Making Questions until the teacher is ready to start Answering Questions</p> \
';