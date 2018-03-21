var request = require('request-promise-native');
var emoji = require('node-emoji').emoji;

var telegramUrl = 'https://api.telegram.org/bot';
var token = '<your_token>';

var AppSync = {
    "url": "<app_sync_api_url>",
    "region": "<app_sync_region>",
    "authenticationType": "API_KEY",
    "apiKey": "<app_sync_api_key>"
};

function getSettingsQuery(user) {
    return `
    query {
      getUser(email: "${user}") {
            email
            name
            settings {
                maxTempThreshold
                minTempThreshold
            }
        }
    }
  `;
}

function sendMessage(to, text) {
    return request.post('' + telegramUrl + token + '/sendmessage', {
        form: {
            'chat_id': to,
            'text': text
        }
    });
}

function findUser(chatId, storage) {
    return new Promise(function(resolve, reject) {
        storage.get(function(error, data) {
            if (error) {
                reject(error);
                return;
            }
            data = data || {};

            var users = data.users || [];
            var user = users.find(function(element) {
                return element.chatId === chatId;
            });

            resolve(user);
        });
    });
}

function addUser(chatId, email, storage) {
    return new Promise(function(resolve, reject) {
        storage.get(function(error, data) {
            if (error) {
                reject(error);
                return;
            }
            data = data || {};

            var users = data.users || [];
            users.push({
                chatId: chatId,
                email: email
            });

            storage.set({
                users: users
            }, function(err) {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });


        });
    });
}

function removeUser(chatId, storage) {
    return new Promise(function(resolve, reject) {
        storage.get(function(error, data) {
            if (error) {
                reject(error);
                return;
            }
            data = data || {};

            var users = data.users || [];
            var index = users.findIndex(function(element) {
                return element.chatId === chatId;
            });

            if (index !== -1) {
                users.splice(index, 1);

                storage.set({
                    users: users
                }, function(err) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();
                });
            }

        });
    });
}

function process(data, storage) {
    var text = data.text;
    var chatId = data.chat.id;
    var firstName = data.from['first_name'];
    var operation;

    switch (true) {
        case /hi|hello/i.test(text):
            operation = sendMessage(chatId, 'Hi there :)');
            break;
        case /\/start/.test(text):
            operation = sendMessage(chatId, 'Greetings! I can get brew data for you. Enjoy ' + emoji.blush);
            break;
        case /\/login/.test(text):
            operation = findUser(chatId, storage)
                .then(function(user) {
                    if (user) {
                        return sendMessage(chatId, 'You are already registered!');
                    } else {
                        var email = text.trim().split(' ')[1];
                        return addUser(chatId, email, storage).then(function() {
                            return sendMessage(chatId, 'You have been registered!')
                        })
                    }
                });
            break;
        case /\/logout/.test(text):
            operation = findUser(chatId, storage)
                .then(function(user) {
                    if (!user) {
                        return sendMessage(chatId, 'You are not logged in, nothing to do.');
                    } else {
                        return removeUser(chatId, storage).then(function() {
                            return sendMessage(chatId, 'You have been unregistered!')
                        })
                    }
                });
            break;
        case /\/settings/.test(text):

            operation = findUser(chatId, storage)
                .then(function(user) {
                    if (user) {
                        return request
                            .post(AppSync.url, {
                                json: true,
                                body: {
                                    query: getSettingsQuery(user.email)
                                },
                                headers: {
                                    'x-api-key': AppSync.apiKey
                                }
                            })
                            .then(function(result) {
                                var msg = '';
                                if (result.data.getUser == null) {
                                    msg = 'You are not registered in brew dashboard!';
                                } else {
                                    var settings = result.data.getUser.settings;

                                    if (settings) {
                                        msg = `Your settings are minTemp = ${settings.minTempThreshold}, maxTemp = ${settings.maxTempThreshold}`;
                                    } else {
                                        msg = 'You don\'t have settings';
                                    }
                                }


                                return sendMessage(chatId, msg);
                            })
                    } else {
                        return sendMessage(chatId, 'You must login before gettings your settings.')
                    }
                })
                .catch(function(err) {
                    console.log(err);
                });
            break;
        default:
            operation = sendMessage(chatId, 'Sorry, I cannot understand your request.');
    }

    return operation;
}

module.exports = function(ctx, cb) {
    var success = true;
    var message = '';
    process(ctx.body.message, ctx.storage).catch(function(e) {
        message = e;
        return success = false;
    }).then(function() {
        return cb(null, {
            success: success,
            message: message
        });
    });
};
