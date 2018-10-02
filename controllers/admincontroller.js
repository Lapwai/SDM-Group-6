const app = require('../app')
const db = require('../routes/database')
const request = require('request')
const textRes = require('./textresponse')






exports.init = function(req, res) {
    let results = db.pgQuery('SELECT * FROM admin')
        results.then((queryValue) => {

            let user_id = '\'' + req.body.user_id + '\''
            let user_name = '\'' + req.body.user_name + '\''
            let team_domain = req.body.team_domain
             if(queryValue.rowCount == 0) {
                let insertStr =  'INSERT INTO admin (user_id, user_name) VALUES('+ user_id + ',' + user_name + ')'
                let insert = db.pgQuery(insertStr)
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
    let isAdmin = verifyAdmin(req.body.user_id);
    isAdmin.then((value) => {
        let users = req.body.text.split(' ').map( str => {
            return str.trim()
        })
        let role = users[0]
        let verify = addVerifyParams(users)
        if(verify[0] == false) {
            textRes.textRes(res,true,verify[1])
            return
        }
        users.splice(0,1)

        addRequestMembers().then((members) => {
            let insertStr = addGenerateSql(role, users, members)
            let insert = db.pgQuery(insertStr)
            insert.then((insertValue) => {
                textRes.textRes(res,false,'Add success!')
            }).catch((err) => {
                textRes.textRes(res,true,err)
            })
        }).catch(err => {
            textRes.textRes(res,true,err)
        })
    }).catch(err => {
        textRes.textRes(res,true,err)
    })
}
function addVerifyParams(users) {
    let role = users[0]
    if(users.length < 2 || (role !== 'researcher' && role !== 'manager')) {
        return [false, 'Please input correct command! \n _/admin_add researcher/manager @user1 @user2 ... _']
    }
    return [true, '']
}
function addRequestMembers() {
    return new Promise((resolve, reject) => {
        let options = {
            url: 'https://slack.com/api/users.list?token=xoxa-2-434508566676-445609127334-444065434292-a41d63c89c65b7a2a9bacc9bfe61faa4&scope=users:read',
            headers: {
                'User-Agent': 'SDM Test'
            }
        };
        request(options, (err, _, body) => {
            let result = {}
            if((typeof body) === 'string') {
                result = JSON.parse(body)
            } else {
                result = body
            }
            if(err || result['error']) {
                textRes.textRes(res,true,(err || result['error']))
                reject(err || result['error'])
            }
            let dict = []
            let members = result['members']
            resolve(members)
        })
    })
    
}
function addGenerateSql(role, users, members) {
    var dict = []
    for(let i = 0; i<members.length; i++) {
        for(let j = 0; j<users.length; j++) {
            if(users[j].substring(1) == members[i]['name']) {
                let temp = [members[i]['id'],members[i]['name']]
                let display_name = members[i]['profile']['display_name']
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
    let insertStr = 'INSERT INTO roles(user_id, user_name, real_name, role) VALUES '
    
    dict.forEach( (e) => {
        insertStr = insertStr + '(\'' + e[0] + '\',\'' + e[1] + '\',\'' + e[2] + '\',\'' + role + '\'),'
    })

    insertStr = insertStr.substring(0, insertStr.length-1) + ';'
    return insertStr
}





exports.delete = function(req, res) {
    let isAdmin = verifyAdmin(req.body.user_id);
    isAdmin.then((value) => {
        let users = req.body.text.split(' ')
        let deleteStr = deleteGenerateSql(users)

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
function deleteGenerateSql(users) {
    let deleteStr = 'DELETE FROM roles WHERE user_name IN ('
    for(let i = 0; i<users.length; i++) {
       let user_name = users[i].substring(1)
       deleteStr = deleteStr.concat('\'', user_name, '\'', ',')
    }
    deleteStr = deleteStr.substring(0, deleteStr.length-1).concat(');')
    return deleteStr
}






exports.list = function(req, res) {
    let isAdmin = verifyAdmin(req.body.user_id);
    isAdmin.then((value) => {
        let text = req.body.text.trim()
        if(text !== 'researcher' && text !== 'manager') {
            textRes.textRes(res,true,'Please input correct role! \n _/admin_list researcher/manager_')
            return
        }
        let selectStr = 'SELECT * FROM roles WHERE role=\''+ text +'\';';
        let select = db.pgQuery(selectStr)

        select.then((selectValue) => {
            let names = ''
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
        let results = db.pgQuery('SELECT user_id FROM admin;')
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