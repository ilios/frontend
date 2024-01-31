import Component from '@glimmer/component';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';

export default class CurriculumInventorySequenceBlockDetailsComponent extends Component {
  @use allParents = new AsyncProcess(() => [
    this.args.sequenceBlock.getAllParents.bind(this.args.sequenceBlock),
  ]);
}
