import Component from '@glimmer/component';
import or from 'ember-truth-helpers/helpers/or';
import FaIcon from 'frontend/components/fa-icon';

export default class FaIconStackComponent extends Component {
  get titleId() {
    if (!this.args.title) {
      return null;
    }

    return `inline-title-${this.uniqueId}`;
  }
  <template>
    <span class="fa-layers fa-fw awesome-icon-stack" data-test-awesome-icon-stack ...attributes>
      {{#each @icons as |icon|}}
        <FaIcon
          @icon={{icon}}
          @extraClasses={{@extraClasses}}
          @fixedWidth={{@fixedWidth}}
          @focusable={{@focusable}}
          @flip={{@flip}}
          @listItem={{@listItem}}
          @spin={{@spin}}
          @title={{or @title null}}
          height={{@height}}
          width={{@width}}
          role={{or @role "img"}}
          x={{@x}}
          y={{@y}}
        />
      {{/each}}
    </span>
  </template>
}
