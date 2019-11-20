import Component from '@ember/component';
import { computed } from '@ember/object';
import { isPresent } from '@ember/utils';
import SortableTable from 'ilios-common/mixins/sortable-table';
import { task, timeout } from 'ember-concurrency';

const DEBOUNCE_DELAY = 250;

export default Component.extend(SortableTable, {
  classNames: ['my-materials'],

  courseIdFilter: null,
  filter: null,
  materials: null,
  sortBy: null,
  setCourseIdFilter() {},
  setFilter() {},
  setSortBy() {},

  filteredMaterials: computed('courseIdFilter', 'filter', 'materials.[]', async function() {
    const courseIdFilter = this.courseIdFilter;
    const filter = this.filter;
    let materials = await this.materials;

    if (isPresent(courseIdFilter)) {
      materials = materials.filterBy('course', courseIdFilter);
    }

    if (isPresent(filter)) {
      materials = materials.filter(({ courseTitle, instructors, sessionTitle, title }) => {
        let searchString = `${title} ${courseTitle} ${sessionTitle} `;

        if (isPresent(instructors)) {
          searchString += instructors.join(' ');
        }

        return searchString.toLowerCase().includes(filter.toLowerCase());
      });
    }

    return materials;
  }),

  courses: computed('materials.[]', async function() {
    const materials = await this.materials;
    return materials.map((material) => {
      return { id: material.course, title: material.courseTitle };
    }).uniqBy('id').sortBy('title');
  }),

  actions: {
    sortString(a, b){
      return a.localeCompare(b);
    }
  },

  setQuery: task(function* (query) {
    yield timeout(DEBOUNCE_DELAY);
    this.setFilter(query);
  }).restartable()
});
