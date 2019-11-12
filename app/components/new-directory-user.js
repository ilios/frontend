import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';
import { task } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import NewUser from 'ilios/mixins/newuser';

const Validations = buildValidations({
  username: [
    validator('presence', {
      presence: true,
      dependentKeys: ['model.allowCustomUserName'],
      disabled: computed('model.allowCustomUserName', function(){
        return this.get('model.allowCustomUserName').then(allowCustomUserName => {
          return allowCustomUserName;
        });
      })
    }),
    validator('length', {
      max: 100
    })
  ],
  password: [
    validator('presence', {
      presence: true,
      dependentKeys: ['model.allowCustomUserName'],
      disabled: computed('model.allowCustomUserName', function(){
        return this.get('model.allowCustomUserName').then(allowCustomUserName => {
          return allowCustomUserName;
        });
      })
    })
  ],
  otherId: [
    validator('length', {
      max: 16
    })
  ]
});

export default Component.extend(NewUser, Validations, {
  fetch: service(),
  iliosConfig: service(),
  intl: service(),

  classNames: ['new-directory-user'],

  isSearching: false,
  searchResults: null,
  searchResultsReturned: false,
  searchTerms: null,
  selectedUser: false,
  tooManyResults: false,

  allowCustomUserName: computed('iliosConfig.authenticationType', async function() {
    const type = await this.iliosConfig.authenticationType;
    return type === 'form';
  }),

  init() {
    this._super(...arguments);
    this.set('searchResults', []);
    const searchTerms = this.searchTerms;
    if (isPresent(searchTerms)) {
      this.findUsersInDirectory.perform(searchTerms);
    }
  },

  actions: {
    pickUser(user) {
      this.set('selectedUser', true);
      this.set('firstName', user.firstName);
      this.set('lastName', user.lastName);
      this.set('email', user.email);
      this.set('campusId', user.campusId);
      this.set('phone', user.telephoneNumber);
      this.set('username', user.username);
    },

    unPickUser() {
      this.set('selectedUser', false);
      this.set('firstName', null);
      this.set('lastName', null);
      this.set('email', null);
      this.set('campusId', null);
      this.set('phone', null);
      this.set('username', null);
    }
  },

  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' === target.type) {
      if (13 === keyCode) {
        this.save.perform();
        return;
      }

      if(27 === keyCode) {
        this.close();
      }
      return;
    }

    if ('search' === target.type) {
      if (13 === keyCode) {
        this.findUsersInDirectory.perform(this.searchTerms);
        return;
      }

      if (27 === keyCode) {
        this.set('searchTerms', '');
      }
    }
  },

  findUsersInDirectory: task(function* (searchTerms) {
    this.set('searchResultsReturned', false);
    this.set('tooManyResults', false);
    if (!isEmpty(searchTerms)) {
      this.set('isSearching', true);
      let url = '/application/directory/search?limit=51&searchTerms=' + searchTerms;
      let data = yield this.fetch.getJsonFromApiHost(url);
      let mappedResults = data.results.map(result => {
        result.addable = isPresent(result.firstName) && isPresent(result.lastName) && isPresent(result.email) && isPresent(result.campusId);
        return result;
      });
      this.set('tooManyResults', mappedResults.length > 50);
      this.set('searchResults', mappedResults);
      this.set('isSearching', false);
      this.set('searchResultsReturned', true);
    }
  }).restartable(),
});
