import { computed } from '@ember/object';
import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  preferred: DS.attr('boolean'),
  scopeNote: DS.attr('string'),
  cash1Name: DS.attr('string'),
  registryNumber: DS.attr('string'),
  createdAt: DS.attr('date'),
  updatedAt: DS.attr('date'),
  terms: DS.hasMany('mesh-term', {async: true}),
  descriptors: DS.hasMany('mesh-descriptor', {async: true}),
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
