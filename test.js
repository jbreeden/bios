var cli = require('./cli');
var util = require('util');

cli.write('\n-- Testing Standard Prompt --\n\n');

cli.prompt('This is a standard prompt', function(response){
    cli.writeLine('Response was: ' + response);
    doFluentPromptTest();
});

function doFluentPromptTest(){
    cli.write('\n-- Testing Fluent Prompt --\n\n');
    
    cli.prompt
        .for('name')
        .and('email')
        .then(function(response){
            cli.writeLine('name was: ' + response.name);
            cli.writeLine('email was: ' + response.email);
            doStandardConfirmationTest();
        });
}

function doStandardConfirmationTest() {
    cli.write('\n-- Testing Standard Confirmation --\n\n');
    
    cli.confirm('Does the standard confirm work?', function(response){
        cli.writeLine('confirmation was: ' + response);
        doFluentConfirmationTest();
    });
}

function doFluentConfirmationTest() {
    cli.write('\n-- Testing Fluent Confirmation --\n\n');
    
    cli.confirm('Does the fluent confirm work?')
        .then(function(response){
            cli.writeLine('confirmation was: ' + response);
            doStandardSelectTest();
        });
}

function doStandardSelectTest(){
    cli.write('\n-- Testing Standard Selection --\n\n');
    
    cli.select(
        "Select a standard option", 
        { 
            1: 'Do this',
            2: 'Do that', 
            3: 'Do this other thing'
        },
        function(selection){
            cli.writeLine('Selection was: ' + selection);
            doFluentSelectTest();
        });
}

function doFluentSelectTest(){
    cli.write('\n-- Testing Fluent Selection --\n\n');
    
    cli.select.a('fluent option')
        .from({
            1: 'Do this fluently',
            2: 'Do that fluently',
            3: 'Do this other thing fluently'
        })
        .then(function(selection){
            cli.writeLine('Selection was: ' + selection);
        });
}

