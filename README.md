clio
====

Library to ease the creation of command-line applications for nodejs

!!! Warning !!!
---------------

This is a brand new project, so I don't have much for documentation. The api is certainly not settled yet. It is
all around unstable. But, if you're interested in where it's going... here's an example of it's current usage:


```
var clio = require('./clio');

clio.prompt('This is a standard prompt', function(response){
    console.log('Response was: ' + response);
    doFluentPromptTest();
});

function doFluentPromptTest(){

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

    clio.confirm('Does the standard confirm work?', function(response){
        console.log('confirmation was: ' + response);
        doFluentConfirmationTest();
    });
    
}

function doFluentConfirmationTest() {

    clio.confirm('Does the fluent confirm work?')
        .then(function(response){
            console.log('confirmation was: ' + response);
            doStandardSelectTest();
        });
        
}

function doStandardSelectTest(){

    clio.select(
        "Select a standard option", 
        { 1: 'Do this', 2: 'Do that', 3: 'Do this other thing'},
        function(selection){
            console.log('Selection was: ' + selection);
            doFluentSelectTest();
        });
        
}

function doFluentSelectTest(){

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
This is a standard prompt: ok
Response was: ok
name: Jared
email: jaredsEmail@provider.com
name was: Jared
email was: jaredsEmail@provider.com
Does the standard confirm work? (y/n): y
confirmation was: true
Does the fluent confirm work? (y/n): y
confirmation was: true
Select a standard option
  1: Do this
  2: Do that
  3: Do this other thing
Enter selection: 4
Invalid selection. Please try again.
Enter selection: 3
Selection was: Do this other thing
Select a fluent option
  1: Do this fluently
  2: Do that fluently
  3: Do this other thing fluently
Enter selection: 9
Invalid selection. Please try again.
Enter selection: 0
Invalid selection. Please try again.
Enter selection: 1
Selection was: Do this fluently
```
