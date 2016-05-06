import Ember from 'ember';

const { computed, inject, ObjectProxy, Component } = Ember;
const { service } = inject;
const { sort, collect, alias, not } = computed;

const ReportProxy = ObjectProxy.extend({
  content: null,
  currentUser: null,
  showRemoveConfirmation: false,
  i18n: null,
  isPublished: alias('isFinalized'),
  isSchedules: false,
  isNotPublished: not('isPublished'),
});

export default Component.extend({
  currentUser: service(),
  i18n: service(),
  courses: [],
  proxiedReports: computed('reports.[]', function(){
    const i18n = this.get('i18n');
    return this.get('reports').map(report => {
      return ReportProxy.create({
        content: report,
        i18n,
        currentUser: this.get('currentUser')
      });
    });
  }),

  sortBy: 'title',
  sortReportBy: collect('sortBy'),
  sortedReports: sort('proxiedReports', 'sortReportBy'),
  sortedAscending: computed('sortBy', function(){
    const sortBy = this.get('sortBy');
    return sortBy.search(/desc/) === -1;
  }),
  actions: {
    edit: function(proxy){
      this.sendAction('edit', proxy.get('content'));
    },
    remove: function(proxy){
      this.sendAction('remove', proxy.get('content'));
    },
    cancelRemove: function(proxy){
      proxy.set('showRemoveConfirmation', false);
    },
    confirmRemove: function(proxy){
      proxy.set('showRemoveConfirmation', true);
    },
    sortBy(what){
      const sortBy = this.get('sortBy');
      if(sortBy === what){
        what += ':desc';
      }
      this.get('setSortBy')(what);
    },
  }
});
