'use strict';

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://brew-dashboard:on9J7xNJh6TmWriDKOKj9BOLvDAp7E3S7IvsnIW4Van9jw5tPWRkaadZCPUdDsMEE7q0apjpqLWq5oMJHyR4Ww==@brew-dashboard.documents.azure.com:10255/brew-dashboard?ssl=true';

module.exports = function(request, response) {
    var error,
        email,
        preferences;

    if (!request.body.email) {
        error = new Error('Unexpected payload: Missing email');
        return response(error);
    }

    email = request.body.email;

    MongoClient.connect(url, function(err, db) {
        if (!err) {
            getPreferences(email, db, function (err, result) {
                if (err !== null) {
                    if (result !== null) {
                        response(null, { preferences: result.preferences });
                    }
                    else {
                        response(new Error('Document not found'));
                    }
                }
                else {
                    response(null, new Error('Error fetching document'));
                }
                db.close();
            });
        }
        else {
            db.close();            
            return response(new Error('Error connecting to database'));
        }
    });
};

function getPreferences(email, db, callback) {
    db.collection('user-preferences')
        .findOne({ email: email }, function (err, doc) {
            callback(err, doc);
        });
}