var fs = require('fs');
const Discord = require('discord.js');
var asciitable = require("asciitable");
const { Pool } = require('pg');

var config = {
  databaseUrl: process.env.DATABASE_URL,
  botUserToken: process.env.BOT_USER_TOKEN,
  tableEntryExpirationMins: process.env.TABLE_ENTRY_EXPIRATION_MINS,
  tableRefreshRateSecs: process.env.TABLE_REFRESH_RATE_SECS,
  selectionTimeExpirationSecs: process.env.SELECTION_TIME_EXPIRATION_SECS,
};

var guildMap = new Map();
const discordClient = new Discord.Client();

const mvpAsciiTableOptions = {
  skinny: true,
  intersectionCharacter: "x",
  columns: [
    {field: "name", name: "Name"},
    {field: "map", name: "Map"},
    {field: "remainingTime", name: "Remaining Time"},
  ],
};

const miningAsciiTableOptions = {
  skinny: true,
  intersectionCharacter: "x",
  columns: [
    {field: "name", name: "Name"},
    {field: "remainingTime", name: "Remaining Time"},
  ],
};

const pgPool = new Pool({connectionString: config.databaseUrl});

var mvpList = [];
var miningList = [];

process.on('unhandledRejection', (reason, promise) => {
  handleError(reason)
})

discordClient.on('error', error => {
  handleError(error)
})

discordClient.on('ready', () => {
  console.log(`Logged in as ${discordClient.user.tag}!`);

  for (let discordGuild of discordClient.guilds) {
    let guildState = {
      idGuild: discordGuild[0],
      mvpUserStateMap: new Map(),
      idMvpChannel: null,
      idMvpListMessage: null,
      mvpList: [],
      miningUserStateMap: new Map(),
      idMiningChannel: null,
      idMiningListMessage: null,
      miningList: [],
    };
    guildMap.set(discordGuild[0], guildState);
  }

  pgPool.connect().then(pgClient => {
    let loadTrackedMvps = pgClient.query('SELECT * FROM guild')
      .then(res => {
        for (let discordGuild of discordClient.guilds) {
          let guildDb = res.rows.find(_guild => _guild.id === discordGuild[0]);
          if (!guildDb) {
            pgClient.query('INSERT INTO guild(id)VALUES($1)', [discordGuild[0]]);
            continue;
          }
          guildMap.get(discordGuild[0]).idMvpChannel = guildDb.id_mvp_channel;
          guildMap.get(discordGuild[0]).idMiningChannel = guildDb.id_mining_channel;
          guildMap.get(discordGuild[0]).idVoiceChannel = guildDb.id_voice_channel;
        }

        pgClient.query('SELECT * FROM mvp_guild').then(res => {
          for (let track of res.rows) {
            let minsAgo = (new Date() - track.death_time)/(1000*60);
            let guildState = guildMap.get(track.id_guild);
            if (guildState) {
              let mvp = mvpList.find(_mvp => _mvp.id === track.id_mvp);
              trackMvpAux(guildState, mvp, minsAgo);
            }
          }
        })

        pgClient.query('SELECT * FROM mining_guild').then(res => {
          for (let track of res.rows) {
            let minsAgo = (new Date() - track.track_time)/(1000*60);
            let guildState = guildMap.get(track.id_guild);
            if (guildState) {
              let mining = miningList.find(_mining => _mining.id === track.id_mining);
              trackMiningAux(guildState, mining, minsAgo);
            }
          }
        })

        pgClient.release();
      })

    Promise.resolve(loadTrackedMvps)
      .then(() => {
        for (let discordGuild of discordClient.guilds) {
          let guildState = guildMap.get(discordGuild[0]);
          initMvpChannel(guildState);
          initMiningChannel(guildState);
          timerMvpList(guildState);
          timerMiningList(guildState);
        }
      })
      .catch(console.error)
  })
});


