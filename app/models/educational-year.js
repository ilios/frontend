import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('number'),
  academicYearTitle: function(){
    return this.get('title') + ' - ' + (parseInt(this.get('title')) + 1);
  }.property('title')
});
