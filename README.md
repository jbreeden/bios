fluent-cli
==========

Library to ease the creation of command-line applications for nodejs.

!!! Warning !!!
---------------

This is a brand new project, so I don't have much for documentation. The api is certainly not settled yet. It is
all around unstable. But, if you're interested in where it's going... here's an example of it's current usage:


```
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
```

And here's what it looks like when you run that example:

```
-- Testing Standard Prompt --

This is a standard prompt: ok
Response was: ok

-- Testing Fluent Prompt --

name: Jared
email: jared@email.com
name was: Jared
email was: jared@email.com

-- Testing Standard Confirmation --

Does the standard confirm work? (y/n): yeah
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
