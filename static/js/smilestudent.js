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

// Here's my data model
var ViewModel = function(first, last) {
    this.firstName = ko.observable(first);
    this.lastName = ko.observable(last);
 
    this.fullName = ko.computed(function() {
        // Knockout tracks dependencies automatically. It knows that fullName depends on firstName and lastName, because these get called when evaluating fullName.
        return this.firstName() + " " + this.lastName();
    }, this);
};
 
ko.applyBindings(new ViewModel("Planet", "Earth")); // This makes Knockout get to work
$(document).ready(function() {
	//
	// Init globals
	//
	
	//
	// Init Handlers
	//
	$('.wizard').click(function (e) {
		
		e.preventDefault();
		if ($(this).hasClass('disabled')) {
			smileAlert('#globalstatus', 'I am disabled', 'red');
			return false; // Do something else in here if required
		} else {
			window.location.href = $(this).attr('href');
		}
	});
});

function smileAlert(targetid, text, alerttype) {
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
}
$(window).unload(function () {
	// XXX Implement something here to tell the server we've left
	// partSession();
	// setTimeout(partSession(), 60000);  // XXX Give the user a minute to return
});