clio
====

Library to ease the creation of command-line applications for nodejs. `clio` offers both standard and fluent (provided
by [chainlang](https://npmjs.org/package/chainlang)) interfaces.

!!! Warning !!!
---------------

This is a brand new project, so I don't have much for documentation. The api is certainly not settled yet. It is
all around unstable. But, if you're interested in where it's going... here's an example of it's current usage:


```
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
```

And here's what it looks like when you run that example:

```
-- Testing Standard Prompt --

This is a standard prompt: ok
Response was: ok

-- Testing Fluent Prompt --

name: jared
email: j@mail.com
name was: jared
email was: j@mail.com

-- Testing Standard Confirmation --

Does the standard confirm work? (y/n): y
confirmation was: true

-- Testing Fluent Confirmation --

Does the fluent confirm work? (y/n): Yep
confirmation was: true

-- Testing Standard Selection --

Select a standard option
  1: Do this
  2: Do that
  3: Do this other thing
Enter selection: 1
Selection was: Do this

-- Testing Fluent Selection --

Select a fluent option
  1: Do this fluently
  2: Do that fluently
  3: Do this other thing fluently
Enter selection: 0
Invalid selection. Please try again.
Enter selection: 4
Invalid selection. Please try again.
Enter selection: 3
Selection was: Do this other thing fluently
```
