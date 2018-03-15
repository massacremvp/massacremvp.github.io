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
  userInputChannelName: process.env.USER_INPUT_CHANNEL_NAME,
  mvpListChannelName: process.env.MVP_LIST_CHANNEL_NAME,
  voiceChannelName: process.env.VOICE_CHANNEL_NAME,
  mvpAliveExpirationTimeMins: process.env.MVP_ALIVE_EXPIRATION_TIME_MINS,
  mvpListRefreshRateSecs: process.env.MVP_LIST_REFRESH_RATE_SECS,
  maxSelectionTimeSecs: process.env.MAX_SELECTION_TIME_SECS,
  notifySoundFile: process.env.NOTIFY_SOUND_FILE
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



function findMvp(guildState, query) {
  let resultSet = new Set();
  for (let mvp of mvpList) {
    if (mvp["name"].toLowerCase().startsWith(query.toLowerCase())) {
      resultSet.add(mvp);
    }
    if (mvp["alias"] != null) {
      for (let alias of mvp["alias"]) {
        if (alias.toLowerCase().startsWith(query.toLowerCase())) {
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
    channel.send(fmtMsg(`${mvpState.mvp.name} (${mvpState.mvp.map}) in ${mvpState.r1} to ${mvpState.r2} minutes.`));
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
    if (!mvpState.r2 && mvpState.r2 != 0) {
      mvpState.r1 = -999;
      mvpState.r2 = -999;
    }
    if (mvpState.r2 > -config.mvpAliveExpirationTimeMins){
      let list = (Math.round(mvpState.r1)>0) ? deadMvps : aliveMvps;
      let respawn = `${Math.round(mvpState.r1)} to ${Math.round(mvpState.r2)} mins`;
      list.push({name: fill(mvpState.mvp.name,18), map: fill(mvpState.mvp.map,10), respawn: fill(respawn,18)});
    } else {
      guildState.mvpList.splice(guildState.mvpList.indexOf(mvpState), 1);
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
    result = "No MVPs has been tracked.";
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
    let notify = false;
    for (let mvp of guildState.mvpList) {
      let oldR1 = mvp.r1;
      mvp.r1 -= config.mvpListRefreshRateSecs/60;
      mvp.r2 -= config.mvpListRefreshRateSecs/60;
      if (Math.round(oldR1)==1 && Math.round(mvp.r1)==0) {
        notify = true;
      }
    }
    let voiceChannel = message.guild.channels.find("name", config.voiceChannelName); 
    if (notify) {
      voiceChannel.join().then(function(voiceConn) {
        voiceConn.playFile(config.notifySoundFile);
      });
    } else {
       voiceChannel.leave();
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
      userStateMap: new Map()
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
  }

  pgPool.connect().then(pgClient => {
    pgClient.query('SELECT * FROM guild').then(res => {
      for (let discordGuild of discordClient.guilds) {
        if (!res.rows.find(_guild => _guild.id === discordGuild[0])) {
          pgClient.query('INSERT INTO guild(id)VALUES($1)', [discordGuild[0]]);
        }
      }
    })
    pgClient.query('SELECT * FROM mvp_guild').then(res => {
      for (let track of res.rows) {
        let minsAgo = (new Date() - track.death_time)/(1000*60);
        let guildState = guildMap.get(track.id_guild);
        let mvp = mvpList.find(_mvp => _mvp.id === track.id_mvp);
        trackAux(guildState, mvp, minsAgo);
      }
    })
    pgClient.release()
  })
});

discordClient.on('message', msg => {
  let guildState = guildMap.get(msg.channel.guild.id);
  if (guildState && msg.channel.name === config.userInputChannelName) {
    if (guildState.userStateMap.has(msg.author)) {
      let userState = guildState.userStateMap.get(msg.author);
      let idx = msg.content;
      if (!isNaN(idx) && idx>0 && idx <= userState.resultList.length) {
        let mob = userState.resultList[idx-1];
        let minsAgo = userState.minsAgo;
        updateTime(guildState, mob, minsAgo, msg.channel, msg.createdAt);
      } else {
        msg.channel.send(fmtMsg(`Error: invalid number \"${idx}\" for selection.`));
      }
      guildState.userStateMap.delete(msg.author);
    } else if (msg.content[0] == "!") {
      let amsg = msg.content.slice(1);
      let argv = amsg.split(" ");
      if (argv[0] === "track") {
        let minsAgo = 0;
        if (argv.length>2 && !isNaN(argv[argv.length-1])) {
          minsAgo = argv[argv.length-1];
        }
        if (argv.length>1 && argv[1]!=null) {
          let resultSet = findMvp(guildState, argv[1]);
          if (resultSet.size == 1) {
            let mob = resultSet.values().next().value;
            updateTime(guildState, mob, minsAgo, msg.channel, msg.createdAt);
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
              discordClient.setTimeout(function(){
                if (guildState.userStateMap.has(msg.author)) {
                  msg.channel.send(fmtMsg(`${msg.author.username}' selection time has been expired.`));
                  guildState.userStateMap.delete(msg.author);
                }
              }, config.maxSelectionTimeSecs*1000);
            });
          } else {
            msg.channel.send(fmtMsg(`MVP \"${argv[1]}\" not found.`));
          }
        }
      }
      if (argv[0] === "help") {
        msg.channel.send(fmtMsg(helpMessage));
      }
    }
  }
});

pgPool.connect().then(pgClient => {
  pgClient.query('SELECT * FROM pg_catalog.pg_tables WHERE schemaname=\'public\'').then(res => {
    if (res.rowCount === 0) {
      pgClient.query(fs.readFileSync('yellowtracker.sql', 'utf8'));
    }
    pgClient.query('SELECT * FROM mvp').then(res => {
      mvpList = res.rows;
      pgClient.query('SELECT * FROM mvp_alias').then(res => {
        for (let alias of res.rows) {
          mvp = mvpList.find(mvp => mvp.id === alias.id_mvp);
          let aliasList = mvp.alias;
          if (!mvp.alias) {
            aliasList = [];
            mvp.alias = aliasList;
          }
          aliasList.push(alias.alias);
        }
      });
      pgClient.release();
      discordClient.login(config.botUserToken);
    });
  });
});
