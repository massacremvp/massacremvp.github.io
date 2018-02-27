const helpMessage =
"Usage:\n \
    !track <mvp_name> <minutes_ago>\n \
where <minutes_ago> is optional and means how many minutes ago the mvp is dead.\n \
\n \
Examples:\n \
    INPUT: !track Dracula\n \
    OUTPUT: Dracula (gef_fild01) in 60 to 70 minutes.\n \
\n \
    INPUT: !track Dracula 20\n \
    OUTPUT: Dracula (gef_fild01) in 40 to 50 minutes.";

const Discord = require('discord.js');
var asciitable = require("asciitable");

var config = {
"guilds": process.env.GUILDS,
"botUserToken": process.env.BOT_USER_TOKEN,
"userInputChannelName": process.env.USER_INPUT_CHANNEL_NAME,
"mvpListChannelName": process.env.MVP_LIST_CHANNEL_NAME,
"mvpAliveExpirationTimeMins": process.env.MVP_ALIVE_EXPIRATION_TIME_MINS,
"mvpListRefreshRateSecs": process.env.MVP_LIST_REFRESH_RATE_SECS,
"maxSelectionTimeSecs": process.env.MAX_SELECTION_TIME_SECS
}

const client = new Discord.Client();
const mvpList = require('./mvplist.json');

function genMvpList() {
  let anotherMvpList = [];
  for (let mvp of mvpList) {
    anotherMvpList.push(Object.assign({}, mvp));
  }
  return anotherMvpList;
}

var options = {
  skinny: true,
  intersectionCharacter: "x",
  columns: [
    {field: "name", name: "Name"},
    {field: "map", name: "Map"},
    {field: "respawn", name: "Respawn"},
  ],
};

var guildMap = new Map();
/*
var mvpList = require('./mvplist.json');
var mvpListMessage;
var userStateMap = new Map();
*/

function findMvp(guildState, query) {
  let resultSet = new Set();
  for (let mvp of guildState.mvpList) {
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

function updateTime(guildState, mob, time) {
  if (mob != null) {
    mob.r1 = mob.t1 - time;
    mob.r2 = mob.t2 - time;
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
  }
}

function refreshMvpList(guildState){
  let aliveMvps = [];
  let deadMvps = [];
  for (let mvp of guildState.mvpList) {
    if (!mvp.r2) {
      mvp.r1 = -999;
      mvp.r2 = -999;
    }
    if (mvp.r2 > -config.mvpAliveExpirationTimeMins){
      let list = (mvp.r1>0) ? deadMvps : aliveMvps;
      let respawn = `${Math.round(mvp.r1)} to ${Math.round(mvp.r2)} mins`;
      list.push({name: fill(mvp.name,18), map: fill(mvp.map,10), respawn: fill(respawn,18)});
    }
  }
  let result = "";
  if (aliveMvps.length > 0) {
    let tableAlive = asciitable(options, aliveMvps);
    result += "ALIVE MVPS\n"+tableAlive;
  }
  if (deadMvps.length > 0) {
    let tableDead = asciitable(options, deadMvps);
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

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  let guildNames = config.guilds.split(",");
  for (let guildName of guildNames) {
    let guild = client.guilds.find('name', guildName);
    let guildState = {
      mvpList: genMvpList(),
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
      client.setInterval(function(){
        for (let mvp of guildState.mvpList) {
          mvp.r1 -= config.mvpListRefreshRateSecs/60;
          mvp.r2 -= config.mvpListRefreshRateSecs/60;
        }
        refreshMvpList(guildState);
      }, config.mvpListRefreshRateSecs*1000);
    });
  }
});

client.on('message', msg => {
  let guildState = guildMap.get(msg.channel.guild);
  if (guildState && msg.channel.name === config.userInputChannelName) {
    if (guildState.userStateMap.has(msg.author)) {
      let userState = guildState.userStateMap.get(msg.author);
      let idx = msg.content;
      if (!isNaN(idx) && idx>0 && idx <= userState.resultList.length) {
        let mob = userState.resultList[idx-1];
        let time = userState.time;
        updateTime(guildState, mob, time);
        msg.channel.send(fmtMsg(`${mob.name} (${mob.map}) in ${mob.r1} to ${mob.r2} minutes.`));
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
            updateTime(guildState, mob, time);
            msg.channel.send(fmtMsg(`${mob.name} (${mob.map}) in ${mob.r1} to ${mob.r2} minutes.`));
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
              client.setTimeout(function(){
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

client.login(config.botUserToken);