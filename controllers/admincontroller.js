

var app = require('../app')
var db = require('../routes/database')

exports.init = function(req, res) {
    var createStr = 'CREATE TABLE IF NOT EXISTS admin ( \
        user_id    TEXT PRIMARY KEY    NOT NULL, \
        user_name  TEXT                NOT NULL \
     ); '
    var create = db.pgQuery(createStr);
    create.then(function(_) {

        var results = db.pgQuery('SELECT * FROM admin')
        results.then(function(queryValue){

            let user_id = '\'' + req.body.user_id + '\''
            let user_name = '\'' + req.body.user_name + '\''
            let team_domain = req.body.team_domain
             if(queryValue.rowCount == 0) {
                var insertStr =  'INSERT INTO admin (user_id, user_name) values('+ user_id + ',' + user_name + ')'
                var insert = db.pgQuery(insertStr)
                insert.then(function(insertValue) {

                    res.send('Success: Worksapce ' + team_domain + '\'s new app \'Happiness Level\' init success!')

                })
            } else {
                res.send('Error: Workspace ' + team_domain + ' already init!')
            }

        });
        
    });

    

    
    
}

// {"token":"NoLDQeFvLs2uJmXkbrc1jlEv","team_id":"TCSEYGNKW","team_domain":"sdm-6","channel_id":"GCTJDNRA5","channel_name":"privategroup","user_id":"UCSLXUNRG","user_name":"ioswpf","command":"/init","text":"","response_url":"https://hooks.slack.com/commands/TCSEYGNKW/441441585712/ks8147qG9BaAcmdCI0qaNNbJ","trigger_id":"441581991553.434508566676.747ed520202d5c75a011b6205132d274"}

// {"token":"NoLDQeFvLs2uJmXkbrc1jlEv","team_id":"TCSEYGNKW","team_domain":"sdm-6","channel_id":"GCTJDNRA5","channel_name":"privategroup","user_id":"UCSLXUNRG","user_name":"ioswpf","command":"/init","text":"@ioswpf","response_url":"https://hooks.slack.com/commands/TCSEYGNKW/442073194851/mcrrmvkTpBbJAFXfRMHmm6oz","trigger_id":"442176950850.434508566676.64c034ded49a0a5238acaa808c9ab6fe"}