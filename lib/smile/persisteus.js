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

//
// Thinking about this code - Persistius.js
// 
// We want an abstraction around the db to reduce the complexity of handling decisions about when to sync
// when to talk to a local instance or talk to a remote instance.  I believe the client api for persistius
// should seamlessly address the question of whether we are connected or not, and do the right thing.
// Probably we'll stick with a nice clean core api that handles this, and then the app developer would
// extend it per application
// 
// So after this first cut is done, it's due for an instant make over or toss out and start over
//
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
        'DBNAME' : 'smiledb',
        'DEBUG': true
    };

    if (this.CONFIG.DEBUG) {
        logger.debug("Running in debug mode, do not use in production");
        this.CONFIG.DBNAME = 'smiledb-test';
    }

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

//
// Add all built-in maps
//
var allsessionsmap = function allsessionsmap(doc) {
    if (doc.ducktype === 'sessiondoc' && doc.date && doc.sessionName) {
        //
        // We want the id, date as the key, and title as the value
        //
        // XXX TODO: we need to implement limit by date, or number of results, or results range
        // XXX TODO: ignore soft deletes
        // console.log('emit');
        emit(doc.date, [doc.sessionName, doc.metadata.teacherName, doc.metadata.groupName]);
    } /* else {
        console.log('no ducktype');
    } */
};

var alliqsetsmap = function alliqsetsmap(doc) {
    if (doc.ducktype === 'iqsetdoc') {
        //
        // We want the id, date as the key, and title as the value
        //
        // XXX TODO: we need to implement limit by date, or number of results, or results range
        // XXX TODO: ignore soft deletes
        emit(doc.date, [doc.title, doc.teachername, doc.groupname]);
    }
};

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

//
// XXX This isn't exactly what we want ...
// Ideally we want something equivalent to a drop all rows
// so probably we wnat to iterate over IQSets and Sessions
// I'd really like no one to ever do this, but instead, implement
// an 'archive' routine which compacts the data, making it still accessible
// but does not show up in the local results, instead, maybe we move it to an
// archive-snapshot db as a repilca set, and then dump all records from the current 
// db
Persisteus.prototype.emptyDB = function emptyDB() {
    logger.error("Unsafe method called, only use for testing");
    logger.debug("Destroying db[" + this.CONFIG.DBNAME +"]");
    PouchDB.destroy(this.CONFIG.DBNAME, function(err, info) {
        this.DB = new PouchDB(this.CONFIG.DBNAME);
        logger.debug("Recreated db[" + this.CONFIG.DBNAME + "]");
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

Persisteus.prototype.getAllSessions = function getAllSessions(daterange, numresults, resultsrange, cb) {
    //
    // XXX Todo, implement the filter criteria
    //
    this.DB.query({map: allsessionsmap}, {reduce: false, descending: true}, cb);
};

Persisteus.prototype.getSession = function getSession(sessionid, options, cb) {
    this.DB.get(sessionid, options, cb);
};

Persisteus.prototype.putSession = function putSession(sessiondoc, cb) {
    // console.log(sessiondoc);

    if (!sessiondoc._id) {
        sessiondoc._id = pouchdb.uuid();
    }


    if (!sessiondoc.ducktype) {
        sessiondoc.ducktype = "sessiondoc";
    } else {
        console.log('doc is already type sessiondoc');
    }

    if (!sessiondoc.date) {
        sessiondoc.date = new Date().toISOString(); // XXX TODO: Do we want ISO or UTC?
    }

    if (!sessiondoc.sessionName) {
        sessiondoc.sessionName = sessiondoc.date + " Session";
    }

    if (!sessiondoc.metadata.teacherName) {
        sessiondoc.metadata.teacherName = "Teacher";
    }

    if (!sessiondoc.metadata.groupName) {
        sessiondoc.metadata.groupName = "General";
    }

    this.DB.put(sessiondoc, cb);
};

Persisteus.prototype.getAllIQSets = function getAllIQSets(daterange, numresults, resultsrange, cb) {
    //
    // XXX Todo, implement the filter criteria
    //
    this.DB.query({map: alliqsetsmap}, {reduce: false, descending: true}, cb);
};

Persisteus.prototype.getIQSet = function getIQSet(iqsetid, options, cb) {
    this.DB.get(iqsetid, options, cb);
};

Persisteus.prototype.putIQSet = function putIQSet(iqdoc, cb) {
    if (!iqdoc._id) {
        iqdoc._id = pouchdb.uuid();
    }

    if (!iqdoc.ducktype) {
        iqdoc.ducktype = "iqsetdoc";
    }

    if (!iqdoc.date) {
        iqdoc.date = new Date().toISOString();
    }

    if (!iqdoc.title) {
        iqdoc.title = iqdoc.date + "-IQSet";
    }

    if (!iqdoc.teachername) {
        iqdoc.teachername = "Teacher";
    }

    if (!iqdoc.groupname) {
        iqdoc.groupname = "General";
    }

    // 'iqdata' - We should check for tis in the payload
    
    this.DB.put(iqdoc, cb);
};

Persisteus.prototype.deleteIQSet = function deleteIQSet(iqdoc, options, cb) {
    //
    // XXX TODO: Turn this into soft delete
    // Note, we must have the revision id and the doc _id
    this.DB.remove(iqdoc, options, cb);
};

persisteus.Persisteus = Persisteus;


var Result = function Result() {
    this.status = 0;
    this.message = "";
    this.reason = "";
};
