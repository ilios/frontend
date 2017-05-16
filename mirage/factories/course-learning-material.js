import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  required: true,
  publicNotes: true,
  course: association(),
  learningMaterial: association(),
});
