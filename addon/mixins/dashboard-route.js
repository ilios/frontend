import Ember from 'ember';

const { inject, Mixin } = Ember;
const { service } = inject;

export default Mixin.create({
  currentUser: service(),
  store: service(),
  async model() {
    const store = this.get('store');
    const currentUser = this.get('currentUser');
    const user = await currentUser.get('model');
    const schools = await user.get('schools');
    const academicYears = await store.findAll('academic-year');

    return { schools, academicYears };
  },
});
