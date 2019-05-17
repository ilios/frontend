import Controller from '@ember/controller';
import { reads } from '@ember/object/computed';

export default Controller.extend({
  queryParams: ['course', 'filter', 'sortBy'],

  course: '',
  filter: '',
  sortBy: 'firstOfferingDate:desc',

  materials: reads('model.materials')
});
