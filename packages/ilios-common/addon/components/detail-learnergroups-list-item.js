import Component from '@glimmer/component';
import { action } from '@ember/object';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';

export default class DetailLearnergroupsListItemComponent extends Component {
  @use allParentTitles = new AsyncProcess(() => [
    this.args.group.getAllParentTitles.bind(this.args.group),
  ]);

  @action
  remove(learnerGroup, ev) {
    this.args.remove(learnerGroup, !(ev.ctrlKey || ev.shiftKey));
  }
}
