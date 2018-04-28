import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  store: service(),
  async model() {
    const store = this.get('store');
    const schools = await store.findAll('school');
    const academicYears = await store.findAll('academic-year');

    return { schools, academicYears };
  },
});
