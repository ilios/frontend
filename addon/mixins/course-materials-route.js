import Mixin from '@ember/object/mixin';
import { all } from 'rsvp';

export default Mixin.create({
  titleToken: 'general.coursesAndSessions',
  afterModel(course){
    return all([
      this.loadCourseLearningMaterials(course),
      this.loadSessionLearningMaterials(course),
    ]);

  },
  async loadCourseLearningMaterials(course){
    const courseLearningMaterials = await course.get('learningMaterials');
    return all(courseLearningMaterials.mapBy('learningMaterial'));
  },
  async loadSessionLearningMaterials(course){
    const sessions = await course.get('sessions');
    return all([sessions.mapBy('learningMaterials'), sessions.mapBy('firstOfferingDate')]);
  }
});
