/**
 #
 #Copyright (c) 2011-2013 Razortooth Communications, LLC. All rights reserved.
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

var VERSION = '1.0.0prealpha1';

// XXX Should generalize the app view model to wrap the required child models and use :with binding
function iqsetSummaryModel() {
    var self = this;
    self.title = ko.observable("");
    self.createdate = ko.observable("");
    self.groupname = ko.observable("");
    self.teachername = ko.observable("");
    self.iqid = ko.observable("");
    self.iqdata = ko.observableArray([]);
    self.questionscount = ko.computed(function() {
        // Knockout tracks dependencies automatically
        return self.iqdata().length;
    }).extend({ notify: 'always' });
    /* self.url = ko.computed(function() {
        return '/smile/iqset/' + self.iqid;
    }); */
}

function iqsetsModel() {
    var self = this;
    self.iqsets = ko.observableArray([]);
}

function sessionsModel() {
    var self = this;
    self.iqsessions = ko.observableArray([]);
}

function sessionStatsModel() {
    var self = this;
    self.numberOfStudents = ko.observable("");
    self.numberOfQuestions = ko.observable("");
    self.numberOfStudentsPostingAnswers = ko.observable("");
}

function sessionMetadataModel() {
    var self = this;
    self.teacherName = ko.observable("");
    self.groupName = ko.observable("");
    self.iqid = ko.observable("");
    self.iqtitle = ko.observable("");
    // XXX Let's add this later
    // "ratingScale":{"1":"Low Quality Question","2":"Adequate Question","3":"Average Question","4":"Good Question","5":"High Quality Question"}
}

function sessionResultsModel() {
    var self = this;
    self.winnerScore = ko.observable("");
    self.winnerRating = ko.observable("");
    self.numberOfQuestions = ko.observable("");
    self.rightAnswers = ko.observableArray([]);
    self.averageRatings = ko.observableArray([]);
    self.questionsCorrectPercentage = ko.observableArray([]);
}

/*
function sessionStudentResultsModel() {
    var self = this;
    self.name = ko.observable("");
    self.ip = ko.observable("");
    self.qmade = ko.observable("");
    self.qsolved = ko.observable("");
    self.answer = ko.observableArray([]);
    self.ratings = ko.observableArray([]);
    self.score = ko.observable("");
}
*/

function sessionSummaryModel() {
    var self = this;
    self.title = ko.observable("");
    self.sessionName = ko.observable("");
    self.date = ko.observable("");
    self.groupname = ko.observable("");
    self.teachername = ko.observable("");
    self._id = ko.observable("");
    self.iqdata = ko.observableArray([]);
    self.results = new sessionResultsModel();
    self.sessionStats = new sessionStatsModel();
    self.sessionMetadata = new sessionMetadataModel();
    self.students = new ko.observableArray([]);
}

// XXX Need to decide if we will use this
var iqModel = function(question, answer1, answer2, answer3, answer4, rightanswer, picurl) {
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
};

var globalViewModel = {
    iqsetSummary: new iqsetSummaryModel(),
    iqsetCollection: new iqsetsModel(),
    sessionCollection: new sessionsModel(),
    sessionSummary: new sessionSummaryModel()
};

function createIQSetUploader() {
    var uploader = new qq.FineUploader({
        element : $('#fine-uploader')[0],
        callbacks : {
            onComplete : function(id, name, response) {
                $('#fine-uploader').fadeIn();
                $('div.qq-upload-button').hide();
                $('li.qq-upload-success').fadeOut(5000, "linear");
                if (response.success) {
                    doShowIQSetUploadSummaryModal(response);
                }
            }
        },
        mode: 'custom',
        validation : {
            allowedExtensions : [ 'csv' ],
        },
        request : {
            endpoint : '/smile/iqset'
        }
    });
}
// window.onload = createUploader;

function doShowIQSetUploadSummaryModal(resp) {


    var fvm = globalViewModel.iqsetSummary;

    
    fvm.title(resp.title);
    fvm.createdate(resp.date);
    fvm.groupname(resp.groupname);
    fvm.teachername(resp.teachername);
    fvm.iqid(resp._id);
    fvm.iqdata.removeAll(); // Don't forget to clean up the pre-existing iqsets
    ko.utils.arrayPushAll(fvm.iqdata(), resp.iqdata);
    console.log('viewmodel iqdata().length = ' + fvm.iqdata().length);
    fvm.iqdata.valueHasMutated();
    console.log('valueHasMutated');
    console.log('viewModel questionscount = ' + fvm.questionscount());
    console.log(fvm.createdate());
    // console.log(fvm.iqdata()[0]);
    $('#iqsetupload-summary').foundation('reveal', 'open');
}

