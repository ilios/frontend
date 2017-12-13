import Ember from 'ember';

const { Mixin } = Ember;

export default Mixin.create({
  currentUser: Ember.inject.service(),
  store: Ember.inject.service(),
  async model() {
    const store = this.get('store');
    const currentUser = this.get('currentUser');
    const user = await currentUser.get('model');
    const schools = await user.get('schools');
    const academicYears = await store.findAll('academic-year');

    return { schools, academicYears };
  },
});
