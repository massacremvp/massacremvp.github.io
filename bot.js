var fs = require('fs');
const Discord = require('discord.js');
var asciitable = require("asciitable");
const { Pool } = require('pg');
var mvpList = [];



const helpMessage =
"Usage:\n \
    !track mvp_name [minutes_ago]\n \
where\n \
    mvp_name is the mvp name or part of its name\n \
    minutes_ago is optional and means how many minutes ago the mvp is dead.\n \
\n \
Examples:\n \
    INPUT: !track dracula\n \
    OUTPUT: Dracula (gef_dun01) in 60 to 70 minutes.\n \
\n \
    INPUT: !track dracula 20\n \
    OUTPUT: Dracula (gef_dun01) in 40 to 50 minutes.";

var config = {
  databaseUrl: process.env.DATABASE_URL,
  botUserToken: process.env.BOT_USER_TOKEN,
  mvpListChannelName: process.env.MVP_LIST_CHANNEL_NAME,
  mvpAliveExpirationTimeMins: process.env.MVP_ALIVE_EXPIRATION_TIME_MINS,
  mvpListRefreshRateSecs: process.env.MVP_LIST_REFRESH_RATE_SECS,
  maxSelectionTimeSecs: process.env.MAX_SELECTION_TIME_SECS,
  notifySoundFile: process.env.NOTIFY_SOUND_FILE,
  miningListChannelName: process.env.MINING_LIST_CHANNEL_NAME,
};

var guildMap = new Map();
const discordClient = new Discord.Client();

const asciiTableOptions = {
  skinny: true,
  intersectionCharacter: "x",
  columns: [
    {field: "name", name: "Name"},
    {field: "map", name: "Map"},
    {field: "respawn", name: "Respawn"},
  ],
};

const pgPool = new Pool({connectionString: config.databaseUrl});


// mining

var miningMapList = [];

const miningAsciiTableOptions = {
  skinny: true,
  intersectionCharacter: "x",
  columns: [
    {field: "map", name: "Map"},
    {field: "respawn", name: "Respawn"},
  ],
};

function findMiningMap(query) {
  let resultSet = new Set();
  for (let miningMap of miningMapList) {
    if ((miningMap["map"]).toLowerCase().startsWith(query.toLowerCase())) {
      resultSet.add(miningMap);
    }
  }
  return resultSet;
}

function updateMiningTime(guildState, miningMap, minsAgo, channel, trackTime) {
  if (miningMap != null) {
    pgPool.connect().then(pgClient => {
      const selectSql = {
        text: 'SELECT * FROM mining_map_guild WHERE id_mining_map=$1 AND id_guild=$2',
        values: [miningMap.id, guildState.id],
      };
      return pgClient.query(selectSql).then(res => {
        let insrtOrUpdtSql = 'INSERT INTO mining_map_guild(id_mining_map,id_guild,track_time)VALUES($1,$2,$3)';
        if (res.rowCount > 0) {
          insrtOrUpdtSql = 'UPDATE mining_map_guild SET track_time=$3 WHERE id_mining_map=$1 AND id_guild=$2';
        }
        pgClient.query(insrtOrUpdtSql, [miningMap.id, guildState.id, trackTime]).then(res => {
          pgClient.release();
        })
      });
    });

    let miningMapState = miningTrackAux(guildState, miningMap, minsAgo);
    refreshMiningMapList(guildState);
    return `${miningMapState.miningMap.map} in ${miningMapState.r1} minutes.`;
  }
}

function miningTrackAux(guildState, miningMap, minsAgo) {
  let miningMapState = guildState.miningMapList.find(miningMapState => miningMapState.miningMap === miningMap);
  if (!miningMapState) {
    miningMapState = {miningMap: miningMap};
    guildState.miningMapList.push(miningMapState);
  }
  miningMapState.r1 = 30 - minsAgo;
  guildState.miningMapList.sort(function(a, b){
    if(a.r1 > b.r1) {
      return 1;
    }
    if(a.r1 < b.r1) {
      return -1;
    }
    if(a.r1 === b.r1) {
      return 0;
    }
  });
  return miningMapState;
}

