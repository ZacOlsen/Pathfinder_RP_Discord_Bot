var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

// Configure logger settings
logger.remove(logger.transports.Console);

logger.add(new logger.transports.Console, {
    colorize: true
});

logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function (user, userID, channelID, message, evt) {

    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {

            // !ping
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
			break;
				
			case 'roll':
			
				if(args.length == 0 || args.length > 3 || args.length == 2){
					bot.sendMessage({
						to: channelID,
						message: '<@' + userID + '> Invalid Command Usage'
					});
					
					break;
				}
			
				var split = args[0].indexOf('d');
				if(split == -1){
					bot.sendMessage({
						to: channelID,
						message: '<@' + userID + '> Invalid Command Usage'
					});
					
					break;
				}
			
				var dieCount = parseInt(args[0].substring(0, split), 10);
				var dieNum = parseInt(args[0].substring(split + 1, args[0].length));
				if(isNaN(dieCount) || dieCount <= 0|| isNaN(dieNum) || dieNum <= 0){
					bot.sendMessage({
						to: channelID,
						message: '<@' + userID + '> Invalid Command Usage'
					});
					
					break;
				}
			
				var i;
				var dSum = 0;
				var dMessage = '(';
				for(i = 0; i < dieCount; i++){
					var d = getRandomInt(1, dieNum);
					dSum += d;						
					dMessage += d;
						
					if(i < dieCount - 1){
						dMessage += ', ';
					}
				}
				dMessage += ')';
			
				if(args.length == 3){
					
					var bSplit = args[2].indexOf('b');
					var bCount = parseInt(args[2].substring(0, bSplit), 10);
					if(isNaN(bCount) || bCount <= 0 || bSplit < 0){
						bot.sendMessage({
							to: channelID,
							message: '<@' + userID + '> Invalid Command Usage'
						});
					
						break;
					}

					var greatestB = 0;
					var bMessage = '(';
					for(i = 0; i < bCount; i++){
						var b = getRandomInt(1, 6);
						if(b > greatestB){
							greatestB = b;
						}
						
						bMessage += b;
						
						if(i < bCount - 1){
							bMessage += ', ';
						}
					}
					bMessage += ')';

					if(args[1] == '+'){
						bot.sendMessage({
							to: channelID,
							message: '<@' + userID + '> total **' + (dSum + greatestB) + '**. Die rolls: ' + dMessage + '. Boons: ' + bMessage + '.'
						});
						
					}else if(args[1] == '-'){
						bot.sendMessage({
							to: channelID,
							message: '<@' + userID + '> total **' + (dSum - greatestB) + '**. Die rolls: ' + dMessage + '. Banes: ' + bMessage + '.'
						});

					}else{
						bot.sendMessage({
							to: channelID,
							message: '<@' + userID + '> Invalid Command Usage'
						});
					
						break;
					}
				}else{
						
					bot.sendMessage({
						to: channelID,
						message: '<@' + userID + '> total **' + dSum + '**. Die rolls: ' + dMessage + '.'
					});
				}
            break;

            // Just add any case commands if you want to..
        }

     }
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}