discordClient.on('guildCreate', guild => {
  console.log(`Joined to ${guild.name}!`);
  let guildState = {
    idGuild: guild.id,
    mvpUserStateMap: new Map(),
    idMvpChannel: null,
    idMvpListMessage: null,
    mvpList: [],
    miningUserStateMap: new Map(),
    idMiningChannel: null,
    idMiningListMessage: null,
    miningList: [],
  };
  guildMap.set(guild.id, guildState);

  pgPool.connect().then(pgClient => {
    pgClient.query('SELECT * FROM guild WHERE id = $1', [guild.id])
      .then(res => {
        if (res.rows.length === 0) {
          pgClient.query('INSERT INTO guild(id)VALUES($1)', [guild.id]);
        }
        pgClient.release();
      })

    timerMvpList(guildState);
    timerMiningList(guildState);
  })
});


discordClient.on('message', msg => {
  if (msg.author != discordClient.user && msg.channel.guild) {
    let guildState = guildMap.get(msg.channel.guild.id);
    if (guildState) {
      let botReplyMsg = '';

      if (msg.content[0] == "!") {
        let amsg = msg.content.slice(1);
        let argv = amsg.split(" ");

        let maxRole = 0;
        for (let role of msg.guild.roles) {
          if (!maxRole || maxRole.position < role[1].position) {
            maxRole = role[1];
          }
        }

        if (msg.member.roles.has(maxRole.id)) {

          if (argv[0] === "settings") {
            let mvpChannel = msg.guild.channels.get(guildState.idMvpChannel);
            let miningChannel = msg.guild.channels.get(guildState.idMiningChannel);
            let voiceChannel = msg.guild.channels.get(guildState.idVoiceChannel);
            botReplyMsg = "MVP channel:";
            if (mvpChannel)
              botReplyMsg += ` ${mvpChannel.name}`;

            botReplyMsg += "\nMining channel:"; 
            if (miningChannel)
              botReplyMsg += ` ${miningChannel.name}`;

            botReplyMsg += "\nVoice channel:"; 
            if (voiceChannel)
              botReplyMsg += ` ${voiceChannel.name}`;
          }

          if (argv[0] === "unsetmvpchannel") {
            guildState.idMvpChannel = null;
            botReplyMsg = `MVP channel unset.`;
            pgPool.connect().then(pgClient => {
                insrtOrUpdtSql = 'UPDATE guild SET id_mvp_channel=NULL WHERE id=$1'; 
                pgClient.query(insrtOrUpdtSql, [msg.guild.id]).then(res => {
                  pgClient.release();
                })
              });
          }
          if (argv[0] === "setmvpchannel") {
            if (argv.length>=2) {
              let newMvpChannelName = argv[1];
              for (let idx=2; idx<argv.length; ++idx) {
                newMvpChannelName += " "+argv[idx];
              }
              let mvpChannel = msg.guild.channels.find("name", newMvpChannelName);
              if (mvpChannel && mvpChannel.type === "text") {
                guildState.idMvpChannel = mvpChannel.id;
                guildState.idMvpListMessage = null;
                initMvpChannel(guildState);
                botReplyMsg = `New MVP channel set to \"${newMvpChannelName}\".`;
                pgPool.connect().then(pgClient => {
                    insrtOrUpdtSql = 'UPDATE guild SET id_mvp_channel=$1 WHERE id=$2'; 
                    pgClient.query(insrtOrUpdtSql, [mvpChannel.id, msg.guild.id]).then(res => {
                      pgClient.release();
                    })
                  });
              } else {
                botReplyMsg = `Error: invalid MVP channel \"${newMvpChannelName}\".`;
              }
            } else {
              botReplyMsg = `Error: missing argument.`;
            }
          }

          if (argv[0] === "unsetminingchannel") {
            guildState.idMiningChannel = null;
            botReplyMsg = `Mining channel unset.`;
            pgPool.connect().then(pgClient => {
                insrtOrUpdtSql = 'UPDATE guild SET id_mining_channel=NULL WHERE id=$1'; 
                pgClient.query(insrtOrUpdtSql, [msg.guild.id]).then(res => {
                  pgClient.release();
                })
              });
          }
          if (argv[0] === "setminingchannel") {
            if (argv.length>=2) {
              let newMiningChannelName = argv[1];
              for (let idx=2; idx<argv.length; ++idx) {
                newMiningChannelName += " "+argv[idx];
              }
              let miningChannel = msg.guild.channels.find("name", newMiningChannelName);
              if (miningChannel && miningChannel.type === "text") {
                guildState.idMiningChannel = miningChannel.id;
                guildState.idMiningListMessage = null;
                initMiningChannel(guildState);
                if (msg.channel != miningChannel) {
                  botReplyMsg = `New mining channel set to \"${newMiningChannelName}\".`;
                } else {
                  deleteUserMessage = false;
                }
                pgPool.connect().then(pgClient => {
                    insrtOrUpdtSql = 'UPDATE guild SET id_mining_channel=$1 WHERE id=$2'; 
                    pgClient.query(insrtOrUpdtSql, [miningChannel.id, msg.guild.id]).then(res => {
                      pgClient.release();
                    })
                  });
              } else {
                botReplyMsg = `Error: invalid mining channel \"${newMiningChannelName}\".`;
              }
            } else {
              botReplyMsg = `Error: missing argument.`;
            }
          }

          if (argv[0] === "unsetvoicechannel") {
            guildState.idVoiceChannel = null;
            botReplyMsg = `Voice channel unset.`;
            pgPool.connect().then(pgClient => {
                insrtOrUpdtSql = 'UPDATE guild SET id_voice_channel=NULL WHERE id=$1'; 
                pgClient.query(insrtOrUpdtSql, [msg.guild.id]).then(res => {
                  pgClient.release();
                })
              });
          }
          if (argv[0] === "setvoicechannel") {
            if (argv.length>=2) {
              let newVoiceChannelName = argv[1];
              for (let idx=2; idx<argv.length; ++idx) {
                newVoiceChannelName += " "+argv[idx];
              }
              let voiceChannel = msg.guild.channels.find("name", newVoiceChannelName);
              if (voiceChannel && voiceChannel.type === "voice") {
                guildState.idVoiceChannel = voiceChannel.id;
                botReplyMsg = `New voice channel set to \"${newVoiceChannelName}\".`;
                pgPool.connect().then(pgClient => {
                    insrtOrUpdtSql = 'UPDATE guild SET id_voice_channel=$1 WHERE id=$2'; 
                    pgClient.query(insrtOrUpdtSql, [voiceChannel.id, msg.guild.id]).then(res => {
                      pgClient.release();
                    })
                  });
              } else {
                botReplyMsg = `Error: invalid voice channel \"${newVoiceChannelName}\".`;
              }
            } else {
              botReplyMsg = `Error: missing argument.`;
            }
          }

        } else {
          //botReplyMsg = `Error: insufficient permission.`;
        }
      }

      if (guildState.idMvpChannel && msg.channel.id === guildState.idMvpChannel) {
        if (guildState.mvpUserStateMap.has(msg.author)) {
          let userState = guildState.mvpUserStateMap.get(msg.author);
          let idx = msg.content;
          if (!isNaN(idx) && idx>0 && idx <= userState.resultList.length) {
            let mob = userState.resultList[idx-1];
            let minsAgo = userState.minsAgo;
            botReplyMsg = updateMvpTime(guildState, mob, minsAgo, msg.channel, msg.createdAt);
          } else {
            botReplyMsg = `Error: invalid number \"${idx}\" for selection.`;
          }
          guildState.mvpUserStateMap.delete(msg.author);
        } else if (msg.content[0] == "!") {
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

              if (minsAgo < 0) {
                minsAgo = 0;
              }

              let mvpQuery = argv[1];
              for (let idx=2; idx<=queryLastIdx; ++idx) {
                mvpQuery += " "+argv[idx];
              }

              let resultSet = findMvp(mvpQuery);
              if (resultSet.size == 1) {
                let mob = resultSet.values().next().value;
                botReplyMsg = updateMvpTime(guildState, mob, minsAgo, msg.channel, msg.createdAt);
              } else if (resultSet.size > 1) {
                let msgStr = `More than one MVP starting with \"${mvpQuery}\" has been found. Type the number of MVP you want to track:\n`;
                let i = 1;
                let resultList = [];
                for (let mob of resultSet) {
                  msgStr += `${i}. ${mob.name} (${mob.map})\n`;
                  resultList.push(mob);
                  ++i;
                }
                msg.channel.send(fmtMsg(msgStr))
                .then(function(message){
                  guildState.mvpUserStateMap.set(msg.author, {resultList: resultList, minsAgo: minsAgo});
                  message.delete(config.selectionTimeExpirationSecs*1000);
                  discordClient.setTimeout(function(){
                    if (guildState.mvpUserStateMap.has(msg.author)) {
                      msg.channel.send(fmtMsg(`${msg.author.username}: your selection time has been expired.`)).then(msg => msg.delete(5000));
                      guildState.mvpUserStateMap.delete(msg.author);
                    }
                  }, config.selectionTimeExpirationSecs*1000);
                });
              } else {
                botReplyMsg = `MVP \"${mvpQuery}\" not found.`;
              }
            }
          }
        }
      } else if (guildState.idMiningChannel && msg.channel.id === guildState.idMiningChannel) {
        if (guildState.miningUserStateMap.has(msg.author)) {
          let userState = guildState.miningUserStateMap.get(msg.author);
          let idx = msg.content;
          if (!isNaN(idx) && idx>0 && idx <= userState.resultList.length) {
            let mob = userState.resultList[idx-1];
            let minsAgo = userState.minsAgo;
            botReplyMsg = updateMiningTime(guildState, mob, minsAgo, msg.channel, msg.createdAt);
          } else {
            botReplyMsg = `Error: invalid number \"${idx}\" for selection.`;
          }
          guildState.miningUserStateMap.delete(msg.author);
        } else if (msg.content[0] == "!") {
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

              if (minsAgo < 0) {
                minsAgo = 0;
              }

              let miningQuery = argv[1];
              for (let idx=2; idx<=queryLastIdx; ++idx) {
                miningQuery += " "+argv[idx];
              }

              let resultSet = findMining(miningQuery);
              if (resultSet.size == 1) {
                let mining = resultSet.values().next().value;
                botReplyMsg = updateMiningTime(guildState, mining, minsAgo, msg.channel, msg.createdAt);
              } else if (resultSet.size > 1) {
                msgStr = `More than one mining zone starting with \"${miningQuery}\" has been found. Type the number of the mining zone you want to track:\n`;
                let i = 1;
                let resultList = [];
                for (let mining of resultSet) {
                  msgStr += `${i}. ${mining.name}\n`;
                  resultList.push(mining);
                  ++i;
                }
                msg.channel.send(fmtMsg(msgStr))
                .then(function(message){
                  guildState.miningUserStateMap.set(msg.author, {resultList: resultList, minsAgo: minsAgo});
                  message.delete(config.selectionTimeExpirationSecs*1000);
                  discordClient.setTimeout(function(){
                    if (guildState.miningUserStateMap.has(msg.author)) {
                      msg.channel.send(fmtMsg(`${msg.author.username}: your selection time has been expired.`)).then(msg => msg.delete(5000));
                      guildState.miningUserStateMap.delete(msg.author);
                    }
                  }, config.selectionTimeExpirationSecs*1000);
                });
              } else {
                botReplyMsg = `Mining zone \"${miningQuery}\" not found.`;
              }
            }
          }
        }
      }

      let deleteMsg = false;
      if (msg.channel.id === guildState.idMvpChannel || msg.channel.id === guildState.idMiningChannel) {
        deleteMsg = true;
      }
      if (botReplyMsg) {
        sendBotMessage(botReplyMsg, msg.channel, deleteMsg);
      }
      if (deleteMsg) {
        deleteMessage(msg);
      }
    }
  } else if (msg.content.startsWith("!bt ")) {
    let amsg = msg.content.slice(4);
    let argv = amsg.split("\n");
    let guildState = guildMap.get(argv[0]);
    for (let i = 1; i < argv.length; ++i) {
      arg = argv[i];
      let resultSet = findMvp(arg.trim());
      if (resultSet.size == 1) {
        let mvp = resultSet.values().next().value;

        let mvpNotTracked = true;
        for (let mvpState of guildState.mvpList) {
          if (mvpState.mvp.id === mvp.id
                && mvpState.r1 > 0) {
            mvpNotTracked = false;
          }
        }

        if (mvpNotTracked) {
          updateMvpTime(guildState, mvp, 0, msg.channel, msg.createdAt);
        }
      } else {
        console.log(`Warning: ${arg} not found (${resultSet.size} results)`);
      }
    }
    deleteMessage(msg);
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

    let loadMvps = Promise.resolve(createMvpTable)
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

    let loadMinings = Promise.resolve(loadMvps)
      .then(() => {
        return pgClient.query('SELECT * FROM mining')
      })
      .then(res => {
        miningList = res.rows;
      })

    Promise.resolve(loadMinings)
      .then(() => {
        pgClient.release()
        discordClient.login(config.botUserToken)
      })
  })


