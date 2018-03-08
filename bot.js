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



const Discord = require('discord.js');
var asciitable = require("asciitable");
const { Pool } = require('pg');
const mvpList = require('./mvplist.json');



var config = {
  databaseUrl: process.env.DATABASE_URL
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



function genMvpList() {
  let anotherMvpList = [];
  for (let mvp of mvpList) {
    anotherMvpList.push(Object.assign({}, mvp));
  }
  return anotherMvpList;
}

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

function updateTime(guildState, mvp, time, channel) {
  if (mvp != null) {
    let mvpState = guildState.mvpList.find(mvpState => mvpState.mvp === mvp);
    if (!mvpState) {
      mvpState = {mvp: mvp};
      guildState.mvpList.push(mvpState);
    }
    mvpState.r1 = mvp.t1 - time;
    mvpState.r2 = mvp.t2 - time;
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
    refreshMvpList(guildState);
    channel.send(fmtMsg(`${mvpState.mvp.name} (${mvpState.mvp.map}) in ${mvpState.r1} to ${mvpState.r2} minutes.`));
  }
}

function refreshMvpList(guildState){
  let aliveMvps = [];
  let deadMvps = [];
  for (let mvpState of guildState.mvpList) {
    if (!mvpState.r2 && mvpState.r2 != 0) {
      console.log(mvpState.r2);
      mvpState.r1 = -999;
      mvpState.r2 = -999;
    }
    if (mvpState.r2 > -config.mvpAliveExpirationTimeMins){
      let list = (mvpState.r1>0) ? deadMvps : aliveMvps;
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

discordClient.on('ready', () => {
  console.log(`Logged in as ${discordClient.user.tag}!`);
  pgPool.connect()
    .then(pgClient => {
      return pgClient.query('SELECT * FROM guild')
        .then(res => {
          pgClient.release();
          for (let dbGuild of res.rows) {
            let guild = discordClient.guilds.find('name', dbGuild.name);
            let guildState = {
              mvpList: [],
              mvpListMessage: null,
              userStateMap: new Map()
            };
            guildMap.set(guild, guildState);
            let channel = guild.channels.find("name", config.mvpListChannelName);
            channel.bulkDelete(1);
            channel.send(fmtMsg("Starting list..."))
            .then(function(message){
              let guildState = guildMap.get(message.guild);
              guildState.mvpListMessage = message;
              refreshMvpList(guildState);
              discordClient.setInterval(function(){
                for (let mvp of guildState.mvpList) {
                  mvp.r1 -= config.mvpListRefreshRateSecs/60;
                  mvp.r2 -= config.mvpListRefreshRateSecs/60;
                }
                refreshMvpList(guildState);
              }, config.mvpListRefreshRateSecs*1000);
            });
          }
        })
    })
});

discordClient.on('message', msg => {
  let guildState = guildMap.get(msg.channel.guild);
  if (guildState && msg.channel.name === config.userInputChannelName) {
    if (guildState.userStateMap.has(msg.author)) {
      let userState = guildState.userStateMap.get(msg.author);
      let idx = msg.content;
      if (!isNaN(idx) && idx>0 && idx <= userState.resultList.length) {
        let mob = userState.resultList[idx-1];
        let time = userState.time;
        updateTime(guildState, mob, time, msg.channel);
      } else {
        msg.channel.send(fmtMsg(`Error: invalid number \"${idx}\" for selection.`));
      }
      guildState.userStateMap.delete(msg.author);
    } else if (msg.content[0] == "!") {
      let amsg = msg.content.slice(1);
      let argv = amsg.split(" ");
      if (argv[0] === "track") {
        let time = 0;
        if (argv.length>2 && !isNaN(argv[argv.length-1])) {
          time = argv[argv.length-1];
        }
        if (argv.length>1 && argv[1]!=null) {
          let resultSet = findMvp(guildState, argv[1]);
          if (resultSet.size == 1) {
            let mob = resultSet.values().next().value;
            updateTime(guildState, mob, time, msg.channel);
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
              guildState.userStateMap.set(msg.author, {resultList: resultList, time: time});
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

pgPool.connect()
  .then(pgClient => {
    return pgClient.query('SELECT * FROM config')
      .then(res => {
        pgClient.release();
        config.botUserToken = res.rows[0].bot_user_token;
        config.userInputChannelName = res.rows[0].user_input_channel_name;
        config.mvpListChannelName =  res.rows[0].mvp_list_channel_name;
        config.mvpAliveExpirationTimeMins = res.rows[0].mvp_alive_expiration_time_mins;
        config.mvpListRefreshRateSecs = res.rows[0].mvp_list_refresh_rate_secs;
        config.maxSelectionTimeSecs = res.rows[0].max_selection_time_secs;
        discordClient.login(config.botUserToken);
      })
  })
