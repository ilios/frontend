import DS from 'ember-data';
import Ember from 'ember';
import CategorizableModel from 'ilios/mixins/categorizable-model';

const { computed } =  Ember;
const { filterBy } = computed;

export default DS.Model.extend(CategorizableModel, {
  title: DS.attr('string'),
  school: DS.belongsTo('school', {async: true}),
  topLevelTerms: filterBy('terms', 'isTopLevel', true)
});