function sendBotMessage(botReplyMsg, channel, deleteBotMsg) {
  channel.send(fmtMsg(botReplyMsg)).then(msg => {
    if (deleteBotMsg) {
      deleteMessage(msg);
    }
  });
}


function deleteMessage(msg) {
  msg.delete(4000)
    .catch(err => {});
}


function initMvpChannel(guildState) {
  let guild = discordClient.guilds.get(guildState.idGuild);
  let mvpChannel = guild.channels.get(guildState.idMvpChannel);
  if (mvpChannel) {
    guildState.idMvpListMessage = null;
    mvpChannel.fetchMessages()
      .then(function(messages){
        let messagesToDelete = [];
        for (let pastMessage of messages) {
          if (discordClient.user === pastMessage[1].author && !guildState.idMvpListMessage) {
            guildState.idMvpListMessage = pastMessage[0];
            refreshMvpList(guildState);
            continue;
          }
          messagesToDelete.push(pastMessage[1]);
        }
        mvpChannel.bulkDelete(messagesToDelete);
        if (!guildState.idMvpListMessage) {
          mvpChannel.send(fmtMsg("Starting list..."))
            .then(function(newMsg){
              guildState.idMvpListMessage = newMsg.id;
              refreshMvpList(guildState);
            });
        }
      })
  }
}


