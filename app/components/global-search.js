import Ember from 'ember';

const {inject, run, computed} = Ember;
const {service} = inject;
const {debounce} = run;
const {or, notEmpty} = computed;

export default Ember.Component.extend({
  store: service(),
  i18n: service(),
  classNames: ['global-search'],
  results: [],
  searching: false,
  showMoreInputPrompt: false,
  showNoResultsMessage: false,
  currentlySearchingForTerm: false,
  hasResults: notEmpty('results'),
  showList: or('searching', 'showMoreInputPrompt', 'showNoResultsMessage', 'hasResults'),
  actions: {
    clear() {
      let input = this.$('input')[0];
      input.value = '';
      this.setProperties({
        searchTerms: '',
        showMoreInputPrompt: false,
        showNoResultsMessage: false,
        searching: false,
        results: [],
        showClearButton: false,
      });
    },
    inputValueChanged(){
      let input = this.$('input')[0];
      let searchTerms = input.value;
      if(this.get('currentlySearchingForTerm') === searchTerms){
        return;
      }
      this.setProperties({
        currentlySearchingForTerm: searchTerms,
        showMoreInputPrompt: false,
        showNoResultsMessage: false,
        searching: false,
      });
      let noWhiteSpaceTerm = searchTerms.replace(/ /g,'');
      if(noWhiteSpaceTerm.length === 0){
        this.send('clear');
        return;
      } else if(noWhiteSpaceTerm.length < 3){
        this.setProperties({
          results: [],
          showMoreInputPrompt: true,
        });
        return;
      }
      this.set('searching', true);
      debounce(this, function(){
        this.send('search', searchTerms);
      }, 1000);
    },
    search(searchTerms){
      this.set('searching', true);
      let searchResultProxy = Ember.ObjectProxy.extend({
        isUser: false,
        sortString: '',
      });
      this.get('store').query('user', {q: searchTerms}).then(users => {
        let results = users.map(user => {
          return searchResultProxy.create({
            content: user,
            isUser: true,
            sortString: user.get('lastName')+user.get('firstName'),
          });
        });
        this.set('searching', false);
        if(results.get('length') === 0){
          this.set('showNoResultsMessage', true);
        }
        this.set('results', results.sortBy('sortString'));
      });
    },
  }
});
