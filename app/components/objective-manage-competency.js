import Ember from 'ember';

const { Component, RSVP, computed } = Ember;
const { Promise, all, filter} = RSVP;

export default Component.extend({
  objective: null,
  classNames: ['objective-manager', 'objective-manage-competency'],

  competencies: computed('objective.programYear.program.school.competencies.[]', function(){
    return new Promise(resolve => {
      const objective = this.get('objective');
      objective.get('programYears').then(programYears => {
        if (programYears.length) {
          let programYear = programYears.get('firstObject');
          programYear.get('program').then(program => {
            program.get('school').then(school => {
              school.get('competencies').then(competencies => {
                resolve(competencies);
              });
            });
          });
        }
      });
    });
  }),

  competenciesWithSelectedChildren: computed('competencies.[]', 'objective.competency', function(){
    return new Promise(resolve => {
      const objective = this.get('objective');
      objective.get('competency').then(selectedCompetency => {
        if (selectedCompetency) {
          this.get('competencies').then(competencies => {
            filter(competencies.toArray(), (competency => {
              return new Promise(resolve => {
                competency.get('treeChildren').then(children => {
                  let selectedChildren = children.filter(competency => selectedCompetency.get('id') === competency.get('id'));
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
      this.get('domains').then(domains => {
        filter(domains.toArray(), (competency => {
          return new Promise(resolve => {
            competency.get('children').then(children => {
              resolve(children.length === 0);
            });
          });
        })).then(domainsWithNoChildren => {
          resolve(domainsWithNoChildren);
        });
      });
    });
  }),
  actions: {
    changeCompetency: function(competency){
      this.get('objective').set('competency', competency);
    },
    removeCurrentCompetency: function(){
      this.get('objective').set('competency', null);
    }
  }
});
