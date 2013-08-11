var EventEmitter = require('events').EventEmitter;
var chainlang = require('chainlang');

var clio = {};
module.exports = clio;

process.stdin.setEncoding('utf8');
process.stdout.setEncoding('utf8');

// Custom Line-By-Line Input Buffer
// --------------------------------

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
            process.stdin.once('data', onNewInput);
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

// Standard API
// ------------

var defaultPromptOptions = {
    prefix: '',
    delimiter: ': '
};

// Prompt the user for input
clio.prompt = function (prompt, opt, callback) {
    // Normalize arguments
    if(arguments.length === 2){
        // If only 2 arguments, assuming opt was omitted
        callback = opt;
        opt = defaultPromptOptions;
    } else {
        opt.prefix = opt.prefix || defaultPromptOptions.prefix;
        opt.suffix = opt.delimiter || defaultPromptOptions.delimiter;
    }
    
    if(prompt.constructor.name === 'Array'){
        arrayPrompt(prompt, opt, callback);
        return;
    }
    
    prompt(prompt, opt, callback);
};

// Prompts for a series of values, then calls `callback`
// with an object mapping each prompt to its response
function arrayPrompt(promptArray, opt, callback){
    var response = {};
    
    promptForElementAt(0);
    
    function promptForElementAt(index){
        prompt(promptArray[index], opt, function(answer){
            response[promptArray[index]] = answer;
            
            index += 1;
            if(index < promptArray.length){
                promptForElementAt(index);
            } else {
                callback(response);   
            }
        });
    }
}

// Internal prompt function assumes inputs are sanitized/normalized
function prompt(prompt, opt, callback){
    process.stdout.write(opt.prefix + prompt + opt.delimiter);
    lineBuffer.onNextLine(function(line){
         callback(line);
    });
}

// y/n confirmation
clio.confirm = function(message, callback) {
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
clio.readLine = function(callback){
    lineBuffer.onNextLine(callback);
};

// Fluent API
// ----------

// Specification object to be passed to `chainlang.create`
var fluentClio = {};

// `define` is a convenience function for building the spec object
var define = chainlang.append.bind(fluentClio);
