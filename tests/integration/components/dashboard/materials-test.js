import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/dashboard/materials';
import { a11yAudit } from 'ember-a11y-testing/test-support';

module('Integration | Component | dashboard/materials', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(function () {
    class CurrentUserMock extends Service {
      async getModel() {
        return {
          id: 11,
        };
      }
    }
    class IliosConfigMock extends Service {
      apiNameSpace = '/api';
    }
    this.owner.register('service:iliosConfig', IliosConfigMock);
    this.owner.register('service:current-user', CurrentUserMock);

    const today = moment();
    const tomorrow = moment().add(1, 'day');
    const nextWeek = moment().add(1, 'week');
    const courses = this.server.createList('course', 5);
    const lm1 = {
      title: 'title1',
      absoluteFileUri: 'http://myhost.com/url1',
      sessionTitle: 'session1title',
      course: courses[0].id,
      type: 'file',
      mimetype: 'application/pdf',
      courseTitle: courses[0].title,
      instructors: ['Instructor1name', 'Instructor2name'],
      firstOfferingDate: today.toDate(),
    };
    const lm2 = {
      title: 'title2',
      link: 'http://myhost.com/url2',
      sessionTitle: 'session2title',
      course: courses[1].id,
      type: 'link',
      courseTitle: courses[1].title,
      instructors: ['Instructor1name', 'Instructor2name'],
      firstOfferingDate: tomorrow.toDate(),
    };
    const lm3 = {
      title: 'title3',
      citation: 'citationtext',
      sessionTitle: 'session3title',
      type: 'citation',
      course: courses[2].id,
      courseTitle: courses[2].title,
      firstOfferingDate: today.toDate(),
    };
    const lm4 = {
      title: 'title4',
      absoluteFileUri: 'http://myhost.com/document.txt',
      sessionTitle: 'session4title',
      course: courses[0].id,
      type: 'file',
      mimetype: 'text/plain',
      courseTitle: courses[0].title,
      instructors: ['Instructor3name', 'Instructor4name'],
      firstOfferingDate: tomorrow.toDate(),
    };
    const lm5 = {
      title: 'title5',
      isBlanked: true,
      course: courses[4].id,
      sessionTitle: 'session5title',
      courseTitle: courses[4].title,
      firstOfferingDate: tomorrow.toDate(),
      endDate: new Date('2013-03-01T01:10:00'),
    };

    const currentMaterials = [lm1, lm2, lm3, lm4, lm5];
    const notCurrentMaterials = [];
    for (let i = currentMaterials.length + 1, n = i + 200; i < n; i++) {
      notCurrentMaterials.push({
        title: `title ${i}`,
        citation: `citationtext ${i}`,
        sessionTitle: `session title`,
        type: 'citation',
        course: courses[3].id,
        courseTitle: courses[3].title,
        firstOfferingDate: nextWeek.toDate(),
      });
    }

    this.today = today;
    this.tomorrow = tomorrow;
    this.nextWeek = nextWeek;
    this.currentMaterials = currentMaterials;
    this.allMaterials = [...currentMaterials, ...notCurrentMaterials];
    this.courses = courses;
  });

  test('it renders with materials in show-current mode', async function (assert) {
    assert.expect(72);
    this.server.get(`/api/usermaterials/:id`, (scheme, { params, queryParams }) => {
      assert.ok('id' in params);
      assert.strictEqual(parseInt(params.id, 10), 11);
      assert.ok('before' in queryParams);
      assert.ok('after' in queryParams);
      const before = moment(queryParams.before, 'X');
      const after = moment(queryParams.after, 'X');
      assert.ok(before.isSame(this.today.clone().add(60, 'days'), 'day'));
      assert.ok(after.isSame(this.today, 'day'));
      return {
        userMaterials: this.currentMaterials,
      };
    });

    await render(hbs`<Dashboard::Materials
        @courseIdFilter={{null}}
        @filter=''
        @sortBy='title'
        @offset={{0}}
        @setOffset={{(noop)}}
        @limit={{25}}
        @setLimit={{(noop)}}
        @setCourseIdFilter={{(noop)}}
        @setFilter={{(noop)}}
        @setSortBy={{(noop)}}
        @toggleMaterialsMode={{(noop)}}
        @showAllMaterials={{false}}
    />`);
    assert.ok(component.dashboardViewPicker.isVisible);
    assert.ok(component.header.displayToggle.firstButton.isChecked);
    assert.strictEqual(component.courseFilter.options.length, 5);
    assert.strictEqual(component.courseFilter.options[0].text, 'All Courses');
    assert.strictEqual(component.courseFilter.options[1].text, 'course 0');
    assert.strictEqual(component.courseFilter.options[2].text, 'course 1');
    assert.strictEqual(component.courseFilter.options[3].text, 'course 2');
    assert.strictEqual(component.courseFilter.options[4].text, 'course 4');
    assert.ok(component.courseFilter.options[0].isSelected);
    assert.notOk(component.courseFilter.options[1].isSelected);
    assert.notOk(component.courseFilter.options[2].isSelected);
    assert.notOk(component.courseFilter.options[3].isSelected);
    assert.notOk(component.courseFilter.options[4].isSelected);
    assert.strictEqual(component.textFilter.value, '');
    assert.strictEqual(component.topPaginator.controls.pagerDetails.text, 'Showing 1 - 5 of 5');
    assert.strictEqual(component.bottomPaginator.controls.pagerDetails.text, 'Showing 1 - 5 of 5');
    assert.strictEqual(component.table.headers.sessionTitle.text, 'Session');
    assert.notOk(component.table.headers.sessionTitle.isSortedOn);
    assert.strictEqual(component.table.headers.courseTitle.text, 'Course');
    assert.notOk(component.table.headers.courseTitle.isSortedOn);
    assert.strictEqual(component.table.headers.title.text, 'Title');
    assert.ok(component.table.headers.title.isSortedOn);
    assert.strictEqual(component.table.headers.instructor.text, 'Instructor');
    assert.strictEqual(component.table.headers.firstOfferingDate.text, 'Date');
    assert.notOk(component.table.headers.firstOfferingDate.isSortedOn);
    assert.notOk(component.table.noResults.isVisible);
    assert.strictEqual(component.table.rows.length, 5);
    assert.strictEqual(component.table.rows[0].sessionTitle, 'session1title');
    assert.strictEqual(component.table.rows[0].courseTitle, 'course 0');
    assert.strictEqual(component.table.rows[0].title, 'File title1 Download');
    assert.ok(component.table.rows[0].isPdf);
    assert.ok(component.table.rows[0].pdfDownloadLink.isVisible);
    assert.strictEqual(component.table.rows[0].pdfDownloadLink.url, 'http://myhost.com/url1');
    assert.ok(component.table.rows[0].pdfLink.isVisible);
    assert.strictEqual(component.table.rows[0].pdfLink.url, 'http://myhost.com/url1?inline');
    assert.strictEqual(component.table.rows[0].instructors, 'Instructor1name, Instructor2name');
    assert.strictEqual(component.table.rows[0].firstOfferingDate, this.today.format('M/D/YYYY'));
    assert.strictEqual(component.table.rows[1].sessionTitle, 'session2title');
    assert.strictEqual(component.table.rows[1].courseTitle, 'course 1');
    assert.strictEqual(component.table.rows[1].title, 'Web Link title2');
    assert.ok(component.table.rows[1].isLink);
    assert.ok(component.table.rows[1].link.isVisible);
    assert.strictEqual(component.table.rows[1].link.url, 'http://myhost.com/url2');
    assert.strictEqual(component.table.rows[1].instructors, 'Instructor1name, Instructor2name');
    assert.strictEqual(component.table.rows[1].firstOfferingDate, this.tomorrow.format('M/D/YYYY'));
    assert.strictEqual(component.table.rows[2].sessionTitle, 'session3title');
    assert.strictEqual(component.table.rows[2].courseTitle, 'course 2');
    assert.strictEqual(component.table.rows[2].title, 'Citation title3 citationtext');
    assert.ok(component.table.rows[2].isCitation);
    assert.strictEqual(component.table.rows[2].instructors, '');
    assert.strictEqual(component.table.rows[2].firstOfferingDate, this.today.format('M/D/YYYY'));
    assert.strictEqual(component.table.rows[3].sessionTitle, 'session4title');
    assert.strictEqual(component.table.rows[3].courseTitle, 'course 0');
    assert.strictEqual(component.table.rows[3].title, 'File title4');
    assert.ok(component.table.rows[3].isFile);
    assert.ok(component.table.rows[3].fileLink.isVisible);
    assert.strictEqual(component.table.rows[3].fileLink.url, 'http://myhost.com/document.txt');
    assert.strictEqual(component.table.rows[3].instructors, 'Instructor3name, Instructor4name');
    assert.strictEqual(component.table.rows[3].firstOfferingDate, this.tomorrow.format('M/D/YYYY'));
    assert.strictEqual(component.table.rows[4].sessionTitle, 'session5title');
    assert.strictEqual(component.table.rows[4].courseTitle, 'course 4');
    assert.strictEqual(
      component.table.rows[4].title,
      'Timed Release title5 (Available until 3/1/2013, 1:10 AM)'
    );
    assert.ok(component.table.rows[4].isTimed);
    assert.strictEqual(component.table.rows[4].instructors, '');
    assert.strictEqual(component.table.rows[4].firstOfferingDate, this.tomorrow.format('M/D/YYYY'));
    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders with materials in show-all mode', async function (assert) {
    assert.expect(16);
    this.server.get(`/api/usermaterials/:id`, (scheme, { params, queryParams }) => {
      assert.ok('id' in params);
      assert.strictEqual(parseInt(params.id, 10), 11);
      assert.notOk('before' in queryParams);
      assert.notOk('after' in queryParams);
      return {
        userMaterials: this.allMaterials,
      };
    });
    await render(hbs`<Dashboard::Materials
        @courseIdFilter={{null}}
        @filter=''
        @sortBy='title'
        @offset={{0}}
        @setOffset={{(noop)}}
        @limit={{25}}
        @setLimit={{(noop)}}
        @setCourseIdFilter={{(noop)}}
        @setFilter={{(noop)}}
        @setSortBy={{(noop)}}
        @toggleMaterialsMode={{(noop)}}
        @showAllMaterials={{true}}
    />`);

    assert.ok(component.dashboardViewPicker.isVisible);
    assert.ok(component.header.displayToggle.secondButton.isChecked);
    assert.strictEqual(component.courseFilter.options.length, 6);
    assert.strictEqual(component.courseFilter.options[0].text, 'All Courses');
    assert.strictEqual(component.courseFilter.options[1].text, 'course 0');
    assert.strictEqual(component.courseFilter.options[2].text, 'course 1');
    assert.strictEqual(component.courseFilter.options[3].text, 'course 2');
    assert.strictEqual(component.courseFilter.options[4].text, 'course 3');
    assert.strictEqual(component.courseFilter.options[5].text, 'course 4');
    assert.strictEqual(component.topPaginator.controls.pagerDetails.text, 'Showing 1 - 25 of 205');
    assert.strictEqual(
      component.bottomPaginator.controls.pagerDetails.text,
      'Showing 1 - 25 of 205'
    );
    assert.strictEqual(component.table.rows.length, 25);
  });

  test('it renders with no materials', async function (assert) {
    this.server.get(`/api/usermaterials/:id`, () => {
      return {
        userMaterials: [],
      };
    });
    await render(hbs`<Dashboard::Materials
        @courseIdFilter={{null}}
        @filter=''
        @sortBy='title'
        @offset={{0}}
        @setOffset={{(noop)}}
        @limit={{25}}
        @setLimit={{(noop)}}
        @setCourseIdFilter={{(noop)}}
        @setFilter={{(noop)}}
        @setSortBy={{(noop)}}
        @toggleMaterialsMode={{(noop)}}
        @showAllMaterials={{true}}
    />`);

    assert.strictEqual(component.courseFilter.options.length, 1);
    assert.strictEqual(component.courseFilter.options[0].text, 'All Courses');
    assert.strictEqual(component.topPaginator.controls.pagerDetails.text, 'Showing 1 - 0 of 0');
    assert.strictEqual(component.bottomPaginator.controls.pagerDetails.text, 'Showing 1 - 0 of 0');
    assert.strictEqual(component.table.rows.length, 0);
  });

  test('filter by course', async function (assert) {
    assert.expect(10);
    this.server.get(`/api/usermaterials/:id`, () => {
      return {
        userMaterials: this.currentMaterials,
      };
    });
    this.set('courseId', this.courses[0].id);
    this.set('setCourse', (id) => {
      assert.strictEqual(id, '2');
      this.set('courseId', id);
    });
    await render(hbs`<Dashboard::Materials
        @courseIdFilter={{this.courseId}}
        @filter=''
        @sortBy='title'
        @offset={{0}}
        @setOffset={{(noop)}}
        @limit={{25}}
        @setLimit={{(noop)}}
        @setCourseIdFilter={{this.setCourse}}
        @setFilter={{(noop)}}
        @setSortBy={{(noop)}}
        @toggleMaterialsMode={{(noop)}}
        @showAllMaterials={{false}}
    />`);

    assert.strictEqual(component.courseFilter.options.length, 5);
    assert.ok(component.courseFilter.options[1].isSelected);
    assert.strictEqual(component.topPaginator.controls.pagerDetails.text, 'Showing 1 - 2 of 2');
    assert.strictEqual(component.table.rows.length, 2);
    assert.strictEqual(component.table.rows[0].courseTitle, 'course 0');
    assert.strictEqual(component.table.rows[1].courseTitle, 'course 0');
    await component.courseFilter.set('2');
    assert.ok(component.courseFilter.options[2].isSelected);
    assert.strictEqual(component.topPaginator.controls.pagerDetails.text, 'Showing 1 - 1 of 1');
    assert.strictEqual(component.table.rows[0].courseTitle, 'course 1');
  });

  test('filter by text', async function (assert) {
    assert.expect(8);
    this.server.get(`/api/usermaterials/:id`, () => {
      return {
        userMaterials: this.currentMaterials,
      };
    });
    this.set('filter', 'title3');
    this.set('setFilter', (text) => {
      assert.strictEqual(text, 'course 0');
      this.set('filter', text);
    });
    await render(hbs`<Dashboard::Materials
        @courseIdFilter={{null}}
        @filter={{this.filter}}
        @sortBy='title'
        @offset={{0}}
        @setOffset={{(noop)}}
        @limit={{25}}
        @setLimit={{(noop)}}
        @setCourseIdFilter={{(noop)}}
        @setFilter={{this.setFilter}}
        @setSortBy={{(noop)}}
        @toggleMaterialsMode={{(noop)}}
        @showAllMaterials={{false}}
    />`);

    assert.strictEqual(component.textFilter.value, 'title3');
    assert.strictEqual(component.topPaginator.controls.pagerDetails.text, 'Showing 1 - 1 of 1');
    assert.strictEqual(component.table.rows.length, 1);
    assert.strictEqual(component.table.rows[0].title, 'Citation title3 citationtext');
    await component.textFilter.set('course 0');
    assert.strictEqual(component.topPaginator.controls.pagerDetails.text, 'Showing 1 - 2 of 2');
    assert.strictEqual(component.table.rows[0].courseTitle, 'course 0');
    assert.strictEqual(component.table.rows[1].courseTitle, 'course 0');
  });

  test('pagination', async function (assert) {
    assert.expect(3);
    this.server.get(`/api/usermaterials/:id`, () => {
      return {
        userMaterials: this.allMaterials,
      };
    });
    this.set('limit', 50);
    this.set('offset', 100);
    this.set('setOffset', (offset) => {
      assert.strictEqual(offset, 150);
    });
    await render(hbs`<Dashboard::Materials
        @courseIdFilter={{null}}
        @filter=''
        @sortBy='title'
        @offset={{this.limit}}
        @setOffset={{this.setOffset}}
        @limit={{this.offset}}
        @setLimit={{(noop)}}
        @setCourseIdFilter={{(noop)}}
        @setFilter={{(noop)}}
        @setSortBy={{(noop)}}
        @toggleMaterialsMode={{(noop)}}
        @showAllMaterials={{true}}
    />`);
    assert.strictEqual(
      component.topPaginator.controls.pagerDetails.text,
      'Showing 51 - 150 of 205'
    );
    assert.strictEqual(component.table.rows.length, 100);
    await component.topPaginator.controls.goForward();
  });

  test('sort by course title', async function (assert) {
    assert.expect(10);
    this.server.get(`/api/usermaterials/:id`, () => {
      return {
        userMaterials: this.allMaterials,
      };
    });
    this.set('sortBy', 'courseTitle');
    this.set('setSortBy', (sortBy) => {
      assert.strictEqual(sortBy, 'courseTitle:desc');
      this.set('sortBy', sortBy);
    });
    await render(hbs`<Dashboard::Materials
        @courseIdFilter={{null}}
        @filter=''
        @sortBy={{this.sortBy}}
        @offset={{0}}
        @setOffset={{(noop)}}
        @limit={{25}}
        @setLimit={{(noop)}}
        @setCourseIdFilter={{(noop)}}
        @setFilter={{(noop)}}
        @setSortBy={{this.setSortBy}}
        @toggleMaterialsMode={{(noop)}}
        @showAllMaterials={{true}}
    />`);
    assert.strictEqual(component.topPaginator.controls.pagerDetails.text, 'Showing 1 - 25 of 205');
    assert.notOk(component.table.headers.sessionTitle.isSortedOn);
    assert.ok(component.table.headers.courseTitle.isSortedOn);
    assert.ok(component.table.headers.courseTitle.isSortedAscending);
    assert.notOk(component.table.headers.title.isSortedOn);
    assert.notOk(component.table.headers.firstOfferingDate.isSortedOn);
    assert.strictEqual(component.table.rows[0].courseTitle, 'course 0');
    await component.table.headers.courseTitle.click();
    assert.ok(component.table.headers.courseTitle.isSortedDescending);
    assert.strictEqual(component.table.rows[0].courseTitle, 'course 4');
  });

  test('sort by session title', async function (assert) {
    assert.expect(10);
    this.server.get(`/api/usermaterials/:id`, () => {
      return {
        userMaterials: this.allMaterials,
      };
    });
    this.set('sortBy', 'sessionTitle');
    this.set('setSortBy', (sortBy) => {
      assert.strictEqual(sortBy, 'sessionTitle:desc');
      this.set('sortBy', sortBy);
    });
    await render(hbs`<Dashboard::Materials
        @courseIdFilter={{null}}
        @filter=''
        @sortBy={{this.sortBy}}
        @offset={{0}}
        @setOffset={{(noop)}}
        @limit={{25}}
        @setLimit={{(noop)}}
        @setCourseIdFilter={{(noop)}}
        @setFilter={{(noop)}}
        @setSortBy={{this.setSortBy}}
        @toggleMaterialsMode={{(noop)}}
        @showAllMaterials={{true}}
    />`);
    assert.strictEqual(component.topPaginator.controls.pagerDetails.text, 'Showing 1 - 25 of 205');
    assert.ok(component.table.headers.sessionTitle.isSortedOn);
    assert.ok(component.table.headers.sessionTitle.isSortedAscending);
    assert.notOk(component.table.headers.courseTitle.isSortedOn);
    assert.notOk(component.table.headers.title.isSortedOn);
    assert.notOk(component.table.headers.firstOfferingDate.isSortedOn);
    assert.strictEqual(component.table.rows[0].sessionTitle, 'session title');
    await component.table.headers.sessionTitle.click();
    assert.ok(component.table.headers.sessionTitle.isSortedDescending);
    assert.strictEqual(component.table.rows[0].sessionTitle, 'session5title');
  });

  test('sort by title', async function (assert) {
    assert.expect(10);
    this.server.get(`/api/usermaterials/:id`, () => {
      return {
        userMaterials: this.allMaterials,
      };
    });
    this.set('sortBy', 'title');
    this.set('setSortBy', (sortBy) => {
      assert.strictEqual(sortBy, 'title:desc');
      this.set('sortBy', sortBy);
    });
    await render(hbs`<Dashboard::Materials
        @courseIdFilter={{null}}
        @filter=''
        @sortBy={{this.sortBy}}
        @offset={{0}}
        @setOffset={{(noop)}}
        @limit={{25}}
        @setLimit={{(noop)}}
        @setCourseIdFilter={{(noop)}}
        @setFilter={{(noop)}}
        @setSortBy={{this.setSortBy}}
        @toggleMaterialsMode={{(noop)}}
        @showAllMaterials={{true}}
    />`);
    assert.strictEqual(component.topPaginator.controls.pagerDetails.text, 'Showing 1 - 25 of 205');
    assert.notOk(component.table.headers.sessionTitle.isSortedOn);
    assert.notOk(component.table.headers.courseTitle.isSortedOn);
    assert.ok(component.table.headers.title.isSortedOn);
    assert.ok(component.table.headers.title.isSortedAscending);
    assert.notOk(component.table.headers.firstOfferingDate.isSortedOn);
    assert.strictEqual(component.table.rows[0].title, 'Citation title 10 citationtext 10');
    await component.table.headers.title.click();
    assert.ok(component.table.headers.title.isSortedDescending);
    assert.strictEqual(
      component.table.rows[0].title,
      'Timed Release title5 (Available until 3/1/2013, 1:10 AM)'
    );
  });

  test('sort by first offering date', async function (assert) {
    assert.expect(10);
    this.server.get(`/api/usermaterials/:id`, () => {
      return {
        userMaterials: this.allMaterials,
      };
    });
    this.set('sortBy', 'firstOfferingDate');
    this.set('setSortBy', (sortBy) => {
      assert.strictEqual(sortBy, 'firstOfferingDate:desc');
      this.set('sortBy', sortBy);
    });
    await render(hbs`<Dashboard::Materials
        @courseIdFilter={{null}}
        @filter=''
        @sortBy={{this.sortBy}}
        @offset={{0}}
        @setOffset={{(noop)}}
        @limit={{25}}
        @setLimit={{(noop)}}
        @setCourseIdFilter={{(noop)}}
        @setFilter={{(noop)}}
        @setSortBy={{this.setSortBy}}
        @toggleMaterialsMode={{(noop)}}
        @showAllMaterials={{true}}
    />`);
    assert.strictEqual(component.topPaginator.controls.pagerDetails.text, 'Showing 1 - 25 of 205');
    assert.notOk(component.table.headers.sessionTitle.isSortedOn);
    assert.notOk(component.table.headers.title.isSortedOn);
    assert.notOk(component.table.headers.title.isSortedOn);
    assert.ok(component.table.headers.firstOfferingDate.isSortedOn);
    assert.ok(component.table.headers.firstOfferingDate.isSortedAscending);
    assert.strictEqual(component.table.rows[0].firstOfferingDate, this.today.format('M/D/YYYY'));
    await component.table.headers.firstOfferingDate.click();
    assert.ok(component.table.headers.firstOfferingDate.isSortedDescending);
    assert.strictEqual(component.table.rows[0].firstOfferingDate, this.nextWeek.format('M/D/YYYY'));
  });
});
