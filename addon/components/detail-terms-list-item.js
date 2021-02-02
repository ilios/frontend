import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class DetailTermsListItem extends Component {
  @tracked isHovering;
  @tracked theElement;

  get showTooltip() {
    return this.args?.term.description?.length && this.theElement && this.isHovering;
  }
}
