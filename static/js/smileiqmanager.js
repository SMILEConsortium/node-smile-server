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

var VERSION = '0.0.1';

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

var globalViewModel = {
    iqsetSummary: new iqsetSummaryModel(),
    iqsetCollection: new iqsetsModel()
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
            itemLimit: 1
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

            ko.utils.arrayPushAll(globalViewModel.iqsetCollection.iqsets, rows);

            if (cb) {
                cb();
            }
        }
    }
    });

}

function pushSection(toID, fromID) {
    if (!fromID) {
        console.log("fromID is null");
        // Use toID and hide the active section
       var $from = $(toID).parent().find('section.active');
       if ($from) {
            fromID = $from.attr('id');
       }
    }
    console.log("found fromID = " + fromID);
    $('#' + fromID).removeClass("active").fadeOut();
    $(toID).addClass("active").fadeIn();
}

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
});