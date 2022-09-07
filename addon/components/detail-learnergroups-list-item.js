import Component from '@glimmer/component';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class DetailLearnergroupsListItemComponent extends Component {
  @use allParentTitles = new AsyncProcess(() => [
    this.args.group.getAllParentTitles.bind(this.args.group),
  ]);

  @use parent = new ResolveAsyncValue(() => [this.args.group.parent]);

  get isTopLevel() {
    if (undefined === this.parent) {
      return false;
    }
    return !this.parent;
  }
}
