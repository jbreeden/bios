var bios = require('./bios');

runBiosTests();

function runBiosTests(){
    bios.write('Writing output. ');
    bios.writeLine('Writing an output line.');
    bios.writeLine('Now you try...');
    bios.readLine(function (line) {
        bios.writeLine('You wrote: ' + line);
        testStringPrompt();
    });
    
    function testStringPrompt(){
        bios.prompt('This is string prompt', function(reponse){
            bios.writeLine('Reponse: ' + reponse);
            testArrayPrompt();
        });
    };
    
    function testArrayPrompt(){
        bios.writeLine('Please enter your information...');
        bios.prompt(['Name', 'DOB', 'Favorite Color'], function(answers){
            bios.writeLine('Name was: ' + answers.Name);
            bios.writeLine('DOB was: ' + answers.DOB);
            bios.writeLine('Favorite Color was: ' + answers['Favorite Color']);
            testConfirm();
        });
    }
    
    function testConfirm(){
        bios.confirm('Do you perform io?', function(response){
            bios.writeLine('I see, you do ' + (response ? '' : 'not ') + 'perform io.');
            testSelect();
        });
    }
    
    function testSelect(){
        var options = {
            1: 'Option 1',
            2: 'Option 2'
        };
        
        bios.select('Select an option...', options, function(selection){
            bios.writeLine('You selected: ' + selection);
            testList();
        });
    }
    
    function testList(){
        bios.writeLine('Printing a list with at most 2 columns');
        
        var items = [
            'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'
        ];
        
        bios.list(items, 2);
    }
}
