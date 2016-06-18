function Utils(){
    
}

Utils.prototype.getPath = function(hash, index){
    if(index < 0){
        return '';
    }

    var parts = hash.split('/');

    if(index >= parts.length){
        return '';
    }

    return parts[index].replace('#', '').toLowerCase();
};

Utils.prototype.getRoot = function(hash){
    return this.getPath(hash, 0);
};

Utils.prototype.getExerciseType = function(hash){
    var exerciseType = this.getPath(hash, 1);
    
    if(exerciseType == ''){
        return 'random';
    }
    
    return exerciseType;
};

Utils.prototype.randomizeData = function(data){
    _.each(data, function(q){
        q.randOrder = Math.random();
    });

    data = _.sortBy(data, 'randOrder');
    
    return data;
};

var utils = new Utils();