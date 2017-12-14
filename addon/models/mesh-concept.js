import { computed } from '@ember/object';
import DS from 'ember-data';

const { attr, hasMany, Model } = DS;

export default Model.extend({
  name: attr('string'),
  preferred: attr('boolean'),
  scopeNote: attr('string'),
  cash1Name: attr('string'),
  registryNumber: attr('string'),
  createdAt: attr('date'),
  updatedAt: attr('date'),
  terms: hasMany('mesh-term', {async: true}),
  descriptors: hasMany('mesh-descriptor', {async: true}),
  truncatedScopeNote: computed('scopeNote', function() {
    let scopeNote = this.get('scopeNote');
    if (250 < scopeNote.length) {
      scopeNote = scopeNote.substring(0, 250);
    }
    return scopeNote;
  }),
  hasTruncatedScopeNote: computed('scopeNote', 'truncatedScopeNote', function() {
    return this.get('scopeNote').length !== this.get('truncatedScopeNote').length;
  })
});