function refreshMiningMapList(guildState){
  let list = [];
  for (let miningMapState of guildState.miningMapList) {
    if (!miningMapState.r1 && miningMapState.r1 != 0) {
      miningMapState.r1 = -999;
    }
    if (miningMapState.r1 > -20){
      let respawn = `${Math.round(miningMapState.r1)} mins`;
      list.push({map: fill(miningMapState.miningMap.map,10), respawn: fill(respawn,18)});
    } else {
      guildState.miningMapList.splice(guildState.miningMapList.indexOf(miningMapState), 1);
    }
  }
  let result = "";
  if (list.length > 0) {
    let table = asciitable(miningAsciiTableOptions, list);
    result += "MINING MAPS\n"+table;
  }
  if (list.length == 0) {
    result = "No mining maps have been tracked.";
  }
  guildState.miningMapListMessage.edit(fmtMsg(result));
}

function prepareMiningMapListMsg(message){
  let guildState = guildMap.get(message.guild.id);
  guildState.miningMapListMessage = message;
  refreshMiningMapList(guildState);
  discordClient.setInterval(function(){
    refreshMiningMapList(guildState);
    for (let miningMapState of guildState.miningMapList) {
      miningMapState.r1 -= config.mvpListRefreshRateSecs/60;
    }
  }, config.mvpListRefreshRateSecs*1000);
}






// mvp

function findMvp(query) {
  let resultSet = new Set();
  for (let mvp of mvpList) {
    if ((mvp["name"]+" "+mvp["map"]).toLowerCase().startsWith(query.toLowerCase())) {
      resultSet.add(mvp);
    }
    if (mvp["alias"] != null) {
      for (let alias of mvp["alias"]) {
        if ((alias+" "+mvp["map"]).toLowerCase().startsWith(query.toLowerCase())) {
          resultSet.add(mvp);
        }
      }
    }
  }
  return resultSet;
}

function updateTime(guildState, mvp, minsAgo, channel, deathTime) {
  if (mvp != null) {
    pgPool.connect().then(pgClient => {
      const selectSql = {
        text: 'SELECT * FROM mvp_guild WHERE id_mvp=$1 AND id_guild=$2',
        values: [mvp.id, guildState.id],
      };
      return pgClient.query(selectSql).then(res => {
        let insrtOrUpdtSql = 'INSERT INTO mvp_guild(id_mvp,id_guild,death_time)VALUES($1,$2,$3)';
        if (res.rowCount > 0) {
          insrtOrUpdtSql = 'UPDATE mvp_guild SET death_time=$3 WHERE id_mvp=$1 AND id_guild=$2';
        }
        deathTime = new Date(deathTime.getTime() - minsAgo*60000);
        pgClient.query(insrtOrUpdtSql, [mvp.id, guildState.id, deathTime]).then(res => {
          pgClient.release();
        })
      });
    });

    let mvpState = trackAux(guildState, mvp, minsAgo);
    refreshMvpList(guildState);
    return `${mvpState.mvp.name} (${mvpState.mvp.map}) in ${mvpState.r1} to ${mvpState.r2} minutes.`;
  }
}

function trackAux(guildState, mvp, minsAgo) {
  let mvpState = guildState.mvpList.find(mvpState => mvpState.mvp === mvp);
  if (!mvpState) {
    mvpState = {mvp: mvp};
    guildState.mvpList.push(mvpState);
  }
  mvpState.r1 = mvp.t1 - minsAgo;
  mvpState.r2 = mvp.t2 - minsAgo;
  guildState.mvpList.sort(function(a, b){
    if(a.r1 > b.r1) {
      return 1;
    }
    if(a.r1 < b.r1) {
      return -1;
    }
    if(a.r1 === b.r1) {
      return 0;
    }
  });
  return mvpState;
}

