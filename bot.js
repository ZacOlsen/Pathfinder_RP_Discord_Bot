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

    function sendToChannel(message){
        bot.sendMessage({
            to: channelID,
            message: message
        });
    }

    if (message.substring(0, 1) == '!') {
        message = message.toLowerCase();
        var args = message.substring(1).split(' ');
        var cmd = args[0];
           
        args = args.splice(1);
        switch(cmd) {

            case 'ping':
                sendToChannel('Pong!');
                break;
                
            case 'roll':
            
                if(args.length == 0 || args.length > 3 || args.length == 2){
                    sendToChannel('<@' + userID + '> Invalid Command Usage');
                    break;
                }
            
                var split = args[0].indexOf('d');
                if(split == -1){
                    sendToChannel('<@' + userID + '> Invalid Command Usage');
                    break;
                }
            
                var numberOfRolls = parseInt(args[0].substring(0, split), 10);
                var maxDieValue = parseInt(args[0].substring(split + 1, args[0].length));
                if(isNaN(numberOfRolls) || numberOfRolls <= 0|| isNaN(maxDieValue) || maxDieValue <= 0){
                    sendToChannel('<@' + userID + '> Invalid Command Usage');
                    break;
                }
            
                var dResults = rollDice(numberOfRolls, maxDieValue);
            
                if(args.length == 3){
                    
                    var bSplit = args[2].indexOf('b');
                    var numberOfBRolls = parseInt(args[2].substring(0, bSplit), 10);
                    if(isNaN(numberOfBRolls) || numberOfBRolls <= 0 || bSplit < 0){
                        sendToChannel('<@' + userID + '> Invalid Command Usage');
                        break;
                    }
                
                    var bResults = rollDice(numberOfBRolls, 6);
                    var total = dResults.sumOfRolls;
                    var bMessage;

                    if(args[1] == '+'){
                        total += bResults.highestRoll;
                        bMessage = '. Boons: ';
                        
                    }else if(args[1] == '-'){
                        total -= bResults.highestRoll;
                        bMessage = '. Banes: ';

                    }else{
                        sendToChannel('<@' + userID + '> Invalid Command Usage');
                    }
                    
                    sendToChannel('<@' + userID + '> total **' + total + 
                        '**. Die rolls: ' + dResults.message + bMessage + bResults.message + '.');
                    
                }else{
                    sendToChannel('<@' + userID + '> total **' + dResults.sumOfRolls + '**. Die rolls: ' + dResults.message + '.');
                }
                
                break;
        }
     }
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollDice(numberOfRolls, maxDieValue){
    
    var i;
    var sum = 0;
    var highestRoll = 0;
    var message = '(';
    for(i = 0; i < numberOfRolls; i++){
        var roll = getRandomInt(1, maxDieValue);
        sum += roll;                        
        message += roll;
        
        if(roll > highestRoll){
            highestRoll = roll;
        }
        
        if(i < numberOfRolls - 1){
            message += ', ';
        }
    }
    
    message += ')';
    
    return {
        message: message,
        highestRoll: highestRoll,
        sumOfRolls: sum
    };
}