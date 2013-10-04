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
var pouchdb = require('pouchdb');
var winston = require('winston');
var fs = require('fs');

var persisteus = exports;

var Persisteus = function Persisteus() {
    this.CONFIG = {
        'REMOTE_PORT' : process.env.PORT || 8000,
        'REMOTE_HOST' : '0.0.0.0',
        'REMOTE_SYNC_URL' : 'http://localhost:5984/smiledb',
        'VERSION_TAG' : '0.0.1',
        'VERSION_DESCRIPTION' : 'Persisteus, an abstraction for your couches',
        'DBNAME' : 'smiledb'
    };

    this.DB = new PouchDB(this.CONFIG.DBNAME);
};

// XXX Make this configurable, and roll it into the object
var logger = new (winston.Logger) ({
    transports: [
        new (winston.transports.Console)({
            colorize: true,
            timestamp: true,
            level: 'info'
        })
    ]
});

/**
    XXX We may want to consider keeping this private

    @method getDB()
**/
Persisteus.prototype.getDB = function getDB() { 
    return this.DB;
};

Persisteus.prototype.getConfig = function getConfig() {
    return this.CONFIG;
};

Persisteus.prototype.logInfo = function logInfo() {
    this.DB.info(function(err, info) {
        if (!err) {
            logger.debug(info);
        } else {
            logger.error("No info avalable");
        }
    });
};

Persisteus.prototype.exportDocs = function exportDocs(exportpath, cb) {
    this.DB.allDocs({include_docs: true}, function(err, response) {
        console.log(response);
        logger.debug('Writing ' + response.total_rows + " to " + exportpath);
        /*
        response.rows.forEach(function(record) {
            console.log(record.doc);
        }); */
        // console.log(doc);

        // XXX Does stringify have a problem beyond a certain size?  If so, should we just
        // stream out the data?

        // XXX Note, this is destructive ... overwrites
        fs.writeFile(exportpath, JSON.stringify(response.rows), function (err) {
            if (err) {
              logger.error('There has been an error exporting docs.');
              logger.error(err.message);
              return;
            }
            logger.debug('Export of docs successful');
            cb(err, response);
        });
    });
};

Persisteus.prototype.getSession = function getSession(sessionid, options, cb) {
    this.DB.get(sessionid, options, cb);
};

Persisteus.prototype.putSession = function putSession(sessiondoc, cb) {
    if (!sessiondoc._id) {
        sessiondoc._id = pouchdb.uuid();
    }

    this.DB.put(sessiondoc, cb);
};

persisteus.Persisteus = Persisteus;

var Result = function Result() {
    this.status = 0;
    this.message = "";
    this.reason = "";
};
