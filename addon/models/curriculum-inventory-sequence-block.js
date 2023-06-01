import Model, { hasMany, belongsTo, attr } from '@ember-data/model';

export default class CurriculumInventorySequenceBlock extends Model {
  @attr('string')
  title;

  @attr('string')
  description;

  @attr('number')
  required;

  @attr('number')
  childSequenceOrder;

  @attr('number')
  orderInSequence;

  @attr('number')
  minimum;

  @attr('number')
  maximum;

  @attr('boolean')
  track;

  @attr('date')
  startDate;

  @attr('date')
  endDate;

  @attr('number')
  duration;

  @belongsTo('curriculum-inventory-academic-level', {
    async: true,
    inverse: 'startingSequenceBlocks',
  })
  startingAcademicLevel;

  @belongsTo('curriculum-inventory-academic-level', {
    async: true,
    inverse: 'endingSequenceBlocks',
  })
  endingAcademicLevel;

  @belongsTo('curriculum-inventory-sequence-block', { async: true, inverse: 'children' })
  parent;

  @hasMany('curriculum-inventory-sequence-block', { async: true, inverse: 'parent' })
  children;

  @belongsTo('curriculum-inventory-report', {
    async: true,
    inverse: 'sequenceBlocks',
  })
  report;

  @hasMany('session', { async: true, inverse: null })
  sessions;

  @hasMany('session', { async: true, inverse: null })
  excludedSessions;

  @belongsTo('course', { async: true, inverse: null })
  course;

  get isRequired() {
    return 1 === parseInt(this.required, 10);
  }

  get isOptional() {
    return 2 === parseInt(this.required, 10);
  }

  get isRequiredInTrack() {
    return 3 === parseInt(this.required, 10);
  }

  get isOrdered() {
    return 1 === parseInt(this.childSequenceOrder, 10);
  }

  get isUnordered() {
    return 2 === parseInt(this.childSequenceOrder, 10);
  }

  get isParallel() {
    return 3 === parseInt(this.childSequenceOrder, 10);
  }

  /**
   * A list of all ancestors (parent, its parents parent etc) of this sequence block.
   * First element of the list is the block's direct ancestor (parent), while the last element is the oldest ancestor.
   * Returns a promise that resolves to an array of sequence block objects.
   * If this sequence block is a top-level block within its owning report, then that array is empty.
   */
  async getAllParents() {
    const parent = await this.parent;
    if (!parent) {
      return [];
    }
    const parentsAncestors = (await parent.getAllParents()).slice();
    return [parent, ...parentsAncestors];
  }
}
