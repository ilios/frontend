import Model, { belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import Inflector from 'ember-inflector';
import CategorizableModel from 'ilios-common/mixins/categorizable-model';

Inflector.inflector.irregular('vocabulary', 'vocabularies');

export default Model.extend(CategorizableModel, {
  title: attr('string'),
  school: belongsTo('school', {async: true}),
  active: attr('boolean'),

  topLevelTerms: computed('terms.[]', async function() {
    const terms = await this.get('terms');
    return terms.toArray().filterBy('isTopLevel');
  })
});
