var clio = require('./clio');
var util = require('util');

clio.write('\n-- Testing Standard Prompt --\n\n');

clio.prompt('This is a standard prompt', function(response){
    console.log('Response was: ' + response);
    doFluentPromptTest();
});

function doFluentPromptTest(){
    clio.write('\n-- Testing Fluent Prompt --\n\n');
    
    clio.prompt
        .for('name')
        .and('email')
        .then(function(response){
            console.log('name was: ' + response.name);
            console.log('email was: ' + response.email);
            doStandardConfirmationTest();
        });
}

function doStandardConfirmationTest() {
    clio.write('\n-- Testing Standard Confirmation --\n\n');
    
    clio.confirm('Does the standard confirm work?', function(response){
        console.log('confirmation was: ' + response);
        doFluentConfirmationTest();
    });
}

function doFluentConfirmationTest() {
    clio.write('\n-- Testing Fluent Confirmation --\n\n');
    
    clio.confirm('Does the fluent confirm work?')
        .then(function(response){
            console.log('confirmation was: ' + response);
            doStandardSelectTest();
        });
}

function doStandardSelectTest(){
    clio.write('\n-- Testing Standard Selection --\n\n');
    
    clio.select(
        "Select a standard option", 
        { 
            1: 'Do this',
            2: 'Do that', 
            3: 'Do this other thing'
        },
        function(selection){
            console.log('Selection was: ' + selection);
            doFluentSelectTest();
        });
}

function doFluentSelectTest(){
    clio.write('\n-- Testing Fluent Selection --\n\n');
    
    clio.select.a('fluent option')
        .from({
            1: 'Do this fluently',
            2: 'Do that fluently',
            3: 'Do this other thing fluently'
        })
        .then(function(selection){
            console.log('Selection was: ' + selection);
        });
}

