import Model, { attr } from '@ember-data/model';

export default class LearningMaterialUserRole extends Model {
  @attr('string')
  title;
}
