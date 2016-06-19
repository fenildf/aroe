function Question(id, text, picture, answers, tips){
    this.id = id;
    this.text = text;
    this.picture = picture;
    this.answers = answers;
    this.tips = tips;
}

Question.prototype.randomAnswers = function(){
    _.each(this.answers, function(a){
        a.randOrder = Math.random();
    });

    this.answers = _.sortBy(this.answers, 'randOrder');
};

function Questions(options){
    this.options = options;
    this.questions = _.map(options.data, function(o){
        return new Question(o.id, o.text, o.picture, o.answers, o.tips);
    });
    this.index = -1;
    this.totalCount = options.data.length;
}

Questions.prototype.first = function(){
    if(this.index != 0){
        this.index = 0;
        this.options.onIndexChange(this.index, this.questions[this.index], this.totalCount);
    }
};

Questions.prototype.prev = function(){
    if(this.index > 0){
        this.index--;
        this.options.onIndexChange(this.index, this.questions[this.index], this.totalCount);
    }
};

Questions.prototype.next = function(){
    if(this.index < this.totalCount - 1){
        this.index++;
        this.options.onIndexChange(this.index, this.questions[this.index], this.totalCount);
    }
};

Questions.prototype.last = function(){
    if(this.index != this.totalCount - 1){
        this.index = this.totalCount - 1;
        this.options.onIndexChange(this.index, this.questions[this.index], this.totalCount);
    }
};

Questions.prototype.setIndex = function(index){
    this.index = index;
};

Questions.prototype.statistics = function(){
    return {
        totalCount: this.totalCount,
        currentIndex: this.index,
        currentPercentage: this.index / this.totalCount * 100.0
    };
};