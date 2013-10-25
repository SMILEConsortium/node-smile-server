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
    var viewModel = {
        title: ko.observable(""),
        createdate: ko.observable(""),
        groupname: ko.observable(""),
        teachername: ko.observable(""),
        iqid: ko.observable(""),
        iqdata: ko.observableArray([]),
        questionscount: ko.computed(function() {
            // Knockout tracks dependencies automatically
            var self = this;
            if (self.iqdata) {
                return self.iqdata.length;
            } else {
                return 0;
            }
        }, self)
    };

    viewModel.title(resp.title);
    viewModel.createdate(resp.date);
    viewModel.groupname(resp.groupname);
    viewModel.teachername(resp.teachername);
    viewModel.iqid(resp._id);
    viewModel.iqdata(resp.iqdata);

    ko.applyBindings(viewModel);
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