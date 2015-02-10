import Ember from 'ember';

export default Ember.Controller.extend({
  schoolData: function(){
    console.log(this.get('content.length'));
    var data = this.get('content').map(function(school){
      var obj = {
        x: school.get('title'),
        y: school.get('competencies.length')
      };

      return obj;
    });

    return data;
  }.property('content')
});
