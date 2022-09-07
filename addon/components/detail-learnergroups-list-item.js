import Component from '@glimmer/component';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';

export default class DetailLearnergroupsListItemComponent extends Component {
  @use allParentTitles = new AsyncProcess(() => [
    this.args.group.getAllParentTitles.bind(this.args.group),
  ]);
}
