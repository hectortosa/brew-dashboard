module.exports = function (context, userPreference) {
    context.bindings.preferences = JSON.stringify({
        id: userPreference.email,
        preferences: userPreference.preferences
    });

    context.bindings.response = {
        status: 202,
        body: 'User preference processed'
    };

    context.done();
};