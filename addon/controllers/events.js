import Controller from '@ember/controller';
import { getOwner } from '@ember/application';

export default class EventsController extends Controller {
  get showBackLink() {
    const config = getOwner(this).resolveRegistration('config:environment');
    return config.modulePrefix !== 'ilios';
  }
}
