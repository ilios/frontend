import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class FlashMessagesComponent extends Component {
  @service flashMessages;
}