function refreshMvpList(guildState){
  let aliveMvps = [];
  let deadMvps = [];
  for (let mvpState of guildState.mvpList) {
    if (!mvpState.r2 && mvpState.r2 <= -config.mvpAliveExpirationTimeMins) {
      mvpState.r1 = -999;
      mvpState.r2 = -999;
    }
    if (mvpState.r2 > -config.mvpAliveExpirationTimeMins){
      let list = (Math.round(mvpState.r1)>0) ? deadMvps : aliveMvps;
      let respawn = `${Math.round(mvpState.r1)} to ${Math.round(mvpState.r2)} mins`;
      list.push({name: fill(mvpState.mvp.name,18), map: fill(mvpState.mvp.map,10), respawn: fill(respawn,18)});
    }
  }
  let result = "";
  if (aliveMvps.length > 0) {
    let tableAlive = asciitable(asciiTableOptions, aliveMvps);
    result += "ALIVE MVPS\n"+tableAlive;
  }
  if (deadMvps.length > 0) {
    let tableDead = asciitable(asciiTableOptions, deadMvps);
    result += "\n\nDEAD MVPS\n"+tableDead;
  }
  if (aliveMvps.length == 0 && deadMvps.length == 0) {
    result = "No MVPs have been tracked.";
  }
  guildState.mvpListMessage.edit(fmtMsg(result));
}

function fmtMsg(msg) {
  return "```css\n"+msg+"```";
}

function fill(str, num) {
  let res = str;
  for(let i=0; i<num-str.length; ++i){
    res+=" ";
  }
  return res;
}

function prepareMvpListMsg(message){
  let guildState = guildMap.get(message.guild.id);
  guildState.mvpListMessage = message;
  refreshMvpList(guildState);
  discordClient.setInterval(function(){
    let mvpsToNotify = [];
    for (let mvpState of guildState.mvpList) {
      let oldR1 = mvpState.r1;
      mvpState.r1 -= config.mvpListRefreshRateSecs/60;
      mvpState.r2 -= config.mvpListRefreshRateSecs/60;
      if (Math.round(oldR1)==1 && Math.round(mvpState.r1)==0) {
        let fmtName = mvpState.mvp.name.toLowerCase().replace(/ /g, "_");
        let mainPath = `audio/pt-br/${fmtName}.mp3`;
        let alterPath = `audio/pt-br/${fmtName}_${mvpState.mvp.map}.mp3`;
        if (fs.existsSync(mainPath)) {
          mvpsToNotify.push(mainPath);
        } else if (fs.existsSync(alterPath)) {
          mvpsToNotify.push(alterPath);
        } else {
          console.log(`Warning: missing file ${fmtName} or ${fmtName}_${mvpState.mvp.map}`);
        }
      }
    }
    let voiceChannel = message.guild.channels.find("name", guildMap.get(message.guild.id).voiceChannelName); 

    if (voiceChannel && mvpsToNotify.length > 0) {
      voiceChannel.join().then(function(voiceConn) {
        let notifyMvpRec = function(){
            let dispatcher = voiceConn.playFile(mvpsToNotify.pop()).on('end', reason => {
              if (mvpsToNotify.length > 0) {
                return notifyMvpRec();
              }
              //return voiceConn.playFile("audio/delay_minimo.mp3").on('end', reason => {
                voiceChannel.leave();
              //});
            });
        };
        notifyMvpRec();
      });
    }
    refreshMvpList(guildState);
  }, config.mvpListRefreshRateSecs*1000);
}

