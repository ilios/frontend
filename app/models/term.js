import DS from 'ember-data';
import Ember from 'ember';

const { computed } =  Ember;
const { empty } = computed;

export default DS.Model.extend({
  title: DS.attr('string'),
  description: DS.attr('string'),
  vocabulary: DS.belongsTo('vocabulary', {async: true}),
  parent: DS.hasMany('term', {
    inverse: 'children',
    async: true
  }),
  children: DS.hasMany('term', {
    inverse: 'parent',
    async: true
  }),
  isTopLevel: empty('parent.content'),
  allParentTitles: computed('parent.{title,allParentTitles}', function(){
    let titles = [];
    if (! this.get('isTopLevel')){
      if (this.get('parent.allParentTitles')){
        titles.pushObjects(this.get('parent.allParentTitles'));
      }
      titles.pushObject(this.get('parent.title'));
    }
    return titles;
  }),
});
