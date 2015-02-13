module.exports = {
  changes: {},
  get: function(name) {
    this.initializeChangeStore(name);
    var fixtures = require ('../fixtures/' + name + '.js');
    var changes = this.getChanges(name);
    changes.forEach(function(obj){
      fixtures[obj.id] = obj;
    });

    return fixtures;
  },
  save: function(name, obj){
    this.initializeChangeStore(name);
    this.getChanges(name).push(obj);
  },
  initializeChangeStore: function(name){
    if(! (name in this.changes)){
      this.changes[name] = [];
    }
  },
  getChanges: function(name){
    this.initializeChangeStore(name);
    return this.changes[name];
  }
};
