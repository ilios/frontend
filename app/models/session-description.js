import DS from 'ember-data';

export default DS.Model.extend({
  description: DS.attr('string'),
  session: DS.belongsTo('session', {async: true}),
  textDescription: function(){
    var title = this.get('title');
    if(title === undefined){
      return '';
    }
    return title.replace(/(<([^>]+)>)/ig,"");
  }.property('description')
});
