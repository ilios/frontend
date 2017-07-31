import Route from '@ember/routing/route';
export default Route.extend({
  /**
   * Preload the school configurations
   * to avoid a popin later
   */
  async afterModel(session){
    const course = await session.get('course');
    const school = await course.get('school');
    await school.get('configurations');
  }
});
