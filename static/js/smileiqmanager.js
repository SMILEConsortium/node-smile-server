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
    // XXX Should generalize the app view model to wrap the required child models and use :with binding
    function viewModel() {
        var self = this;
        self.title = ko.observable("");
        self.createdate = ko.observable("");
        self.groupname = ko.observable("");
        self.teachername = ko.observable("");
        self.iqid = ko.observable("");
        self.iqdata = ko.observableArray(["foo"]);
        self.boo = ko.observable(4);
        self.bbb = ko.computed(function() {
            return this.boo() + " " + this.boo();
        }, this);
        self.foo = ko.computed(function() {
            var self = this;
            return self.boo() + self.boo();
        }, this);

        self.questionscount = ko.computed(function() {
            // Knockout tracks dependencies automatically
            return self.iqdata().length;
            if (self.iqdata) {
                return self.iqdata.length;
            } else {
                return 0;
            }
        }).extend({ notify: 'always' });
    }


    var fvm = new viewModel();

    ko.applyBindings(fvm);
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
    console.log(fvm.foo());
    console.log(fvm.iqdata()[0]);
    $('#iqsetupload-summary').foundation('reveal', 'open');
}

$(document).ready(function() {
    //
    // Init globals
    //

    //
    // Init handlers
    //
    createIQSetUploader(); // fineuploader for IQSets
    $('#iqsetupload_btn').click(function() { 
        $('#fine-uploader input:file').trigger('click');
    });

});