import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import FaIcon from 'ilios-common/components/fa-icon';

export default class BackLinkComponent extends Component {
  @service intl;
  back(event) {
    event.preventDefault();
    window.history.back();
  }
  <template>
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
  </template>
}