function loadIQSets(cb, params) {
    //
    // Ignore params
    //
    if (params) {
        // Do something
    }

    $.ajax({ cache: false, type: "GET", dataType: "json", url: '/smile/iqsets', data: {}, error: function(xhr, text, err) {
        // TODO: XXX Decide what to do if this post fails
        // smileAlert('#globalstatus', 'Unable to get inquiry.  Reason: ' + xhr.status + ':' + xhr.responseText + '.  Please verify your connection or server status.', 'trace');
        alert("Problem getting iqsets");
    }, success: function(data) {
        if (data) {
            var iqsets = data;
            var total_rows = data.total_rows;
            var rows = data.rows;
            globalViewModel.iqsetCollection.iqsets.removeAll(); // Remove all the sessions before we display more
            ko.utils.arrayPushAll(globalViewModel.iqsetCollection.iqsets, rows);

            if (cb) {
                cb();
            }
        }
    }
    });
}

function loadSessions(cb, params) {
    //
    // Ignore params
    //
    if (params) {
        // Do something
    }

    $.ajax({ cache: false, type: "GET", dataType: "json", url: '/smile/sessions', data: {}, error: function(xhr, text, err) {
        // TODO: XXX Decide what to do if this post fails
        // smileAlert('#globalstatus', 'Unable to get inquiry.  Reason: ' + xhr.status + ':' + xhr.responseText + '.  Please verify your connection or server status.', 'trace');
        alert("Problem getting iqsets");
    }, success: function(data) {

        if (data) {
            var total_rows = data.total_rows;
            var rows = data.rows;
            globalViewModel.sessionCollection.iqsessions.removeAll(); // Remove them all before we display a new set
            ko.utils.arrayPushAll(globalViewModel.sessionCollection.iqsessions, rows);

            if (cb) {
                cb();
            }
        }
    }
    });
}

function loadIQSet(evtdata, cb) {
    $.ajax({ cache: false, type: "GET", dataType: "json", url: '/smile/iqset/' + evtdata.attr('id'), data: {}, error: function(xhr, text, err) {
        // TODO: XXX Decide what to do if this post fails
        // smileAlert('#globalstatus', 'Unable to get inquiry.  Reason: ' + xhr.status + ':' + xhr.responseText + '.  Please verify your connection or server status.', 'trace');
        alert("Problem getting iqset " + evtdata.attr('id'));
    }, success: function(data) {
        if (data) {
            var iqsets = data;
            var total_rows = data.total_rows;
            var rows = data.rows;

            var fvm = globalViewModel.iqsetSummary;

            fvm.title(data.title);
            fvm.createdate(data.date);
            fvm.groupname(data.groupname);
            fvm.teachername(data.teachername);
            fvm.iqid(data._id);
            fvm.iqdata.removeAll();
            ko.utils.arrayPushAll(fvm.iqdata(), data.iqdata);
            fvm.iqdata.valueHasMutated();

            if (cb) {
                cb();
            }
        }
    }
    });
}

function loadSession(evtdata, cb) {
    $.ajax({ cache: false, type: "GET", dataType: "json", url: '/smile/session/' + evtdata.attr('id'), data: {}, error: function(xhr, text, err) {
        // TODO: XXX Decide what to do if this post fails
        alert("Problem getting session " + evtdata.attr('id'));
    }, success: function(data) {
        if (data) {
            // console.log(data);
            // ko.mapping.fromJS(data, globalViewModel.sessionSummary);
            globalViewModel.sessionSummary.sessionName(data.sessionName);
            globalViewModel.sessionSummary.iqdata.removeAll();
            ko.utils.arrayPushAll(globalViewModel.sessionSummary.iqdata, data.iqset);
            globalViewModel.sessionSummary.title(data.title);
            globalViewModel.sessionSummary.date(data.date);
            globalViewModel.sessionSummary.groupname(data.date);
            globalViewModel.sessionSummary.teachername(data.teachername);
            globalViewModel.sessionSummary._id(data._id);

            globalViewModel.sessionSummary.results.winnerScore(data.results.winnerScore);
            globalViewModel.sessionSummary.results.winnerRating(data.results.winnerRating);
            globalViewModel.sessionSummary.results.numberOfQuestions(data.results.numberOfQuestions);
            globalViewModel.sessionSummary.results.rightAnswers.removeAll();
            globalViewModel.sessionSummary.results.rightAnswers.removeAll();
            globalViewModel.sessionSummary.results.questionsCorrectPercentage.removeAll();
            ko.utils.arrayPushAll(globalViewModel.sessionSummary.results.rightAnswers, data.results.rightAnswers);
            ko.utils.arrayPushAll(globalViewModel.sessionSummary.results.averageRatings, data.results.averageRatings);
            ko.utils.arrayPushAll(globalViewModel.sessionSummary.results.questionsCorrectPercentage, data.results.questionsCorrectPercentage);
            
            globalViewModel.sessionSummary.sessionStats.numberOfStudents(data.sessionstats.numberOfStudents);
            globalViewModel.sessionSummary.sessionStats.numberOfQuestions(data.sessionstats.numberOfQuestions);
            globalViewModel.sessionSummary.sessionStats.numberOfStudentsPostingAnswers(data.sessionstats.numberOfStudentsPostingAnswers);

            globalViewModel.sessionSummary.sessionMetadata.teacherName(data.metadata.teacherName);
            globalViewModel.sessionSummary.sessionMetadata.groupName(data.metadata.groupName);
            globalViewModel.sessionSummary.sessionMetadata.iqid(data.metadata.iqid);
            globalViewModel.sessionSummary.sessionMetadata.iqtitle(data.metadata.iqtitle);
            
            if (data.students) {
                console.log("students found");
                globalViewModel.sessionSummary.students.removeAll();
                for (var student in data.students) {
                    console.log("push student: " + student);
                    globalViewModel.sessionSummary.students.push(data.students[student]);
                }
            }

            if (cb) {
                cb();
            }
        } else {
            console.log('no data');
        }
    }
    });
}

