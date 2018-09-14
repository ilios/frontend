/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import RSVP from 'rsvp';
import { computed } from '@ember/object';
import layout from '../templates/components/objective-manage-competency';

const { Promise, all, filter} = RSVP;

export default Component.extend({
  layout,
  objective: null,
  classNames: ['objective-manager', 'objective-manage-competency'],

  schoolCompetencies: computed('programYear.program.school.competencies.[]', function(){
    return new Promise(resolve => {
      this.get('programYear').then(programYear => {
        programYear.get('program').then(program => {
          program.get('school').then(school => {
            school.get('competencies').then(competencies => {
              resolve(competencies);
            });
          });
        });
      });
    });
  }),

  programYear: computed('objective.programYears.[]', function(){
    return new Promise(resolve => {
      const objective = this.get('objective');
      objective.get('programYears').then(programYears => {
        if (programYears.length) {
          let programYear = programYears.get('firstObject');
          resolve(programYear);
        } else {
          resolve(null);
        }
      });
    });
  }),

  competencies: computed('programYear.competencies.[]', function(){
    return new Promise(resolve => {
      this.get('programYear').then(programYear => {
        programYear.get('competencies').then(competencies => {
          resolve(competencies);
        });
      });
    });
  }),

  competenciesWithSelectedChildren: computed('schoolCompetencies.[]', 'objective.competency', function(){
    return new Promise(resolve => {
      const objective = this.get('objective');
      objective.get('competency').then(selectedCompetency => {
        if (selectedCompetency) {
          this.get('schoolCompetencies').then(competencies => {
            filter(competencies.toArray(), (competency => {
              return new Promise(resolve => {
                competency.get('treeChildren').then(children => {
                  const selectedCompetencyId = selectedCompetency.get('id');
                  const selectedChildren = children.filterBy('id', selectedCompetencyId);
                  resolve(selectedChildren.length > 0);
                });
              });
            })).then(competenciesWithSelectedChildren => {
              resolve(competenciesWithSelectedChildren);
            });
          });
        } else {
          resolve([]);
        }
      });
    });
  }),

  domains: computed('competencies.[]', function(){
    return new Promise(resolve => {
      this.get('competencies').then(competencies => {
        all(competencies.mapBy('domain')).then(domains => {
          resolve(domains.uniq());
        });
      });
    });
  }),

  domainsWithNoChildren: computed('domains.[]', function(){
    return new Promise(resolve => {
      this.get('competencies').then(competencies => {
        this.get('domains').then(domains => {
          filter(domains.toArray(), (domain => {
            return new Promise(resolve => {
              domain.get('children').then(children => {
                let availableChildren = children.filter(child => competencies.includes(child));
                resolve(availableChildren.length === 0);
              });
            });
          })).then(domainsWithNoChildren => {
            resolve(domainsWithNoChildren);
          });
        });
      });
    });
  }),
  actions: {
    changeCompetency(competency) {
      this.get('objective').set('competency', competency);
    },
    removeCurrentCompetency() {
      this.get('objective').set('competency', null);
    }
  }
});
