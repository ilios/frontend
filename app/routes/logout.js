import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  session: service(),
  titleToken: 'general.logout',
  beforeModel(){
    const session = this.session;
    if(session.isAuthenticated){
      return session.invalidate();
    }
  }
});
