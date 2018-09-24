

exports.init = function(req, res) {
    res.send(JSON.stringify(req.body));
}