function timerMvpList(guildState) {
  discordClient.setInterval(function() {
    let mvpsToNotify = [];
    for (let mvpState of guildState.mvpList) {
      let oldR1 = mvpState.r1;
      mvpState.r1 -= config.tableRefreshRateSecs/60;
      mvpState.r2 -= config.tableRefreshRateSecs/60;
      if (Math.round(oldR1)==1 && Math.round(mvpState.r1)==0) {
        let fmtName = mvpState.mvp.name.toLowerCase().replace(/ /g, "_");
        let mainPath = `audio/pt-br/mvp/${fmtName}.mp3`;
        let alterPath = `audio/pt-br/mvp/${fmtName}_${mvpState.mvp.map}.mp3`;
        if (fs.existsSync(mainPath)) {
          mvpsToNotify.push(mainPath);
        } else if (fs.existsSync(alterPath)) {
          mvpsToNotify.push(alterPath);
        } else {
          console.log(`Warning: missing file ${fmtName} or ${fmtName}_${mvpState.mvp.map}`);
        }
      }
    }

    let guild = discordClient.guilds.get(guildState.idGuild);
    let voiceChannel = guild.channels.get(guildState.idVoiceChannel);
    if (voiceChannel && mvpsToNotify.length > 0) {
      voiceChannel.join().then(function(voiceConn) {
        voiceConn.playFile("audio/pt-br/init.mp3").on('end', reason => {          
          let notifyMvpRec = function() {
            voiceConn.playFile(mvpsToNotify.pop()).on('end', reason => {
              if (mvpsToNotify.length > 0) {
                return notifyMvpRec();
              }
              voiceChannel.leave();
            });
          };
          notifyMvpRec();
        });
      });
    }
    refreshMvpList(guildState);
  }, config.tableRefreshRateSecs*1000);
}


