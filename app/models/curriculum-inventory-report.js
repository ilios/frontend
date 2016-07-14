import DS from 'ember-data';
import Ember from 'ember';

const { computed, RSVP } = Ember;
const { Promise } = RSVP;

export default DS.Model.extend({
  name: DS.attr('string'),
  description: DS.attr('string'),
  year: DS.attr('string'),
  startDate: DS.attr('date'),
  endDate: DS.attr('date'),
  absoluteFileUri: DS.attr('string'),
  export: DS.belongsTo('curriculum-inventory-export', {async: true}),
  sequence: DS.belongsTo('curriculum-inventory-sequence', {async: true}),
  sequenceBlocks: DS.hasMany('curriculum-inventory-sequence-block', {async: true}),
  program: DS.belongsTo('program', {async: true}),
  academicLevels: DS.hasMany('curriculum-inventory-academic-level', {async: true}),

  topLevelSequenceBlocks: computed('sequenceBlocks.[]', function(){
    return new Promise(resolve => {
      this.get('sequenceBlocks').then(sequenceBlocks => {
        let topLevelBlocks = sequenceBlocks.filter(function (block) {
          return !block.belongsTo('parent').id();
        });
        resolve(topLevelBlocks);
      });
    });
  }),

  isFinalized: computed('export', function(){
    return !! this.belongsTo('export').id();
  }),
});
