import Ember from 'ember';
import SortableTable from 'ilios/mixins/sortable-table';
import escapeRegExp from '../utils/escape-reg-exp';

const { Component, computed, isPresent } = Ember;

export default Component.extend(SortableTable, {
  classNames: ['my-materials'],
  filter: null,
  courseIdFilter: null,
  filteredMaterials: computed('materials.[]', 'filter', 'courseIdFilter', function(){
    let materials = this.get('materials');
    const filter = this.get('filter');
    const courseIdFilter = this.get('courseIdFilter');
    if (isPresent(courseIdFilter)) {
      materials = materials.filterBy('course', courseIdFilter);
    }
    if (isPresent(filter)) {
      let val = escapeRegExp(filter);
      const exp = new RegExp(val, 'gi');

      materials = materials.filter(material => {
        let searchString = material.title + ' ' + material.courseTitle + ' ' + material.sessionTitle + ' ';
        if (isPresent(material.instructors)) {
          searchString += material.instructors.join(' ');
        }
        return searchString.match(exp);
      });
    }

    return materials;
  }),
  courses: computed('materials.[]', function(){
    const materials = this.get('materials');
    return materials.map(material => {
      return {
        id: material.course,
        title: material.courseTitle
      };
    }).uniqBy('id').sortBy('title');
  }),
  actions: {
    sortString(a, b){
      return a.localeCompare(b);
    }
  }
});