function refreshMvpList(guildState) {
  let trackedMvps = [];
  for (let mvpState of guildState.mvpList) {
    if (!mvpState.r2 && mvpState.r2 <= -config.tableEntryExpirationMins) {
      mvpState.r1 = -999;
      mvpState.r2 = -999;
    }
    if (mvpState.r2 > -config.tableEntryExpirationMins) {
      let remainingTime = `${Math.round(mvpState.r1)} to ${Math.round(mvpState.r2)} mins`;
      trackedMvps.push({name: fill(mvpState.mvp.name,18), map: fill(mvpState.mvp.map,10), remainingTime: fill(remainingTime,18)});
    }
  }
  let result = "";
  if (trackedMvps.length > 0) {
    let maxMvps = 29;
    if (trackedMvps.length > maxMvps) {
      let diff = trackedMvps.length - maxMvps;
      trackedMvps.splice(maxMvps, diff);
      trackedMvps.push({name: fill("and "+diff+" more...",18), map: fill("",10), remainingTime: fill("",18)});
    }
    let table = asciitable(mvpAsciiTableOptions, trackedMvps);
    result += "MVPS\n"+table;
  } else {
    result = "No MVPs have been tracked.";
  }

  let guild = discordClient.guilds.get(guildState.idGuild);
  let mvpChannel = guild.channels.get(guildState.idMvpChannel);
  if (mvpChannel && guildState.idMvpListMessage) {
    mvpChannel.fetchMessage(guildState.idMvpListMessage)
      .then(message => {
        message.edit(fmtMsg(result));
      }).catch(err => {
        mvpChannel.send(fmtMsg("Starting list..."))
          .then(function(newMsg) {
            guildState.idMvpListMessage = newMsg.id;
            refreshMvpList(guildState);
          });
      });
  }
}


