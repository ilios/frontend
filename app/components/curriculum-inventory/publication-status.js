import Component from '@glimmer/component';

export default class CuriculumInventoryPublicationStatusComponent extends Component {
  get textKey(){
    if (this.args.item.isScheduled) {
      return 'general.scheduled';
    }
    if (this.args.item.isPublished) {
      return 'general.finalized';
    }

    return 'general.draft';
  }

  get publicationStatus() {
    if(this.args.item.isScheduled){
      return 'scheduled';
    } else if (this.args.item.isPublished){
      return 'published';
    }

    return 'notpublished';
  }
}
