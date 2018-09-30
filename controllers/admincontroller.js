

var app = require('../app')
var db = require('../routes/database')
var request = require('request')
var textRes = require('./textresponse')

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
                    textRes.textRes(res,false,'Worksapce ' + team_domain + '\'s new app \'Happiness Level\' init success!')
                }).catch((err) => {
                    textRes.textRes(res,true,err)
                })
            } else {
                textRes.textRes(res,true,'Workspace ' + team_domain + ' already init!')
            }

        });
    
}


exports.add = function(req, res) {
    var isAdmin = verifyAdmin(req.body.user_id);
    isAdmin.then((value) => {
        var users = req.body.text.split(' ')
        var role = users[0]
        if(users.length < 2 || (role !== 'researcher' && role !== 'manager')) {
            textRes.textRes(res,true,'Please input correct command! \n _/admin_add researcher/manager @user1 @user2 ... _')
            return
        }

        users.splice(0,1)
        var options = {
            url: 'https://slack.com/api/users.list?token=xoxa-2-434508566676-445609127334-444065434292-a41d63c89c65b7a2a9bacc9bfe61faa4&scope=users:read',
            headers: {
                'User-Agent': 'SDM Test'
            }
        };

        request(options, (err, _, body) => {
            var result = {}
            if((typeof body) === 'string') {
                result = JSON.parse(body)
            } else {
                result = body
            }
            if(err || result['error']) {
                textRes.textRes(res,true,(err || result['error']))
                return
            }
            
            var dict = []
            var members = result['members']
            
            for(let i = 0; i<members.length; i++) {
                for(let j = 0; j<users.length; j++) {
                    if(users[j].substring(1) == members[i]['name']) {
                        let temp = [members[i]['id'],members[i]['name']]
                        var display_name = members[i]['profile']['display_name']
                        if(display_name.length == 0) {
                            temp.push(members[i]['profile']['real_name'])
                        } else {
                            temp.push(display_name)
                        }
                        dict.push(temp)
                        break;
                    }
                }
            }

            if(dict.length === 0) {
                textRes.textRes(res,true,'Did not find the member!')
                return
            }

            var insertStr = 'INSERT INTO roles(user_id, user_name, real_name, role) VALUES '
            dict.forEach( (e) => {
                insertStr = insertStr + '(\'' + e[0] + '\',\'' + e[1] + '\',\'' + e[2] + '\',\'' + role + '\'),'
            })
            insertStr = insertStr.substring(0, insertStr.length-1)

            var insert = db.pgQuery(insertStr)
            insert.then((insertValue) => {
                textRes.textRes(res,false,'Add success!')
            }).catch((err) => {
                textRes.textRes(res,true,err)
            })
        })
    }).catch(err => {
        textRes.textRes(res,true,err)
    })
}

exports.delete = function(req, res) {
    var isAdmin = verifyAdmin(req.body.user_id);
    isAdmin.then((value) => {
        var users = req.body.text.split(' ')
        var deleteStr = 'DELETE FROM roles WHERE user_name IN ('

        for(let i = 0; i<users.length; i++) {
           let user_name = users[i].substring(1)
           deleteStr = deleteStr.concat('\'', user_name, '\'', ',')
        }
        deleteStr = deleteStr.substring(0, deleteStr.length-1).concat(');')
        let result = db.pgQuery(deleteStr)

        result.then( (deleteValue) => {
            textRes.textRes(res,false,'Delete success!')
        }).catch( (err) => {
            textRes.textRes(res,true,err)
        })
    }).catch(err => {
        textRes.textRes(res,true,err)
    })
}

exports.list = function(req, res) {
    var isAdmin = verifyAdmin(req.body.user_id);
    isAdmin.then((value) => {
        var text = req.body.text.trim()
        if(text !== 'researcher' && text !== 'manager') {
            textRes.textRes(res,true,'Please input correct role! \n _/admin_list researcher/manager_')
            return
        }
        var selectStr = 'SELECT * FROM roles WHERE role=\''+ text +'\';';
        var select = db.pgQuery(selectStr)

        select.then((selectValue) => {
            var names = ''
            selectValue.rows.forEach((e) => {
                names = names + e['real_name'] + '\n'
            })
            textRes.textRes(res,false,'*'+ text.substring(0,1).toUpperCase()+text.substring(1) + ': *\n' + names)
        }).catch((err) => {
            textRes.textRes(res,true,err)
        })
    }).catch(err => {
        textRes.textRes(res,true,err)
    })
}

function verifyAdmin(user_id) {
    return new Promise((resolve, reject) => {
        var results = db.pgQuery('SELECT user_id FROM admin;')
        results.then( value => {
            if(value.rowCount === 0) {
                reject('Workspace needs init first!')
            } else {
                if(user_id !== value.rows[0]['user_id']) {
                    reject('Only Admin can handle this command!')
                } else {
                    resolve('')
                }
            }
        }).catch(error => {
            reject(error)
        })
    })
}


// {"token":"NoLDQeFvLs2uJmXkbrc1jlEv","team_id":"TCSEYGNKW","team_domain":"sdm-6","channel_id":"GCTJDNRA5","channel_name":"privategroup","user_id":"UCSLXUNRG","user_name":"ioswpf","command":"/init","text":"","response_url":"https://hooks.slack.com/commands/TCSEYGNKW/441441585712/ks8147qG9BaAcmdCI0qaNNbJ","trigger_id":"441581991553.434508566676.747ed520202d5c75a011b6205132d274"}

// {"token":"NoLDQeFvLs2uJmXkbrc1jlEv","team_id":"TCSEYGNKW","team_domain":"sdm-6","channel_id":"GCTJDNRA5","channel_name":"privategroup","user_id":"UCSLXUNRG","user_name":"ioswpf","command":"/init","text":"@ioswpf","response_url":"https://hooks.slack.com/commands/TCSEYGNKW/442073194851/mcrrmvkTpBbJAFXfRMHmm6oz","trigger_id":"442176950850.434508566676.64c034ded49a0a5238acaa808c9ab6fe"}