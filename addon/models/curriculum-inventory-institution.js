import Model, { belongsTo, attr } from '@ember-data/model';

export default class CurriculumInventoryInstitution extends Model {
  @attr('string')
  name;

  @attr('string')
  aamcCode;

  @attr('string')
  addressStreet;

  @attr('string')
  addressCity;

  @attr('string')
  addressStateOrProvince;

  @attr('string')
  addressZipCode;

  @attr('string')
  addressCountryCode;

  @belongsTo('school', { async: true })
  school;
}
