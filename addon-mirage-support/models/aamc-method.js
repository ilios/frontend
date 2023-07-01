import { Model, hasMany } from 'miragejs';

export default Model.extend({
  sessionTypes: hasMany('session-type', { inverse: 'aamcMethods' }),
});
