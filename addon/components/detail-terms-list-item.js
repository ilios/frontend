import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class DetailTermsListItem extends Component {
  @tracked isHovering;
  @tracked theElement;

  @use allParentTitles = new AsyncProcess(() => [
    this.args.term.getAllParentTitles.bind(this.args.term),
  ]);

  @use parent = new ResolveAsyncValue(() => [this.args.term.parent]);

  get showTooltip() {
    return this.args?.term.description?.length && this.theElement && this.isHovering;
  }

  get isTopLevel() {
    if (undefined === this.parent) {
      return false;
    }
    return !this.parent;
  }
}
