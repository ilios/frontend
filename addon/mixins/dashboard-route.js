import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  store: service(),
  currentUser: service(),
  async model() {
    const store = this.get('store');
    const schools = await store.findAll('school');
    const academicYears = await store.findAll('academic-year');

    return { schools, academicYears };
  },

  async afterModel() {
    const user = await this.currentUser.getModel();
    const school = await user.school;
    const p1 = this.store.query('session-type', {
      filters: {
        school: school.id,
      },
    });
    const p2 = this.store.query('vocabulary', {
      filters: {
        school: school.id,
      },
    });
    const p3 = this.store.query('term', {
      filters: {
        schools: [school.id],
      },
    });

    return Promise.all([p1, p2, p3]);
  }
});