discordClient.on('ready', () => {
  console.log(`Logged in as ${discordClient.user.tag}!`);

  for (let discordGuild of discordClient.guilds) {
    let guild = discordGuild[1];
    let guildState = {
      id: guild.id,
      mvpList: [],
      mvpListMessage: null,
      userStateMap: new Map(),
      miningMapList: [],
      miningMapListMessage: null
    };
    guildMap.set(guild.id, guildState);

    let mvpListChannel = guild.channels.find("name", config.mvpListChannelName);
    mvpListChannel.fetchMessages({ limit: 1 })
      .then(function(messages){
        if (messages.size == 0) {
          mvpListChannel.send(fmtMsg("Starting list..."))
            .then(function(newMsg){
              prepareMvpListMsg(newMsg);
              guildState.mvpListMessage = newMsg;
            });
        } else {
          let msg = messages.values().next().value;
          if (msg.author === discordClient.user) {
            prepareMvpListMsg(msg);
            guildState.mvpListMessage = msg;
          }
        }
      });

    let miningMapListChannel = guild.channels.find("name", config.miningListChannelName);
    miningMapListChannel.fetchMessages({ limit: 1 })
      .then(function(messages){
        if (messages.size == 0) {
          miningMapListChannel.send(fmtMsg("Starting list..."))
            .then(function(newMsg){
              prepareMiningMapListMsg(newMsg);
              guildState.miningMapListMessage = newMsg;
            });
        } else {
          let msg = messages.values().next().value;
          prepareMiningMapListMsg(msg);
          guildState.miningMapListMessage = msg;
        }
      });
  }

  pgPool.connect().then(pgClient => {
    pgClient.query('SELECT * FROM guild').then(res => {
      for (let discordGuild of discordClient.guilds) {
        let guildDb = res.rows.find(_guild => _guild.id === discordGuild[0]);
        if (!guildDb) {
          pgClient.query('INSERT INTO guild(id)VALUES($1)', [discordGuild[0]]);
        } else {
          guildMap.get(discordGuild[0]).voiceChannelName = guildDb.voice_channel;
        }
      }

      pgClient.query('SELECT * FROM mvp_guild').then(res => {
        for (let track of res.rows) {
          let minsAgo = (new Date() - track.death_time)/(1000*60);
          let guildState = guildMap.get(track.id_guild);
          if (guildState) {
            let mvp = mvpList.find(_mvp => _mvp.id === track.id_mvp);
            trackAux(guildState, mvp, minsAgo);
          }
        }
      })

      pgClient.query('SELECT * FROM mining_map_guild').then(res => {
        for (let track of res.rows) {
          let minsAgo = (new Date() - track.track_time)/(1000*60);
          let guildState = guildMap.get(track.id_guild);
          if (guildState) {
            let miningMap = miningMapList.find(_miningMap => _miningMap.id === track.id_mining_map);
            miningTrackAux(guildState, miningMap, minsAgo);
          }
        }
      })

      pgClient.release();
    })
  })
});

