import Model, { belongsTo, attr } from '@ember-data/model';

export default class UserSessionMaterialStatusModel extends Model {
  @attr('number')
  status;

  @belongsTo('user', { async: true })
  user;

  @belongsTo('session-learning-material', { async: true })
  material;
}
