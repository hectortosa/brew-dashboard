module.exports = function (context, request, readings) {
    context.bindings.response = {
        body: readings[0]
    };
    context.done();
};