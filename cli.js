var EventEmitter = require('events').EventEmitter;

var cli = {};
module.exports = cli;

process.stdin.setEncoding('utf8');
process.stdout.setEncoding('utf8');

var lineBuffer = (function(){
    var buffer = {};
    buffer.lines = [];
    buffer.lastPartial = '';
    buffer.emitter = new EventEmitter();
    
    // Register a listener for the next line
    buffer.onNextLine = function(callback){
        // Call the callback once a line is ready
        buffer.emitter.once('line', callback);
    };
    
    // On new line listener
    buffer.emitter.on('newListener', function(event){
        if(event !== 'line'){
            return;
        }
        
        if(buffer.lines.length > 0){
            var line = buffer.lines.shift();
            
            // listeners are not bound until after the newListener event handlers
            // are run, so we'll fire the event on nextTick
            process.nextTick(
                function(){buffer.emitter.emit('line', line);}
            );
        } else {
            process.stdin.on('data', onNewInput);
            process.stdin.resume();
        }
    });
    
    function onNewInput(data){
        var newLines = data.split('\n');
        
        buffer.lines = buffer.lines.concat(newLines);
        
        // Concatenate any partial line from the last data read
        // onto the first line of the new data result
        buffer.lines[0] = buffer.lastPartial + buffer.lines[0];
        
        // If the last element of the data spit was an empty string,
        // as when data ends in a '\n', the lastPartial will be set back
        // to an empty string here, no harm done. Otherwise, the end of the
        // data block was not a complete line and will be saved off here.
        buffer.lastPartial = buffer.lines.pop();
        
        // Pause input until we're out of lines again
        process.stdin.pause();
        
        var line = buffer.lines.shift();
        buffer.emitter.emit('line', line);
    }
    
    return buffer;
}());

// Prompt the user for input
cli.prompt = function (prompt, callback) {
    process.stdout.write(prompt);
    lineBuffer.onNextLine(function(line){
         callback(line);
    });
};

// Y/N confirmation
cli.confirm = function(message, callback) {
    process.stdout.write(message + ' (y/n): ');
    lineBuffer.onNextLine(function(answer){
        if(answer.toLowerCase()[0] === 'y'){
            callback(true);
        } else {
            callback(false);
        }
    });
};

// Read a line from stdin
cli.readLine = function(callback){
    lineBuffer.onNextLine(callback);
};