import { computed } from '@ember/object';
import DS from 'ember-data';
import Inflector from 'ember-inflector';
import CategorizableModel from 'ilios-common/mixins/categorizable-model';

Inflector.inflector.irregular('vocabulary', 'vocabularies');

const { attr, belongsTo, Model } = DS;

export default Model.extend(CategorizableModel, {
  title: attr('string'),
  school: belongsTo('school', {async: true}),
  active: attr('boolean'),

  topLevelTerms: computed('terms.[]', async function() {
    const terms = await this.get('terms');
    return terms.toArray().filterBy('isTopLevel');
  })
});
