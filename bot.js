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
    
    function sendErrorMessage(){
        sendToChannel('<@' + userID + '> Invalid Command Usage.');
    }

    message = message.toLowerCase();
    if (message.substring(0, 6) == '!roll ') {
        message = message.substring(6, message.length);
        message = message.replace(/\s/g, '');
        
        var cmdIndex = 0;
        
        var CommandState = Object.freeze({"numOfDieRolls":0, "dieIndicator":1, "maxDieVal":2, "bDeterminer":3, "numOfBRolls":4, "bIndicator":5});
        var currentState = CommandState.numOfDieRolls;
        
        var numOfDieRolls = '';
        var maxDieVal = '';
        
        var boon = false;
        var bane = false;
        var numOfBRolls = '';
        var bVerify = false;
        
        while(cmdIndex < message.length){
            switch(currentState){
            
                case CommandState.numOfDieRolls:

                    if(isCharDigit(message.charAt(cmdIndex))){
                        numOfDieRolls += message.charAt(cmdIndex);
                        cmdIndex++;
                        
                    }else if(numOfDieRolls.length > 0){
                        currentState = CommandState.dieIndicator;
                        
                    }else{
                        sendErrorMessage();
                        return;
                    }
                
                    break;
                
                case CommandState.dieIndicator:
                
                    if(message.charAt(cmdIndex) == 'd'){
                        cmdIndex++;
                        currentState = CommandState.maxDieVal;
                        
                    }else{
                        sendErrorMessage();
                        return;
                    }
                
                    break;
                    
                case CommandState.maxDieVal:
                
                    if(isCharDigit(message.charAt(cmdIndex))){
                        maxDieVal += message.charAt(cmdIndex);
                        cmdIndex++;
                        
                    }else if(maxDieVal.length > 0){
                        currentState = CommandState.bDeterminer;
                        
                    }else{
                        sendErrorMessage();
                        return;
                    }
                
                break;
                
                case CommandState.bDeterminer:
                
                    if(message.charAt(cmdIndex) == '+'){
                        boon = true;
                        currentState = CommandState.numOfBRolls;
                        cmdIndex++;
                        
                    }else if(message.charAt(cmdIndex) == '-'){
                        bane = true;
                        currentState = CommandState.numOfBRolls;
                        cmdIndex++;

                    }else{
                        sendErrorMessage();
                        return;
                    }
                
                break;
                
                case CommandState.numOfBRolls:
                
                    if(isCharDigit(message.charAt(cmdIndex))){
                        numOfBRolls += message.charAt(cmdIndex);
                        cmdIndex++;
                        
                    }else if(numOfBRolls.length > 0){
                        currentState = CommandState.bIndicator;
                        
                    }else{
                        sendErrorMessage();
                        return;
                    }
                    
                break;
                
                case CommandState.bIndicator:
                
                    if(message.charAt(cmdIndex) == 'b'){
                        bVerify = true;
                        cmdIndex++;
                        
                    }else{
                        sendErrorMessage();
                        return;
                    }
                
                break;
                
                default:
                    cmdIndex = message.length;
                    break;
            }
        }
                
        if(((boon || bane) && !bVerify) || maxDieVal.length == 0){
            sendErrorMessage();
            return;
        }
        
        numOfDieRolls = parseInt(numOfDieRolls);
        maxDieVal = parseInt(maxDieVal);
        numOfBRolls = parseInt(numOfBRolls);
        
        var diceResults = rollDice(numOfDieRolls, maxDieVal);
        
        if(bVerify){
            
            var bResults = rollDice(numOfBRolls, 6);
            var total = boon ? (diceResults.sumOfRolls + bResults.highestRoll) : (diceResults.sumOfRolls - bResults.highestRoll);

            sendToChannel('<@' + userID + '> total **' + total + '**. Die rolls: ' + diceResults.message + (boon ? '. Boons: ' : '. Banes: ') 
                + bResults.message + '.');
            
        }else{
            sendToChannel('<@' + userID + '> total **' + diceResults.sumOfRolls + '**. Die rolls: ' + diceResults.message + '.');
        }        
    }
});

function isCharDigit(c){
    return c >= '0' && c <= '9';
}

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