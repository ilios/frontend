import Model, { attr } from '@ember-data/model';

export default class LearningMaterialStatus extends Model {
  @attr('string')
  title;
}
