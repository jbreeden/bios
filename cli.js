var EventEmitter = require('events').EventEmitter;
var chainlang = require('chainlang');

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

// Core Logic
// ----------

// Read a line from stdin
function readLine(callback) {
    lineBuffer.onNextLine(callback);
};

// Write a string to stdout
function write(str){
    process.stdout.write(str);
}

// Write a line to stdout
function writeLine(line) {
    process.stdout.write(line + '\n');
}

var defaultPromptOptions = {
    prefix: '',
    delimiter: ': '
};

// Prompt the user for input. `prompt` mostly sanitizes input and routes
// to the appropriate method for actual prompting
function prompt(prompt, opt, callback) {
    // Normalize arguments
    if(arguments.length === 2){
        // If only 2 arguments, assuming opt was omitted
        callback = opt;
        opt = defaultPromptOptions;
    } else {
        opt.prefix = opt.prefix || defaultPromptOptions.prefix;
        opt.delimiter = opt.delimiter || defaultPromptOptions.delimiter;
    }
    
    if(prompt.constructor.name === 'Array'){
        arrayPrompt(prompt, opt, callback);
    } else if (typeof prompt === 'string') {
        stringPrompt(prompt, opt, callback);
    } else {
        throw 'Invalid prompt argument';   
    }
};

// Prompts for a series of values, then calls `callback`
// with an object mapping each prompt to its response
function arrayPrompt(promptArray, opt, callback){
    var response = {};
    
    promptForElementAt(0);
    
    function promptForElementAt(index){
        stringPrompt(promptArray[index], opt, function(answer){
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

// `stringPrompt` function assumes inputs are sanitized/normalized
function stringPrompt(prompt, opt, callback){
    process.stdout.write(opt.prefix + prompt + opt.delimiter);
    lineBuffer.onNextLine(function(line){
         callback(line);
    });
}

// y/n confirmation
function confirm(message, callback) {
    process.stdout.write(message + ' (y/n): ');
    lineBuffer.onNextLine(function(answer){
        if(answer.toLowerCase()[0] === 'y'){
            callback(true);
        } else {
            callback(false);
        }
    });
};

function select(message, choices, callback){
    // Normalize input
    if(arguments.length === 2){
        // Assume message omitted
        callback = choices;
        choices = message;
        message = undefined;
    }
    
    if(message){
        process.stdout.write(message + '\n');   
    }
    
    var keys = Object.keys(choices);
    
    keys.forEach(function(key){
        process.stdout.write('  ' + key + ': ' + choices[key] + '\n');   
    });
    
    tryGetSelection();
    
    function tryGetSelection() {
        process.stdout.write('Enter selection: ');1
        lineBuffer.onNextLine(function(input){
            if(keys.indexOf(input) === -1){
                process.stdout.write('Invalid selection. Please try again.\n');
                tryGetSelection();
            } else {
                callback(choices[input]);
            }
        });        
    }
}

// Public API
// ----------

// Specification object to be passed to `chainlang.create`
var cli = {};

// `define` is a convenience function for building the spec object
var define = chainlang.append.bind(cli);

define('readLine',
    function (callback) {
        readLine(callback);
        return null;
    }
);

define('write',
    function (str) {
        write(str);
        return null;
    }
);

define('writeLine', 
    function (line) {
        writeLine(line);
        return null;
    }
);

define('prompt', 
    function (message, opt, callback) {
        if(arguments.length === 2){
            callback = opt;
            opt = {};
        }
        prompt(message, opt, callback);
        return null;
    }
);

define('prompt.for', 
    function (message) {
        this._data.promptFields = [message];
        return this._private.nodes.for;
    }
);

define('_private.nodes.for.and', 
    function (message) {
        this._data.promptFields.push(message);
        return this._private.nodes.for;
    }
);

define('_private.nodes.for.then', 
   function (callback) {
        prompt(this._data.promptFields, callback);
        return null;
    }
);

define('confirm', 
    function (message, callback) {
        if (callback === undefined) {
            this._data.confirmationMessage = message;
            return this._private.nodes.confirm;   
        } else {
            confirm(message, callback);
        }
    }
);

define('_private.nodes.confirm.then', 
    function (callback) {
        confirm(this._data.confirmationMessage, callback);
        return null;
    }
);

define('select', 
    function (message, choices, callback) {
        select(message, choices, callback);
        return null;
    }
);

define('select.a', 
    function (toSelect) {
        this._data.selectionMessage = 'Select a ' + toSelect;
        return this._private.nodes.selectFrom;
    }
);

define('select.an',
    function (toSelect) {
        this._data.selectionMessage = 'Select an ' + toSelect;
        return this._private.nodes.selectFrom;
    }
);

define('_private.nodes.selectFrom.from', 
    function (choices) {
        this._data.selectionChoices = choices;
        return this._private.nodes.selectFromThen;
    }
);

define('_private.nodes.selectFromThen.then',
    function (callback) {
        select(
            this._data.selectionMessage,
            this._data.selectionChoices,
            callback
        );
        return null;
    }
);

module.exports = chainlang.create(cli);