function findMvp(query) {
  let resultSet = new Set();
  for (let mvp of mvpList) {
    if ((mvp["name"]+" "+mvp["map"]).toLowerCase() === query.toLowerCase()) {
      let exactResult = new Set();
      exactResult.add(mvp);
      return exactResult;
    }
    if ((mvp["name"]+" "+mvp["map"]).toLowerCase().startsWith(query.toLowerCase())) {
      resultSet.add(mvp);
    }
    if (mvp["alias"] != null) {
      for (let alias of mvp["alias"]) {
        if ((alias+" "+mvp["map"]).toLowerCase() === query.toLowerCase()) {
          let exactResult = new Set();
          exactResult.add(mvp);
          return exactResult;
        }
        if ((alias+" "+mvp["map"]).toLowerCase().startsWith(query.toLowerCase())) {
          resultSet.add(mvp);
        }
      }
    }
  }
  return resultSet;
}


function updateMvpTime(guildState, mvp, minsAgo, channel, deathTime) {
  if (mvp != null) {
    pgPool.connect().then(pgClient => {
      const selectSql = {
        text: 'SELECT * FROM mvp_guild WHERE id_mvp=$1 AND id_guild=$2',
        values: [mvp.id, guildState.idGuild],
      };
      return pgClient.query(selectSql).then(res => {
        let insrtOrUpdtSql = 'INSERT INTO mvp_guild(id_mvp,id_guild,death_time)VALUES($1,$2,$3)';
        if (res.rowCount > 0) {
          insrtOrUpdtSql = 'UPDATE mvp_guild SET death_time=$3 WHERE id_mvp=$1 AND id_guild=$2';
        }
        deathTime = new Date(deathTime.getTime() - minsAgo*60000);
        pgClient.query(insrtOrUpdtSql, [mvp.id, guildState.idGuild, deathTime]).then(res => {
          pgClient.release();
        })
      });
    });

    let mvpState = trackMvpAux(guildState, mvp, minsAgo);
    refreshMvpList(guildState);
    return `${mvpState.mvp.name} (${mvpState.mvp.map}) in ${mvpState.r1} to ${mvpState.r2} minutes.`;
  }
}


