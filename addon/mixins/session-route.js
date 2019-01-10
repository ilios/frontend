import Mixin from '@ember/object/mixin';

export default Mixin.create({
  async model(params) {
    const store = this.get('store');
    return await store.find('session', params.session_id);
  },

  async afterModel(model) {
    const store = this.get('store');
    const course = await model.get('course');
    await store.query('session', { filters: { course: course.get('id') } });
  }
});
