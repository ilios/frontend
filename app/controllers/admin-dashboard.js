import Ember from 'ember';
import config from '../config/environment';

const { IliosFeatures: { showUnassignedStudents } } = config;
const { Controller } = Ember;

export default Controller.extend({
  showUnassignedStudents: showUnassignedStudents
});