discordClient.on('message', msg => {
  if (msg.author != discordClient.user) {
    let guildState = guildMap.get(msg.channel.guild.id);
    if (guildState) {
      if (msg.channel.name === config.mvpListChannelName) {
        let botReplyMsg = '';
        if (guildState.userStateMap.has(msg.author)) {
          let userState = guildState.userStateMap.get(msg.author);
          let idx = msg.content;
          if (!isNaN(idx) && idx>0 && idx <= userState.resultList.length) {
            let mob = userState.resultList[idx-1];
            let minsAgo = userState.minsAgo;
            botReplyMsg = updateTime(guildState, mob, minsAgo, msg.channel, msg.createdAt);
          } else {
            botReplyMsg = `Error: invalid number \"${idx}\" for selection.`;
          }
          guildState.userStateMap.delete(msg.author);
        } else if (msg.content[0] == "!") {
          let amsg = msg.content.slice(1);
          let argv = amsg.split(" ");
          if (argv[0] === "voicechannel" || argv[0] === "vc") {
            let maxRole;
            for (let role of msg.guild.roles) {
              if (!maxRole || maxRole.position < role[1].position) {
                maxRole = role[1];
              }
            }

            if (msg.member.roles.has(maxRole.id)) {
              if (argv.length>=2) {
                let newVoiceChannelName = argv[1];
                for (let idx=2; idx<argv.length; ++idx) {
                  newVoiceChannelName += " "+argv[idx];
                }

                let voiceChannel = msg.guild.channels.find("name", newVoiceChannelName);
                if (voiceChannel && voiceChannel.type === "voice") {
                  guildState.voiceChannelName = voiceChannel.name;
                  botReplyMsg = `New voice channel set to \"${newVoiceChannelName}\".`;

                  pgPool.connect().then(pgClient => {
                      insrtOrUpdtSql = 'UPDATE guild SET voice_channel=$1 WHERE id=$2'; 
                      pgClient.query(insrtOrUpdtSql, [guildState.voiceChannelName, msg.guild.id]).then(res => {
                        pgClient.release();
                      })
                    });

                } else {
                  botReplyMsg = `Error: invalid voice channel \"${newVoiceChannelName}\".`;
                }
              } else {
                botReplyMsg = `Voice channel is currently set to \"${guildState.voiceChannelName}\".`;
              }
            } else {
              botReplyMsg = `Error: insufficient permission.`;
            }
          }
          if (argv[0] === "track" || argv[0] === "t") {
            if (argv.length>=2) {
              let minsAgo = 0;

              let queryLastIdx = argv.length-1;
              if (argv.length>=3 && !isNaN(argv[queryLastIdx])) {
                minsAgo = argv[queryLastIdx];
                --queryLastIdx;
              }

              let mvpQuery = argv[1];
              for (let idx=2; idx<=queryLastIdx; ++idx) {
                mvpQuery += " "+argv[idx];
              }

              let resultSet = findMvp(mvpQuery);
              if (resultSet.size == 1) {
                let mob = resultSet.values().next().value;
                botReplyMsg = updateTime(guildState, mob, minsAgo, msg.channel, msg.createdAt);
              } else if (resultSet.size > 1) {
                let msgStr = `More than one MVP has been found. Type the number of MVP you want to track:\n`;
                let i = 1;
                let resultList = [];
                for (let mob of resultSet) {
                  msgStr += `${i}. ${mob.name} (${mob.map})\n`;
                  resultList.push(mob);
                  ++i;
                }
                msg.channel.send(fmtMsg(msgStr))
                .then(function(message){
                  guildState.userStateMap.set(msg.author, {resultList: resultList, minsAgo: minsAgo});
                  message.delete(config.maxSelectionTimeSecs*1000);
                  discordClient.setTimeout(function(){
                    if (guildState.userStateMap.has(msg.author)) {
                      msg.channel.send(fmtMsg(`${msg.author.username}: your selection time has been expired.`)).then(msg => msg.delete(5000));
                      guildState.userStateMap.delete(msg.author);
                    }
                  }, config.maxSelectionTimeSecs*1000);
                });
              } else {
                botReplyMsg = `MVP \"${mvpQuery}\" not found.`;
              }
            }
          }
          if (argv[0] === "help") {
            botReplyMsg = helpMessage;
          }
        }

        if (botReplyMsg) {
          msg.channel.send(fmtMsg(botReplyMsg)).then(botMsg => {
            botMsg.delete(5000);
          });
        }

        msg.delete(3000);

      } else if (msg.channel.name === config.miningListChannelName) {
        let botReplyMsg = '';
        if (msg.content[0] == "!") {
          let amsg = msg.content.slice(1);
          let argv = amsg.split(" ");
          if (argv[0] === "track" || argv[0] === "t") {
            if (argv.length>=2) {
              let minsAgo = 0;
              let queryLastIdx = argv.length-1;
              if (argv.length>=3 && !isNaN(argv[queryLastIdx])) {
                minsAgo = argv[queryLastIdx];
                --queryLastIdx;
              }

              let miningMapQuery = argv[1];
              for (let idx=2; idx<=queryLastIdx; ++idx) {
                miningMapQuery += " "+argv[idx];
              }

              let resultSet = findMiningMap(miningMapQuery);
              if (resultSet.size == 1) {
                let miningMap = resultSet.values().next().value;
                botReplyMsg = updateMiningTime(guildState, miningMap, minsAgo, msg.channel, msg.createdAt);
              } else if (resultSet.size > 2) {
                botReplyMsg = `More than one map starting with \"${miningMapQuery}\" has been found. Be more specific.`;
              } else {
                botReplyMsg = `Map \"${miningMapQuery}\" not found.`;
              }
            }
          }
        }

        if (botReplyMsg) {
          msg.channel.send(fmtMsg(botReplyMsg)).then(botMsg => {
            botMsg.delete(5000);
          });
        }
        msg.delete(3000);
      }
    }
  }
});