function trackMvpAux(guildState, mvp, minsAgo) {
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


function initMiningChannel(guildState) {
  let guild = discordClient.guilds.get(guildState.idGuild);
  let miningChannel = guild.channels.get(guildState.idMiningChannel);
  if (miningChannel) {
    guildState.idMiningListMessage = null;
    miningChannel.fetchMessages()
      .then(function(messages){
        let messagesToDelete = [];
        for (let pastMessage of messages) {
          if (discordClient.user === pastMessage[1].author && !guildState.idMiningListMessage) {
            guildState.idMiningListMessage = pastMessage[0];
            refreshMiningList(guildState);
            continue;
          }
          messagesToDelete.push(pastMessage[1]);
        }
        miningChannel.bulkDelete(messagesToDelete);
        if (!guildState.idMiningListMessage) {
          miningChannel.send(fmtMsg("Starting list..."))
            .then(function(newMsg) {
              guildState.idMiningListMessage = newMsg.id;
              refreshMiningList(guildState);
            });
        }
      });
  }
}


function timerMiningList(guildState) {
  discordClient.setInterval(function() {
    for (let miningState of guildState.miningList) {
      miningState.r1 -= config.tableRefreshRateSecs/60;
    }
    refreshMiningList(guildState);
  }, config.tableRefreshRateSecs*1000);
}


function refreshMiningList(guildState) {
  let list = [];
  for (let miningState of guildState.miningList) {
    if (!miningState.r1 && miningState.r1 != 0) {
      miningState.r1 = -999;
    }
    if (miningState.r1 > -config.tableEntryExpirationMins){
      let remainingTime = `${Math.round(miningState.r1)} mins`;
      list.push({name: fill(miningState.mining.name,10), remainingTime: fill(remainingTime,18)});
    }
  }
  let result = "";
  if (list.length > 0) {
    let table = asciitable(miningAsciiTableOptions, list);
    result += "MINING ZONES\n"+table;
  }
  if (list.length == 0) {
    result = "No mining zones have been tracked.";
  }

  let guild = discordClient.guilds.get(guildState.idGuild);
  let miningChannel = guild.channels.get(guildState.idMiningChannel);
  if (miningChannel && guildState.idMiningListMessage) {
    miningChannel.fetchMessage(guildState.idMiningListMessage)
      .then(message => {
        message.edit(fmtMsg(result));
      }).catch(err => {
        miningChannel.send(fmtMsg("Starting list..."))
          .then(function(newMsg) {
            guildState.idMiningListMessage = newMsg.id;
            refreshMiningList(guildState);
          });
      });
  }
}


function findMining(query) {
  let resultSet = new Set();
  for (let mining of miningList) {
    if ((mining["name"]).toLowerCase().startsWith(query.toLowerCase())) {
      resultSet.add(mining);
    }
  }
  return resultSet;
}


function updateMiningTime(guildState, mining, minsAgo, channel, trackTime) {
  if (mining != null) {
    pgPool.connect().then(pgClient => {
      const selectSql = {
        text: 'SELECT * FROM mining_guild WHERE id_mining=$1 AND id_guild=$2',
        values: [mining.id, guildState.idGuild],
      };
      return pgClient.query(selectSql).then(res => {
        let insrtOrUpdtSql = 'INSERT INTO mining_guild(id_mining,id_guild,track_time)VALUES($1,$2,$3)';
        if (res.rowCount > 0) {
          insrtOrUpdtSql = 'UPDATE mining_guild SET track_time=$3 WHERE id_mining=$1 AND id_guild=$2';
        }
        trackTime = new Date(trackTime.getTime() - minsAgo*60000);
        pgClient.query(insrtOrUpdtSql, [mining.id, guildState.idGuild, trackTime]).then(res => {
          pgClient.release();
        })
      });
    });

    let miningState = trackMiningAux(guildState, mining, minsAgo);
    refreshMiningList(guildState);
    return `${miningState.mining.name} in ${miningState.r1} minutes.`;
  }
}


function trackMiningAux(guildState, mining, minsAgo) {
  let miningState = guildState.miningList.find(miningState => miningState.mining === mining);
  if (!miningState) {
    miningState = {mining: mining};
    guildState.miningList.push(miningState);
  }
  miningState.r1 = 30 - minsAgo;
  guildState.miningList.sort(function(a, b){
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
  return miningState;
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


function handleError(err) {
  if (err.code === 'ENOENT') {
    console.log('Error: ' + err.message)
  } else {
    console.log('Unhandled Rejection at:', err.stack || err)
    process.exit(1)
  }
}