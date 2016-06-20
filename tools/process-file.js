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
    var fileContent = iconv.fromEncoding(fs.readFileSync(f.source), 'GBK').split('\n');

    fileContent.splice(0, 3);

    var questions = generateQuestions(fileContent);

    fs.writeFileSync(path.join('../', f.dest), JSON.stringify(questions));
});

function generateQuestions(rawData){
    var questions = [];

    for(var i = 0; i < rawData.length; i++){
        var id = rawData[i++].replace('[I]', '').replace('\r', '');
        var text = rawData[i++].replace('[Q]', '').replace('\r', '');
        var answerA = rawData[i++].replace('[A]', '').replace('\r', '');
        var answerB = rawData[i++].replace('[B]', '').replace('\r', '');
        var answerC = rawData[i++].replace('[C]', '').replace('\r', '');
        var answerD = rawData[i++].replace('[D]', '').replace('\r', '');
        var picture = rawData[i++].replace('[P]', '').replace('\r', '').replace('jpg', 'gif');
        
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
        return 'data:image/gif;base64,' + fs.readFileSync(path.join('img', filename)).toString('base64');
    }

    return filename;
}
