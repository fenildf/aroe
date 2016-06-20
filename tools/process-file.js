var fs = require('fs');
var path = require('path');
var iconv = require('iconv-lite');

var files = [
    {
        source: 'class-a.txt',
        dest: 'class-a.json'
    },
    {
        source: 'class-b.txt',
        dest: 'class-b.json'
    },
    {
        source: 'class-c.txt',
        dest: 'class-c.json'
    }
];

files.forEach(function (f) {
    debugger;
    var fileContent = iconv.fromEncoding(fs.readFileSync(f.source), 'GBK').split('\r\n');

    fileContent.splice(0, 3);

    var questions = generateQuestions(fileContent);

    fs.writeFileSync(f.dest, JSON.stringify(questions));
});

function generateQuestions(rawData){
    var questions = [];

    for(var i = 0; i < rawData.length; i++){
        var id = rawData[i++].replace('[I]', '');
        var text = rawData[i++].replace('[Q]', '');
        var answerA = rawData[i++].replace('[A]', '');
        var answerB = rawData[i++].replace('[B]', '');
        var answerC = rawData[i++].replace('[C]', '');
        var answerD = rawData[i++].replace('[D]', '');
        var picture = rawData[i++].replace('[P]', '');
        
        var question = {
            "id": id,
            "sequenced_order": i,
            "text": text,
            "picture": getPicture(picture),
            "tip": "",
            "answers": [
                {
                    "text": answerA,
                    "is_correct": true
                },
                {
                    "text": answerB,
                    "is_correct": false
                },
                {
                    "text": answerC,
                    "is_correct": false
                },
                {
                    "text": answerD,
                    "is_correct": false
                }
            ]
        };

        questions.push(question);
    }

    return questions;
}

function getPicture(filename){
    if(filename != ''){
        return 'data:image/jpeg;base64,' + fs.readFileSync(path.join('img', filename)).toString('base64');
    }

    return filename;
}
