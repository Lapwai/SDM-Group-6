

var app = require('../app')
var db = require('../routes/database')
var request = require('request')

exports.init = function(req, res) {
    var results = db.pgQuery('SELECT * FROM admin')
        results.then((queryValue) => {

            var user_id = '\'' + req.body.user_id + '\''
            var user_name = '\'' + req.body.user_name + '\''
            var team_domain = req.body.team_domain
             if(queryValue.rowCount == 0) {
                var insertStr =  'INSERT INTO admin (user_id, user_name) VALUES('+ user_id + ',' + user_name + ')'
                var insert = db.pgQuery(insertStr)
                insert.then((insertValue) => {
                    res.send('Success: Worksapce ' + team_domain + '\'s new app \'Happiness Level\' init success!')
                })
            } else {
                res.send('Error: Workspace ' + team_domain + ' already init!')
            }

        });
    
}


exports.add = function(req, res) {
    var isAdmin = varifyAdmin(req.body.user_id);
    isAdmin.then((value) => {
        if(value[0] === false) {
            res.send(isAdmin[1]);
            return
        }

        var params = req.body.text.split(' ')
        if(params.length < 2) {
            res.send('Error: Please input correct command!')
            return
        }
    
        var role = params[0]
        if(role !== 'researcher' && role !== 'manager') {
            res.send('Error: Please input correct role!');
            return
        }

        params.splice(0,1)
        var url = 'https://slack.com/api/users.list?token=xoxp-434508566676-434711974866-442202130610-8bdf8c7649e31d9d0c3f67fa615bb132'
        request(url, { json: true }, (err, response, body) => {
            if(err) res.send(err);

            var dict = []

            var members = body['members']
            members.forEach((element) => {
                params.forEach( (para) => {
                    if(para.substring(1) == element['name']) {
                        let temp = [element['id'],element['name']]
                        var display_name = element['profile']['display_name']
                        if(display_name.length == 0) {
                            temp.push(element['profile']['real_name'])
                        } else {
                            temp.push(display_name)
                        }
                        dict.push(temp)
                        return
                    }
                })
            });

            var insertStr = 'INSERT INTO roles(user_id, user_name, real_name, role) VALUES '
            dict.forEach( (e) => {
                insertStr = insertStr + '(\'' + e[0] + '\',\'' + e[1] + '\',\'' + e[2] + '\',\'' + role + '\'), '
            })
            insertStr = insertStr.substring(0, insertStr.length-2)
            var insert = db.pgQuery(insertStr)
            insert.then((insertValue) => {
                res.send('Success: Add success!');
            })
        })
        
    })
}

exports.delete = function(req, res) {
    // var isAdmin = varifyAdmin();
    // if(isAdmin[0] === false) {
    //     res.send(isAdmin[1]);
    //     return
    // }
}

exports.list = function(req, res) {
    var isAdmin = varifyAdmin(req.body.user_id);
    isAdmin.then((value) => {
        if(value[0] === false) {
            res.send(isAdmin[1]);
            return
        }
        var text = req.body.text
        if(text !== 'researcher' && text !== 'manager') {
            res.send('Error: Please input correct role!');
            return
        }
        var selectStr = 'SELECT * FROM roles WHERE role=\''+ text +'\';';
        var select = db.pgQuery(selectStr)
        select.then((selectValue) => {
            var names = ''
            selectValue.rows.forEach((e) => {
                names = names + e['real_name'] + '\n'
            })
            var responseObject = {
                'attachments': [
                    {
                        'pretext': 'List result - ' + text,
                        'text': names ,
                        'mrkdwn_in': [
                            'text',
                            'pretext'
                        ]
                    }
                ]
            }

            res.send(JSON.stringify(responseObject));
        })
    })
}

function varifyAdmin(user_id) {
    var results = db.pgQuery('SELECT user_id FROM admin')
    if(results.rowCount == 0) {
        return new Promise.resolve([false, 'Error: Workspace needs init first!'])
    } else {
        return results.then((value) => {
            if(user_id !== value.rows[0]['user_id']) {
                return [false, 'Error: Only Admin can handle this command!']
            } else {
                return [true]
            }
        })
    }

}


// {"token":"NoLDQeFvLs2uJmXkbrc1jlEv","team_id":"TCSEYGNKW","team_domain":"sdm-6","channel_id":"GCTJDNRA5","channel_name":"privategroup","user_id":"UCSLXUNRG","user_name":"ioswpf","command":"/init","text":"","response_url":"https://hooks.slack.com/commands/TCSEYGNKW/441441585712/ks8147qG9BaAcmdCI0qaNNbJ","trigger_id":"441581991553.434508566676.747ed520202d5c75a011b6205132d274"}

// {"token":"NoLDQeFvLs2uJmXkbrc1jlEv","team_id":"TCSEYGNKW","team_domain":"sdm-6","channel_id":"GCTJDNRA5","channel_name":"privategroup","user_id":"UCSLXUNRG","user_name":"ioswpf","command":"/init","text":"@ioswpf","response_url":"https://hooks.slack.com/commands/TCSEYGNKW/442073194851/mcrrmvkTpBbJAFXfRMHmm6oz","trigger_id":"442176950850.434508566676.64c034ded49a0a5238acaa808c9ab6fe"}