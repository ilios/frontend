import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { setupAuthentication } from 'ilios-common';
import { component } from 'frontend/tests/pages/components/reports/subject-header';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import SubjectHeader from 'frontend/components/reports/subject-header';

module('Integration | Component | reports/subject-header', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    //override default handler to just return all courses
    this.server.get('api/courses', (schema) => {
      return schema.courses.all();
    });
  });

  test('it renders with default title', async function (assert) {
    const report = this.server.create('report', {
      subject: 'course',
      prepositionalObject: 'instructor',
      prepositionalObjectTableRowId: this.user.id,
      user: this.user,
    });
    const reportModel = await this.owner.lookup('service:store').findRecord('report', report.id);
    this.set('report', reportModel);
    await render(
      <template>
        <SubjectHeader
          @report={{this.report}}
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @year=""
          @school={{null}}
        />
      </template>,
    );
    assert.strictEqual(
      component.title.text,
      'All Courses for Instructor 0 guy M. Mc0son in All Schools',
    );
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('edit report title, then save', async function (assert) {
    this.server.create('academic-year', {
      id: 2015,
    });
    this.server.create('academic-year', {
      id: 2016,
    });
    const school = this.server.create('school');
    this.server.create('course', {
      school,
      year: 2015,
    });
    this.server.create('course', {
      school,
      year: 2016,
    });
    const report = this.server.create('report', {
      title: 'my report 0',
      subject: 'course',
      prepositionalObject: 'instructor',
      prepositionalObjectTableRowId: this.user.id,
      user: this.user,
      school,
    });
    const reportModel = await this.owner.lookup('service:store').findRecord('report', report.id);
    this.set('report', reportModel);
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    await render(
      <template>
        <SubjectHeader
          @report={{this.report}}
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @year={{this.selectedYear}}
          @school={{this.school}}
        />
      </template>,
    );
    assert.strictEqual(component.title.text, 'my report 0');
    await component.title.edit();
    assert.strictEqual(component.title.value, 'my report 0');
    await component.title.set('lorem ipsum');
    await component.title.save();
    assert.strictEqual(component.title.text, 'lorem ipsum');
  });

  test('edit report title, then cancel', async function (assert) {
    const school = this.server.create('school');
    this.server.create('course', {
      school,
      year: 2015,
    });
    const report = this.server.create('report', {
      title: 'my report 0',
      subject: 'course',
      prepositionalObject: 'instructor',
      prepositionalObjectTableRowId: this.user.id,
      user: this.user,
      school,
    });
    const reportModel = await this.owner.lookup('service:store').findRecord('report', report.id);
    this.set('report', reportModel);
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    await render(
      <template>
        <SubjectHeader
          @report={{this.report}}
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @year=""
          @school={{this.school}}
        />
      </template>,
    );
    assert.strictEqual(component.title.text, 'my report 0');
    await component.title.edit();
    assert.strictEqual(component.title.value, 'my report 0');
    await component.title.set('lorem ipsum');
    await component.title.cancel();
    assert.strictEqual(component.title.text, 'my report 0');
  });

  test('edit and remove report title, then save', async function (assert) {
    this.server.create('academic-year', {
      id: 2016,
    });
    const school = this.server.create('school');
    this.server.create('course', {
      school,
      year: 2016,
    });
    const report = this.server.create('report', {
      title: 'my report 0',
      subject: 'course',
      prepositionalObject: 'instructor',
      prepositionalObjectTableRowId: this.user.id,
      user: this.user,
      school,
    });
    const reportModel = await this.owner.lookup('service:store').findRecord('report', report.id);
    this.set('report', reportModel);
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    await render(
      <template>
        <SubjectHeader
          @report={{this.report}}
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @year=""
          @school={{this.school}}
        />
      </template>,
    );
    assert.strictEqual(component.title.text, 'my report 0');
    await component.title.edit();
    assert.strictEqual(component.title.value, 'my report 0');
    await component.title.set('');
    await component.title.save();
    assert.strictEqual(
      component.title.text,
      'All Courses for Instructor 0 guy M. Mc0son in school 0',
    );
  });

  test('year filter is hidden when not needed', async function (assert) {
    const report = this.server.create('report', {
      subject: 'course',
      prepositionalObject: 'instructor',
      prepositionalObjectTableRowId: this.user.id,
      user: this.user,
    });
    const reportModel = await this.owner.lookup('service:store').findRecord('report', report.id);
    this.set('report', reportModel);
    await render(
      <template>
        <SubjectHeader
          @report={{this.report}}
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @year=""
          @showYearFilter={{false}}
          @school={{null}}
        />
      </template>,
    );
    assert.notOk(component.hasYearFilter);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('year filter is shown', async function (assert) {
    const report = this.server.create('report', {
      subject: 'course',
      prepositionalObject: 'instructor',
      prepositionalObjectTableRowId: this.user.id,
      user: this.user,
    });
    const reportModel = await this.owner.lookup('service:store').findRecord('report', report.id);
    this.set('report', reportModel);
    await render(
      <template>
        <SubjectHeader
          @report={{this.report}}
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @year=""
          @showYearFilter={{true}}
          @school={{null}}
        />
      </template>,
    );
    assert.ok(component.hasYearFilter);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('title too long', async function (assert) {
    const report = this.server.create('report', {
      subject: 'course',
      prepositionalObject: 'instructor',
      prepositionalObjectTableRowId: this.user.id,
      user: this.user,
    });
    const reportModel = await this.owner.lookup('service:store').findRecord('report', report.id);
    this.set('report', reportModel);
    await render(
      <template>
        <SubjectHeader
          @report={{this.report}}
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @year=""
          @school={{null}}
        />
      </template>,
    );
    assert.notOk(component.title.hasError);
    await component.title.edit();
    await component.title.set('a'.repeat(241));
    await component.title.save();
    assert.strictEqual(component.title.error, 'Title is too long (maximum is 240 characters)');
  });
});
