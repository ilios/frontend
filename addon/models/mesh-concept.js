import Model, { hasMany, attr } from '@ember-data/model';

export default class MeshConcept extends Model {
  @attr('string')
  name;

  @attr('boolean')
  preferred;

  @attr('string')
  scopeNote;

  @attr('string')
  cash1Name;

  @attr('string')
  registryNumber;

  @attr('date')
  createdAt;

  @attr('date')
  updatedAt;

  @hasMany('mesh-term', { async: true })
  terms;

  @hasMany('mesh-descriptor', { async: true })
  descriptors;

  get truncatedScopeNote() {
    let scopeNote = this.scopeNote;
    if (250 < scopeNote.length) {
      scopeNote = scopeNote.substring(0, 250);
    }
    return scopeNote;
  }

  get hasTruncatedScopeNote() {
    return this.scopeNote.length !== this.truncatedScopeNote.length;
  }
}