pgPool.connect()
  .then(pgClient => {
    let createMvpTable = pgClient.query('SELECT * FROM pg_catalog.pg_tables WHERE schemaname=\'public\' and tablename=\'mvp\'')
      .then(res => {
        if (res.rowCount === 0) {
          return pgClient.query(fs.readFileSync('sql/yellowtracker.sql', 'utf8'))
        }
      })

    let insertVesperMvp = Promise.resolve(createMvpTable)
      .then(() => {
        return pgClient.query('SELECT * FROM mvp WHERE name=\'Vesper\'')
      })
      .then(res => {
        if (res.rowCount === 0) return pgClient.query(fs.readFileSync('sql/update1.sql', 'utf8'))
      })

    let createMiningTable = Promise.resolve(insertVesperMvp)
      .then(() => {
        return pgClient.query('SELECT * FROM pg_catalog.pg_tables WHERE schemaname=\'public\' AND tablename=\'mining_map\'')
      })
      .then(res => {
        if (res.rowCount === 0) return pgClient.query(fs.readFileSync('sql/update2.sql', 'utf8'))
      })

    let insertGqsMvp = Promise.resolve(createMiningTable)
      .then(() => {
        return pgClient.query('SELECT * FROM mvp WHERE name=\'Gold Queen Scaraba\'')
      })
      .then(res => {
        if (res.rowCount === 0) return pgClient.query(fs.readFileSync('sql/update3.sql', 'utf8'))
      })

    let insertKublinMvp = Promise.resolve(insertGqsMvp)
      .then(() => {
        return pgClient.query('SELECT * FROM mvp WHERE name=\'Kublin Vanilla\'')
      })
      .then(res => {
        if (res.rowCount === 0) return pgClient.query(fs.readFileSync('sql/insertKublin.sql', 'utf8'))
      })

    let updateKublinMvp = Promise.resolve(insertKublinMvp)
      .then(() => {
        return pgClient.query('SELECT * FROM mvp WHERE name=\'Kublin Unres\'')
      })
      .then(res => {
        if (res.rowCount === 0) return pgClient.query(fs.readFileSync('sql/updateKublin.sql', 'utf8'))
      })

    let newMvpRespawn = Promise.resolve(updateKublinMvp)
      .then(() => {
        return pgClient.query('SELECT * FROM mvp WHERE t2-t1 = 10')
      })
      .then(res => {
        if (res.rowCount != 0) return pgClient.query(fs.readFileSync('sql/newMvpRespawn.sql', 'utf8'))
      })

    let loadMvps = Promise.resolve(newMvpRespawn)
      .then(() => {
        return pgClient.query('SELECT * FROM mvp')
      })
      .then(res => {
        mvpList = res.rows;
        return pgClient.query('SELECT * FROM mvp_alias')
      })
      .then(res => {
        for (let alias of res.rows) {
          mvp = mvpList.find(mvp => mvp.id === alias.id_mvp);
          let aliasList = mvp.alias;
          if (!mvp.alias) {
            aliasList = [];
            mvp.alias = aliasList;
          }
          aliasList.push(alias.alias);
        }
      })

    let loadMiningMaps = Promise.resolve(loadMvps)
      .then(() => {
        return pgClient.query('SELECT * FROM mining_map')
      })
      .then(res => {
        miningMapList = res.rows;
      })

    Promise.resolve(loadMiningMaps)
      .then(() => {
        pgClient.release()
        discordClient.login(config.botUserToken)
      })
  })
