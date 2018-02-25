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

var mvpList = require('./mvplist.json');
var config = require('./config.json');

const client = new Discord.Client();

var options = {
  skinny: true,
  intersectionCharacter: "x",
  columns: [
    {field: "name", name: "Name"},
    {field: "map", name: "Map"},
    {field: "respawn", name: "Respawn"},
  ],
};

var mvpListMessage;
var userStateMap = new Map();

function findMvp(query) {
  var resultSet = new Set();
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

function updateTime(mob, time) {
  if (mob != null) {
    mob.r1 = mob.t1 - time;
    mob.r2 = mob.t2 - time;
    mvpList.sort(function(a, b){
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
    refreshMvpList();
  }
}

function refreshMvpList(){
  var aliveMvps = [];
  var deadMvps = [];
  for (let mvp of mvpList) {
    if (!mvp.r2) {
      mvp.r1 = -999;
      mvp.r2 = -999;
    }
    if (mvp.r2 > -config.mvpAliveExpirationTimeMins){
      var list = (mvp.r1>0) ? deadMvps : aliveMvps;
      var respawn = `${Math.round(mvp.r1)} to ${Math.round(mvp.r2)} mins`;
      list.push({name: fill(mvp.name,18), map: fill(mvp.map,10), respawn: fill(respawn,18)});
    }
  }
  var result = "";
  if (aliveMvps.length > 0) {
    var tableAlive = asciitable(options, aliveMvps);
    result += "ALIVE MVPS\n"+tableAlive;
  }
  if (deadMvps.length > 0) {
    var tableDead = asciitable(options, deadMvps);
    result += "\n\nDEAD MVPS\n"+tableDead;
  }
  if (aliveMvps.length == 0 && deadMvps.length == 0) {
    result = "No MVPs has been tracked.";
  }
  mvpListMessage.edit(fmtMsg(result));
}

function fmtMsg(msg) {
  return "```css\n"+msg+"```";
}

function fill(str, num) {
  var res = str;
  for(var i=0; i<num-str.length; ++i){
    res+=" ";
  }
  return res;
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  var channel = client.channels.find("name", config.mvpListChannelName);
  channel.bulkDelete(1);
  channel.send(fmtMsg("Starting list..."))
  .then(function(message){
    mvpListMessage = message;
    refreshMvpList();
    client.setInterval(function(){
      for (let mvp of mvpList) {
        mvp.r1 -= config.mvpListRefreshRateSecs/60;
        mvp.r2 -= config.mvpListRefreshRateSecs/60;
      }
      refreshMvpList();
    }, config.mvpListRefreshRateSecs*1000);
  });
});

client.on('message', msg => {
  if (msg.channel.name === config.userInputChannelName) {
    if (userStateMap.has(msg.author)) {
      var userState = userStateMap.get(msg.author);
      var idx = msg.content;
      if (!isNaN(idx) && idx>0 && idx <= userState.resultList.length) {
        var mob = userState.resultList[idx-1];
        var time = userState.time;
        updateTime(mob, time);
        msg.channel.send(fmtMsg(`${mob.name} (${mob.map}) in ${mob.r1} to ${mob.r2} minutes.`));
      } else {
        msg.channel.send(fmtMsg(`Error: invalid number \"${idx}\" for selection.`));
      }
      userStateMap.delete(msg.author);
    } else if (msg.content[0] == "!") {
      var amsg = msg.content.slice(1);
      var argv = amsg.split(" ");
      if (argv[0] === "track") {
        var time = 0;
        if (argv.length>2 && !isNaN(argv[argv.length-1])) {
          time = argv[argv.length-1];
        }
        if (argv[1]!=null) {
          var resultSet = findMvp(argv[1]);
          if (resultSet.size == 1) {
            var mob = resultSet.values().next().value;
            updateTime(mob, time);
            msg.channel.send(fmtMsg(`${mob.name} (${mob.map}) in ${mob.r1} to ${mob.r2} minutes.`));
          } else if (resultSet.size > 1) {
            var msgStr = `More than one MVP has been found. Type the number of MVP you want to track:\n`;
            var i = 1;
            var resultList = [];
            for (let mob of resultSet) {
              msgStr += `${i}. ${mob.name} (${mob.map})\n`;
              resultList.push(mob);
              ++i;
            }
            msg.channel.send(fmtMsg(msgStr))
            .then(function(message){
              userStateMap.set(msg.author, {resultList: resultList, time: time});
              client.setTimeout(function(){
                if (userStateMap.has(msg.author)) {
                  msg.channel.send(fmtMsg(`${msg.author.username}' selection time has been expired.`));
                  userStateMap.delete(msg.author);
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