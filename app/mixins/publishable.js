import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
const { not, or } = computed;

export default Mixin.create({
  publishTarget: null,
  currentUser: service(),
  flashMessages: service(),
  store: service(),
  i18n: service(),
  showCheckLink: true,
  menuTitle: computed('i18n.locale', 'publishTarget.isPublished', 'publishTarget.publishedAsTbd', function(){
    const publishTarget = this.get('publishTarget');
    const i18n = this.get('i18n');
    if(publishTarget.get('publishedAsTbd')){
      return i18n.t('general.scheduled');
    }
    if(publishTarget.get('isPublished')){
      return i18n.t('general.published');
    }
    return i18n.t('general.notPublished');
  }),
  menuIcon: computed('publishTarget.isPublished', 'publishTarget.publishedAsTbd', function(){
    if(this.get('publishTarget.publishedAsTbd')){
      return 'clock';
    }
    if(this.get('publishTarget.isPublished')){
      return 'star';
    }
    return 'cloud';
  }),
  showTbd: not('publishTarget.isScheduled'),
  showAsIs: computed(
    'publishTarget.isPublished',
    'publishTarget.isScheduled',
    'publishTarget.requiredPublicationIssues.length',
    'publishTarget.allPublicationIssuesLength',
    function(){
      return (
        (!this.get('publishTarget.isPublished') || this.get('publishTarget.isScheduled')) &&
        this.get('publishTarget.requiredPublicationIssues.length') === 0 &&
        this.get('publishTarget.allPublicationIssuesLength') !== 0
      );
    }
  ),
  showReview: computed('publishTarget.allPublicationIssuesLength', 'showCheckLink', function(){
    return this.get('publishTarget.allPublicationIssuesLength') > 0 && this.get('showCheckLink');
  }),
  showPublish: computed(
    'publishTarget.isPublished',
    'publishTarget.allPublicationIssuesLength',
    function(){
      return (
        (!this.get('publishTarget.isPublished') || this.get('publishTarget.isScheduled')) &&
        this.get('publishTarget.allPublicationIssuesLength') === 0
      );
    }
  ),
  showUnPublish: or('publishTarget.isPublished', 'publishTarget.isScheduled'),
  publicationStatus: computed('publishTarget.isPublished', 'publishTarget.isScheduled', function(){
    if(this.get('publishTarget.isScheduled')){
      return 'scheduled';
    } else if (this.get('publishTarget.isPublished')){
      return 'published';
    }

    return 'notpublished';
  }),
  actions: {
    unpublish() {
      let publishTarget = this.get('publishTarget');
      publishTarget.set('publishedAsTbd', false);
      publishTarget.set('published', false);
      publishTarget.save().then(()=>{
        this.get('flashMessages').success('general.unPublishedSuccessfully');
      });
    },
    publishAsTbd() {
      let publishTarget = this.get('publishTarget');
      publishTarget.set('publishedAsTbd', true);
      publishTarget.set('published', true);
      publishTarget.save().then(()=>{
        this.get('flashMessages').success('general.scheduledSuccessfully');
      });
    },
    publish() {
      let publishTarget = this.get('publishTarget');
      publishTarget.set('publishedAsTbd', false);
      publishTarget.set('published', true);
      publishTarget.save().then(()=>{
        this.get('flashMessages').success('general.publishedSuccessfully');
      });
    },
  }
});
