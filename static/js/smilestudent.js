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
var SMILEROUTES = {
	"pushmsg" : "/JunctionServerExecution/pushmsg.php"
}
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
						,"4":  { "label": "Answer Qs"
								,"id": "#answerq-pane1"
							 	}
						,"5":  { "label": "Results"
								 ,"id": "#results-pane1"
								}
					};  // We should store transitions
var SMILESTATE = "1";

//
// Data Modles
//
var LoginViewModel =  {
    username : ko.observable(nameGen(8))
    ,realname : ko.observable("")
 	,clientip : ko.observable("")
};

LoginViewModel.fullName = ko.computed(function() {
    // Knockout tracks dependencies automatically. It knows that fullName depends on firstName and lastName, because these get called when evaluating fullName.
    return this.username + " " + this.realname;
}, this);

LoginViewModel.doLogin = function() {
	smileAlert('#globalstatus', 'Logging in ' + this.username(), 'green', 5000);
	smileLogin(this.clientip(), this.username());
}

LoginViewModel.doLoginReset = function() {
	this.username(nameGen(8));
	this.realname("");
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
	ko.applyBindings(LoginViewModel); // This makes Knockout get to work
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
			$(targetid).find('.alert-box').fadeOut();
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
					LoginViewModel.clientip(CLIENTIP);
				}
	});
}

function smileLogin(clientip, username) {
	var clientip;
	$.ajax({ cache: false
			   , type: "POST" // XXX should be POST
			   , dataType: "text"
			   , url: SMILEROUTES["pushmsg"]
			   , data: generateEncodedHail(clientip, username)
			   , error: function (xhr, text, err) {
					smileAlert('#globalstatus', 'Unable to login.  Reason: ' + xhr.status + ':' + xhr.responseText + '.  Please verify your connection or server status.', 'red');
				 }
			   , success: function(data) {
					smileAlert('#globalstatus', 'Successfully logged in', 'green', 10000);
					// Move to state 2 now
					statechange(1,2);
				}
	});
}

function statechange(from,to) {
	if (from == 1) {
		// We can only loop back to 1 or go to 2 (waiting)
		if (to != 2) {
			smileAlert('#globalstatus', 'Cannot move to phase ' + to +' yet.', 'red', 5000);
		} else {
			// Move to 2. Get Ready Phase
			var $next = $('dl.tabs dd').find('a[href="' + STATEMACHINE["2"].id + '"]');
			if ($next) {
				smileAlert('#globalstatus', 'Jump to: ' + STATEMACHINE["2"].label + ' phase.');
				console.log('go to href = ' + $next.attr('href'));
				// Note, we won't disable the login screen, user can click back to it
				$next.removeClass('disabled');
				var a = $next[0]; // get the dom obj
				var evt = document.createEvent('MouseEvents');
				evt.initEvent( 'click', true, true );
				a.dispatchEvent(evt);
			}
		}
	} else if (from == 2) {
		
		if (to == 3) { // Enter Make Questions Phase
			
		} else if (to == 4) { // Enter Answer Questions Phase
			
		}
	}
}


function generateEncodedHail(clientip, username) {
	var key = "MSG";
	var encodedmsg;
	var template = '{"TYPE":"HAIL","IP":"%s","NAME":"%s"}';
	encodedmsg = key + '=' + encodeURIComponent(sprintf(template, clientip, username));
    return encodedmsg;
}

$(window).unload(function () {
	
	// XXX Implement something here to tell the server we've left
	// partSession();
	// setTimeout(partSession(), 60000);  // XXX Give the user a minute to return
});