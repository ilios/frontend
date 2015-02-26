module.exports = {
  changes: {},
  deleted: {},
  get: function(name) {
    this.initializeChangeStore(name);
    var fixtures = require ('../fixtures/' + name + '.js');
    var changes = this.getChanges(name);
    var deleted = this.getDeleted(name);
    changes.forEach(function(obj){
      if(!(obj.id in fixtures)){
        fixtures[obj.id] = obj;
      } else {
        for(var key in obj){
          fixtures[obj.id][key] = obj[key];
        }
      }
    });
    deleted.forEach(function(id){
      if(id in fixtures){
        delete fixtures[id];
      }
    });

    return fixtures;
  },
  save: function(name, obj){
    this.initializeChangeStore(name);
    this.getChanges(name).push(obj);
  },
  remove: function(name, obj){
    this.getDeleted(name).push(obj.id);
  },
  initializeChangeStore: function(name){
    if(! (name in this.changes)){
      this.changes[name] = [];
    }
  },
  initializeDeleteStore: function(name){
    if(! (name in this.deleted)){
      this.deleted[name] = [];
    }
  },
  getChanges: function(name){
    this.initializeChangeStore(name);
    return this.changes[name];
  },
  getDeleted: function(name){
    this.initializeDeleteStore(name);
    return this.deleted[name];
  }
};
