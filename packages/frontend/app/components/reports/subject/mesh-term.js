import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';
import { action } from '@ember/object';

export default class ReportsSubjectMeshTermComponent extends Component {
  @service graphql;
  @service intl;

  @cached
  get data() {
    return new TrackedAsyncData(
      this.getReportResults(
        this.args.subject,
        this.args.prepositionalObject,
        this.args.prepositionalObjectTableRowId,
        this.args.school,
      ),
    );
  }

  get sortedData() {
    return this.data.value.sort((a, b) => {
      return a.localeCompare(b, this.intl.primaryLocale);
    });
  }

  async getReportResults(subject, prepositionalObject, prepositionalObjectTableRowId, school) {
    if (subject !== 'mesh term') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectMeshTermComponent`);
    }

    let filters = [];
    if (school) {
      filters.push(`schools: [${school.id}]`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      if (prepositionalObject === 'course') {
        const ids = await this.getMeshIdsForCourse(prepositionalObjectTableRowId);
        filters.push(`ids: [${ids.join(', ')}]`);
      } else {
        const what = pluralize(camelize(prepositionalObject));
        filters.push(`${what}: [${prepositionalObjectTableRowId}]`);
      }
    }
    const result = await this.graphql.find('meshDescriptors', filters, 'id, name');
    return result.data.meshDescriptors.map(({ name }) => name);
  }

  async getMeshIdsForCourse(courseId) {
    const attributes = [
      'meshDescriptors { id }',
      'learningMaterials { meshDescriptors { id } }',
      'courseObjectives { meshDescriptors { id } }',
      'sessions { meshDescriptors { id }, sessionObjectives { meshDescriptors { id } }, learningMaterials { meshDescriptors { id } }}',
    ];
    const results = await this.graphql.find('courses', [`id: ${courseId}`], attributes.join(', '));
    const course = results.data.courses[0];
    const sessionMeshDescriptors = course.sessions.reduce((acc, session) => {
      return [
        ...acc,
        ...session.meshDescriptors.map(({ id }) => id),
        ...session.sessionObjectives
          .map(({ meshDescriptors }) => meshDescriptors.map(({ id }) => id))
          .flat(),
        ...session.learningMaterials
          .map(({ meshDescriptors }) => meshDescriptors.map(({ id }) => id))
          .flat(),
      ];
    }, []);
    const ids = [
      ...course.meshDescriptors.map(({ id }) => id),
      ...course.courseObjectives
        .map(({ meshDescriptors }) => meshDescriptors.map(({ id }) => id))
        .flat(),
      ...course.learningMaterials
        .map(({ meshDescriptors }) => meshDescriptors.map(({ id }) => id))
        .flat(),
      ...sessionMeshDescriptors,
    ];
    return [...new Set(ids)].sort().map((id) => `"${id}"`);
  }

  @action
  async fetchDownloadData() {
    return [[this.intl.t('general.meshTerms')], ...this.sortedData.map((v) => [v])];
  }
}
