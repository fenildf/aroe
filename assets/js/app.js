var EXERCISE_TYPE = {
    random: 'random',
    sequence: 'sequence',
    error: 'error'
};

var CLASS_LEVEL = {
    classA: 'class-a',
    classB: 'class-b',
    classC: 'class-c'
};

function App(options){
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
    };

    var self = this;
    this.options = options;
    this.options.routes.index = _.template($(this.options.routes.index).html());
    this.options.routes.readme = _.template($(this.options.routes.readme).html());
    this.options.routes.others = _.template($(this.options.routes.others).html());
    this.options.question.template = _.template($(this.options.question.template).html());

    function getTitle(hash){
        switch(hash){
            case CLASS_LEVEL.classA:
                return 'A类 - ';
            case CLASS_LEVEL.classB:
                return 'B类 - ';
            case CLASS_LEVEL.classC:
                return 'C类 - ';
            default:
                return '';
        }
    }

    $(window).on('hashchange', function(){
        var root = utils.getRoot(location.hash);
        if(_.contains([CLASS_LEVEL.classA, CLASS_LEVEL.classB, CLASS_LEVEL.classC], root)){
            self.switchTo(self.options.routes.others(), getTitle(root));
            self.updateExercise(root, utils.getExerciseType(location.hash));
            self.load(root, utils.getExerciseType(location.hash));
            $(self.options.exerciseType.random).on('click', function(){
                location.hash = '#' + utils.getRoot(location.hash) + '/' + EXERCISE_TYPE.random;
            });
            $(self.options.exerciseType.sequence).on('click', function(){
                location.hash = '#' + utils.getRoot(location.hash) + '/' + EXERCISE_TYPE.sequence;
            });
            $(self.options.exerciseType.error).on('click', function(){
                location.hash = '#' + utils.getRoot(location.hash) + '/' + EXERCISE_TYPE.error;
            });
            $(self.options.toolbar.clearAllErrorAnswers).on('click', function(){
                self.clearAllErrorAnswers(root);
            });
            $(self.options.toolbar.clearAll).on('click', function(){
                self.clearAll();
            });
        } else if(root == 'readme'){
            self.switchTo(self.options.routes.readme());
        } else {
            self.switchTo(self.options.routes.index());
        }
    });

    $(window).trigger('hashchange');
}

App.prototype.showQuestion = function(index, question, totalCount){
    question.randomAnswers();
    var self = this;
    var classLevel = utils.getRoot(location.hash);
    var exerciseType = utils.getExerciseType(location.hash);
    $(self.options.question.container)
        .empty()
        .append(self.options.question.template(question))
        .find('button')
        .on('click', function(){
            var btn = $(this);
            if(btn.attr('iscorrect') === 'true'){
                self.questions.next();
            } else {
                self.addErrorQuestions(classLevel, question);
                btn.addClass("list-group-item-danger");
            }
        });
    this.updateProgress(index, totalCount);
    this.saveCurrentIndex(classLevel, exerciseType, index);
};

App.prototype.updateProgress = function(index, totalCount){
    var width = (index + 1) / totalCount * 100.0;
    width = width.toFixed(0);
    $(this.options.progressbar).css("width", width + "%").text(width + "%");
};

App.prototype.load = function(classLevel, exerciseType){
    var self = this;

    var storedQuestions = self.getStoredQuestions(classLevel, exerciseType);
    var storedIndex = self.getStoredIndex(classLevel, exerciseType);

    function gotData(data, isFromAjax){
        self.hideWaiting();
        if(isFromAjax){
            if(exerciseType == EXERCISE_TYPE.random){
                data = utils.randomizeData(data);
            }
            self.saveQuestions(classLevel, exerciseType, data);
        }

        self.questions = new Questions({
            data: data,
            onIndexChange: self.showQuestion.bind(self)
        });

        self.questions.setIndex(storedIndex);

        $(self.options.toolbar.first).on('click', self.questions.first.bind(self.questions));
        $(self.options.toolbar.prev).on('click', self.questions.prev.bind(self.questions));
        $(self.options.toolbar.next).on('click', self.questions.next.bind(self.questions));
        $(self.options.toolbar.last).on('click', self.questions.last.bind(self.questions));

        self.questions.next();
    }

    if(storedQuestions.length > 0){
        console.log('read from local');
        gotData(storedQuestions);
        return;
    }
    if(storedQuestions.length === 0 && exerciseType != EXERCISE_TYPE.error){
        console.log('read from json file');
        self.showWaiting();
        $.ajax({
            dataType: "json",
            url: classLevel + '.json',
            success: gotData,
            error: function(a1, a2){
                alert(a2);
            }
        });
        return;
    }

    gotData([], true);
};

App.prototype.switchTo = function(html, pageTitle){
    var self = this;
    if(_.isUndefined(pageTitle)){
        pageTitle = '';
    }

    $(self.options.titleSuffix).text(pageTitle);
    $(self.options.container).empty().append(html);
};

App.prototype.updateExercise = function(classLevel, exerciseType){
    $(this.options.exerciseType.random).parent('ul').find('li.active').removeClass('active');
    $(this.options.exerciseType.random).parent('ul').find('li[exercise="' + exerciseType + '"]').addClass('active');
    $(this.options.exerciseType.error).find('span.badge').text(this.getErrorQuestions(classLevel).length);
};

App.prototype.saveCurrentIndex = function(classLevel, exerciseType, index){
    localStorage.setItem('aroe.' + classLevel + '.index.' + exerciseType, index);
};

App.prototype.getStoredIndex = function(classLevel, exerciseType){
    var index = parseInt(localStorage.getItem('aroe.' + classLevel + '.index.' + exerciseType)) - 1;

    if(_.isNaN(index)){
        index = -1;
    }

    if(index < -1){
        index = -1;
    }

    return index;
};

App.prototype.saveQuestions = function(classLevel, exerciseType, questions){
    localStorage.setItem('aroe.' + classLevel + '.questions.' + exerciseType, JSON.stringify(questions));
};

App.prototype.getStoredQuestions = function(classLevel, exerciseType){
    var q = localStorage.getItem('aroe.' + classLevel + '.questions.' + exerciseType);
    if(q == null){
        q = '[]';
    }

    return JSON.parse(q);
};

App.prototype.getErrorQuestions = function(classLevel){
    return this.getStoredQuestions(classLevel, EXERCISE_TYPE.error);
};

App.prototype.addErrorQuestions = function(classLevel, question){
    console.log(question);
    var errorQuestions = this.getErrorQuestions(classLevel);

    if(!_.any(errorQuestions, function(q){return q.id == question.id;})){
        errorQuestions.push(question);
        this.saveQuestions(classLevel, EXERCISE_TYPE.error, errorQuestions);
        $(this.options.exerciseType.error).find('span.badge').text(errorQuestions.length);
    }
};

App.prototype.clearAllErrorAnswers = function(classLevel){
    localStorage.removeItem('aroe.' + classLevel + '.questions.' + EXERCISE_TYPE.error);
    localStorage.removeItem('aroe.' + classLevel + '.index.' + EXERCISE_TYPE.error);
    $(this.options.exerciseType.error).find('span.badge').text('0');
};

App.prototype.clearAll = function(){
    localStorage.clear();
    location.hash = '#index';
};

App.prototype.showWaiting = function(){
    $(this.options.waiting).modal('show');
};

App.prototype.hideWaiting = function(){
    $(this.options.waiting).modal('hide');
};

