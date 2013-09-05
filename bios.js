var EventEmitter = require('events').EventEmitter;

// Expose public API
// -----------------

var bios = {
    readLine: readLine,
    write: write,
    writeLine: writeLine,
    prompt: prompt,
    confirm: confirm,
    select: select,
    list: list
};

module.exports = bios;

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
    process.stdout.write(( line !== undefined ? line : '') + '\n');
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

// Prompt the user to select from a list of `choices` <br/>
// `select` will print `message`, then each key-value pair from
// the `choices` object, then pass the result to `callback`
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

function list(tokens, maxColumns, colSep){
    colSep = colSep || '';
    var rowCount = Math.ceil(tokens.length / maxColumns);
    var rows = [];
    
    // create an array for each row
    for(var i = 0; i < rowCount; ++i){
        rows.push([]);   
    }

    tokens.forEach(function(el, index){
        rows[index % rowCount].push(el);
    });
    
    // Pad columns
    for(i = 0; i < rows[0].length; ++ i){
        var maxWidth = 0;
        rows.forEach(function(row){
            if(row[i] !== undefined){
                maxWidth = (maxWidth > row[i].length) ? maxWidth : row[i].length;
            }
        });
        
        rows.forEach(function(row){
            var item = (row[i] !== undefined && row[i] !== null) ? row[i] : '';
            row[i] = item + (new Array(maxWidth - item.length + 2)).join(' ');
        });
    }
    
    // Print rows
    rows.forEach(function(row){
        row.forEach(function(item, index){
            write(' ' + item + colSep);
        });
        writeLine();
    });
}