import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  competency: DS.belongsTo('competency', {async: true}),
  courses: DS.hasMany('course', {async: true}),
  sessions: DS.hasMany('session', {async: true}),
  children: DS.hasMany('objective', {
    inverse: 'parents',
    async: true
  }),
  parents: DS.hasMany('objective', {
    inverse: 'children',
    async: true
  }),
  programYear: DS.belongsTo('program-year',  {async: true}),
  meshDescriptors: DS.hasMany('mesh-descriptor', {async: true}),
  shortTitle: function(){
    var title = this.get('title');
    if(title === undefined){
      return '';
    }
    return title.substr(0,200);
  }.property('title')
});
