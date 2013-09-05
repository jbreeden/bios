var exec = require('child_process').exec;

namespace('docs', function(){
    directory('docs');
    
    desc('Builds the annotated source');
    task('source', ['docs'], function(){
        exec('docco -o ./docs ./bios.js');
    });
});