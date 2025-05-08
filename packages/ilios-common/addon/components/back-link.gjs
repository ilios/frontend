import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class BackLinkComponent extends Component {
  @service intl;
  back(event) {
    event.preventDefault();
    window.history.back();
  }
}

<a
  title={{t "general.returnToPreviousPage"}}
  class="back-link"
  href="#"
  {{on "click" this.back}}
  data-test-back-link
>
  <FaIcon @icon="angles-left" />
  {{t "general.back"}}
</a>