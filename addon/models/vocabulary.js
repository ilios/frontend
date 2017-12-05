import DS from 'ember-data';
import Ember from 'ember';
import Inflector from 'ember-inflector';
import CategorizableModel from 'ilios-common/mixins/categorizable-model';

Inflector.inflector.irregular('vocabulary', 'vocabularies');

const { computed } =  Ember;

export default DS.Model.extend(CategorizableModel, {
  title: DS.attr('string'),
  school: DS.belongsTo('school', {async: true}),
  topLevelTerms: computed('terms.[]', async function() {
    const terms = await this.get('terms');
    return terms.toArray().filterBy('isTopLevel');
  })
});
