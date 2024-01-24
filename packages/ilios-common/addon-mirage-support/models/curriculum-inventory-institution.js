import { Model, belongsTo } from 'miragejs';

export default Model.extend({
  school: belongsTo('school', { inverse: 'curriculumInventoryInstitution' }),
});
