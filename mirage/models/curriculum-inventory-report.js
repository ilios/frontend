import { Model, belongsTo, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  sequence: belongsTo(),
  program: belongsTo(),
  sequenceBlocks: hasMany(),
  academicLevels: hasMany(),
});
