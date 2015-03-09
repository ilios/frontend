import DS from 'ember-data';

export default DS.Model.extend({
  session: DS.belongsTo('session', {async: true}),
  description: DS.attr('string'),
  textDescription: function(){
    var title = this.get('title');
    if(title === undefined){
      return '';
    }
    return title.replace(/(<([^>]+)>)/ig,"");
  }.property('description')
});
