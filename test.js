var nio = require('./nio');

runCliTests();

function runCliTests(){
    nio.write('Writing output. ');
    nio.writeLine('Writing an output line.');
    nio.writeLine('Now you try...');
    nio.readLine(function (line) {
        nio.writeLine('You wrote: ' + line);
        testStringPrompt();
    });
    
    function testStringPrompt(){
        nio.prompt('This is string prompt', function(reponse){
            nio.writeLine('Reponse: ' + reponse);
            testArrayPrompt();
        });
    };
    
    function testArrayPrompt(){
        nio.writeLine('Please enter your information...');
        nio.prompt(['Name', 'DOB', 'Favorite Color'], function(answers){
            nio.writeLine('Name was: ' + answers.Name);
            nio.writeLine('DOB was: ' + answers.DOB);
            nio.writeLine('Favorite Color was: ' + answers['Favorite Color']);
            testConfirm();
        });
    }
    
    function testConfirm(){
        nio.confirm('Do you perform io?', function(response){
            nio.writeLine('I see, you do ' + (response ? '' : 'not ') + 'perform io.');
            testSelect();
        });
    }
    
    function testSelect(){
        var options = {
            1: 'Option 1',
            2: 'Option 2'
        };
        
        nio.select('Select an option...', options, function(selection){
            nio.writeLine('You selected: ' + selection);
            testList();
        });
    }
    
    function testList(){
        nio.writeLine('Printing a list with at most 2 columns');
        
        var items = [
            'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'
        ];
        
        nio.list(items, 2);
    }
}