function pushSection(toID, fromID) {
    console.log("toID = " + toID);
    if (!fromID) {
        console.log("fromID is null");
        // Use toID and hide the active section
       var $from = $(toID).parent().find('section.active');
       if ($from) {
            fromID = $from.attr('id');
       }
    }
    console.log("found fromID = " + fromID);
    if (!toID) {
        console.log('toID is null');
        return;
    }
    $('#' + fromID).removeClass("active").fadeOut();
    $(toID).addClass("active").fadeIn();
}

var handleDialog1 = function(evtdata) {
    $('#dialog1-yes').click(function() { 

        // update the block message 
        $.blockUI({ message: "<h4 class='subheader'>Deleting IQSet: " + evtdata.attr('id') + "</h4>" }); 
 
        $.ajax({ cache: false, type: "DELETE", dataType: "json", url: '/smile/iqset/' + evtdata.attr('id'), data: {}, error: function(xhr, text, err) {
        // TODO: XXX Decide what to do if this post fails
        // smileAlert('#globalstatus', 'Unable to get inquiry.  Reason: ' + xhr.status + ':' + xhr.responseText + '.  Please verify your connection or server status.', 'trace');
            alert("Problem deleting iqset");
        }, success: function(data) {
            if (data) {
                /*
                var iqsets = data;
                var total_rows = data.total_rows;
                var rows = data.rows;

                ko.utils.arrayPushAll(globalViewModel.iqsetCollection.iqsets, rows);
                */
                if (data.error) {
                    // Let's write an error
                    $.blockUI({ message: 'Error deleting IQSet, reason: ' + data.error }); 
                } else {
                    // Delete the row in question from the model
                    var rowidx = evtdata.parent().parent().attr('id');
                    globalViewModel.iqsetCollection.iqsets.splice(rowidx, 1);
                    $.blockUI({ message: 'Success deleting IQSet'}); 
                }
            } else {
                $.blockUI({ message: 'Error, no data returned, probably did not work'}); 
            }
            setTimeout(function() {
                    $.unblockUI(); 
            }, 4000);
        }
        });
    }); 
 
    $('#dialog1-no').click(function() { 
            $.unblockUI(); 
            return false; 
    });
};

$(document).ready(function() {
    //
    // Init globals
    //
    ko.applyBindings(globalViewModel);

    //
    // Init handlers
    //
    createIQSetUploader(); // fineuploader for IQSets
    $('#iqsetupload_btn').click(function() { 
        $('#fine-uploader input:file').trigger('click');
    });

    //
    // Init UI
    //
    $('#app-version').append(VERSION);
    $('#iqsets-section').on('click', '.iqset-delete-btn', function() {
        // alert($(this).attr('id'));
        $.blockUI({ message: $('#dialog1'),
                    css: { width: '275px' },
                    onBlock: handleDialog1($(this))
        }); 
    });

    $('#iqsets-section').on('click', '.iqset-view-btn', function() {
        loadIQSet($(this), pushSection('#iqset-detail-section'));
    });

    $('#iqsetupload-summary').on('click', '.iqset-view-btn', function() {
        loadIQSet($(this), pushSection('#iqset-detail-section'));
        $('#iqsetupload-summary').foundation('reveal', 'close');
    });
 
    $('#sessions-section').on('click', '.session-view-btn', function() {
        loadSession($(this), pushSection('#session-detail-section'));
    });

    

});