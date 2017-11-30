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

    if (!request.body.preferences) {
        error = new Error('Unexpected payload: Missing preferences');
        return response(error);
    }

    preferences = request.body.preferences;

    MongoClient.connect(url, function(err, db) {
        if (!err) {
            insertPreferences(email, preferences, db, function (err, result) {
                if (!err) {
                    response(null, { email: email, preferences: preferences });
                }
                db.close();
            });
        }
        else {
            db.close();
            error = new Error('Error storing document');            
            return response(error);
        }
    });
};

function insertPreferences(email, preferences, db, callback) {
    // Get the documents collection
    var collection = db.collection('user-preferences');
    // Insert some documents
    collection.findOneAndUpdate(
        { email: email },
        { $set: { preferences: preferences }},
        { upsert: true }, function (err, result) {
            callback(err, result);
        });
}