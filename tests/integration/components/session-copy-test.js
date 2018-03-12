import Service from '@ember/service';
import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import wait from 'ember-test-helpers/wait';

const { resolve } = RSVP;

moduleForComponent('session-copy', 'Integration | Component | session copy', {
  integration: true
});

test('it renders', function(assert) {
  const now = moment();
  let thisYear = now.year();
  let lastYear = thisYear - 1;
  let nextYear = thisYear + 1;

  let school = EmberObject.create({
    id: 1
  });

  let course1 = EmberObject.create({
    id: 1,
    title: 'old course',
    school: school
  });

  let course2 = EmberObject.create({
    id: 1,
    title: 'old course 2',
    school: school
  });

  let session = EmberObject.create({
    id: 1,
    title: 'old session',
    course: course1
  });

  let storeMock = Service.extend({
    query(what, {filters}){
      assert.equal(what, 'course');
      assert.equal(filters.school, 1);
      assert.equal(filters.year, lastYear);

      return [course1, course2];
    },
    findAll(what){
      assert.equal(what, 'academicYear');

      return [lastYear, thisYear, nextYear].map(year => {
        return EmberObject.create({
          id: year,
          title: year
        });
      });
    }
  });
  this.register('service:store', storeMock);


  this.set('session', session);

  this.render(hbs`{{session-copy session=session}}`);

  const yearSelect = '.year-select select';
  const courseSelect = '.course-select select';
  const save = '.done';

  return wait().then(()=>{
    assert.equal(this.$(`${yearSelect} option`).length, 3);
    for (let i=0; i<2; i++){
      assert.equal(this.$(`${yearSelect} option:eq(${i})`).text().trim(), `${lastYear + i} - ${lastYear + i + 1}`);
    }
    assert.equal(this.$(`${courseSelect} option`).length, 2);
    assert.equal(this.$(`${courseSelect} option:eq(0)`).text().trim(), course1.get('title'));
    assert.equal(this.$(`${courseSelect} option:eq(1)`).text().trim(), course2.get('title'));
    assert.ok(this.$(save).not(':disabled'));

  });

});

test('copy session', async function(assert) {
  assert.expect(21);

  let thisYear = parseInt(moment().format('YYYY'), 10);

  let school = EmberObject.create({
    id: 1
  });

  let course = EmberObject.create({
    id: 1,
    title: 'old course',
    school: school
  });
  let lm = EmberObject.create();
  let learningMaterial = EmberObject.create({
    notes: 'soem notes',
    required: false,
    publicNotes: true,
    learningMaterial: resolve(lm),
    position: 3,
  });
  let objective = EmberObject.create({
    title: 'session objective title',
    parents: [EmberObject.create()],
    position: 3,
  });
  let objectives = [objective];
  let meshDescriptors = [EmberObject.create()];
  let terms = [EmberObject.create()];

  let session = EmberObject.create({
    id: 1,
    title: 'old session',
    course,
    attireRequired: true,
    equipmentRequired: false,
    supplemental: true,
    sessionType: resolve(EmberObject.create()),
    sessionDescription: resolve(EmberObject.create({
      id: 13,
      description: 'test description'
    })),
    objectives: resolve(objectives),
    meshDescriptors: resolve(meshDescriptors),
    terms: resolve(terms),
    learningMaterials: resolve([learningMaterial]),
  });

  let storeMock = Service.extend({
    query(){
      return [course];
    },
    findAll(){
      return [thisYear].map(year => {
        return EmberObject.create({
          id: year,
          title: year
        });
      });
    },
    createRecord(what, props){
      if (what === 'session') {
        assert.equal(session.attireRequired, props.attireRequired);
        assert.equal(session.equipmentRequired, props.equipmentRequired);
        assert.equal(session.supplemental, props.supplemental);
        assert.equal(session.title, props.title);

        return EmberObject.create({
          id: 14,
          save(){
            assert.equal(course, this.get('course'));
            assert.equal(meshDescriptors, this.get('meshDescriptors'));
            assert.equal(terms, this.get('terms'));
          }
        });
      }
      if (what === 'sessionLearningMaterial') {
        assert.equal(learningMaterial.get('notes'), props.notes);
        assert.equal(learningMaterial.get('required'), props.required);
        assert.equal(learningMaterial.get('publicNotes'), props.publicNotes);
        assert.equal(learningMaterial.get('position'), props.position);

        return EmberObject.create({
          save(){
            assert.equal(this.get('session.id'), 14);
            assert.equal(this.get('learningMaterial.id'), lm.get('id'));
          }
        });
      }
      if (what === 'sessionDescription') {
        assert.equal('test description', props.description);

        return EmberObject.create({
          save(){
            assert.equal(this.get('session.id'), 14);
          }
        });
      }
      if (what === 'objective') {
        assert.equal(objective.title, props.title);
        assert.equal(objective.position, props.position);

        return EmberObject.create({
          save(){
            let sessions = this.get('sessions');
            assert.equal(sessions.length, 1);

            assert.equal(sessions[0].get('id'), 14);
          }
        });
      }

      assert.ok(false, 'Unexpected call to createdRecord for a ' + what);

    }
  });
  this.register('service:store', storeMock);
  let flashmessagesMock = Service.extend({
    success(message){
      assert.equal(message, 'general.copySuccess');
    }
  });
  this.register('service:flashMessages', flashmessagesMock);


  this.set('session', session);
  this.set('visit', (newSession) => {
    assert.equal(newSession.id, 14);
  });
  this.render(hbs`{{session-copy session=session visit=(action visit)}}`);

  await wait();
  await this.$('.done').click();
  await wait();
});

test('errors do not show up initially and save cannot be clicked', function(assert) {
  let storeMock = Service.extend({
    query(){
      return [];
    },
    findAll(){
      return [];
    }
  });
  this.register('service:store', storeMock);


  let school = EmberObject.create({
    id: 1
  });

  let course = EmberObject.create({
    id: 1,
    title: 'old course',
    school: school
  });

  let session = EmberObject.create({
    id: 1,
    title: 'old session',
    course
  });

  this.set('session', session);

  this.render(hbs`{{session-copy session=session}}`);
  const save = '.done';

  return wait().then(() => {
    assert.equal(this.$('.messagee').length, 0);
    assert.ok(this.$(save).is(':disabled'));
  });
});

test('changing the year looks for new matching courses', async function(assert) {
  assert.expect(6);
  let count = 0;
  let thisYear = parseInt(moment().format('YYYY'), 10);
  let nextYear = thisYear + 1;

  let school = EmberObject.create({
    id: 1
  });

  let course = EmberObject.create({
    id: 1,
    title: 'old course',
    school: school
  });

  let session = EmberObject.create({
    id: 1,
    title: 'old session',
    course
  });

  let storeMock = Service.extend({
    query(what, {filters}){

      assert.equal(what, 'course');
      assert.equal(filters.school, 1);
      switch(count){
      case 0:
        assert.equal(filters.year, thisYear);
        break;
      case 1:
        assert.equal(filters.year, nextYear);
        break;
      default:
        assert.ok(false, 'should not be called again');
      }

      count++;
      return [];
    },
    findAll(){
      return [thisYear, nextYear].map(year => {
        return EmberObject.create({
          id: year,
          title: year
        });
      });
    }
  });
  this.register('service:store', storeMock);
  this.set('session', session);

  this.render(hbs`{{session-copy session=session}}`);
  const yearSelect = '.year-select select';

  await wait();
  this.$(yearSelect).val(nextYear).change();
  await wait();
});

test('copy session into the first course in a different year #2130', async function(assert) {
  assert.expect(9);

  let thisYear = parseInt(moment().format('YYYY'), 10);
  let nextYear = parseInt(moment().add(1, 'year').format('YYYY'), 10);

  let school = EmberObject.create({
    id: 1
  });

  let course = EmberObject.create({
    id: 1,
    title: 'old course',
    school: school,
    year: thisYear
  });

  let firstCourse = EmberObject.create({
    id: 2,
    title: 'old course',
    school: school,
    year: nextYear
  });

  let targetCourse = EmberObject.create({
    id: 3,
    title: 'alpha first',
    school: school,
    year: nextYear
  });


  let session = EmberObject.create({
    id: 1,
    title: 'old session',
    course,
    attireRequired: true,
    equipmentRequired: false,
    supplemental: true,
    sessionType: resolve(EmberObject.create()),
    sessionDescription: resolve(EmberObject.create()),
    objectives: resolve([]),
    meshDescriptors: resolve([]),
    terms: resolve([]),
    learningMaterials: resolve([]),
  });

  let storeMock = Service.extend({
    query(what, {filters}){
      assert.equal(what, 'course', 'we are searchign for courses');
      assert.ok('school' in filters, 'filtered by school');
      assert.ok('year' in filters, 'filtered by year');

      const year = parseInt(filters.year, 10);
      return [course, firstCourse, targetCourse].filter(c => c.get('year') === year);
    },
    findAll(){
      return [thisYear, nextYear].map(year => {
        return EmberObject.create({
          id: year,
          title: year
        });
      });
    },
    createRecord(what){
      if (what === 'session') {
        return EmberObject.create({
          id: 14,
          save(){
            assert.equal(targetCourse.get('id'), this.get('course.id'), 'the correct course was selected');
          }
        });
      }

      if (what === 'sessionDescription') {
        return EmberObject.create({
          save(){
          }
        });
      }

      assert.ok(false, 'Unexpected call to createdRecord for a ' + what);

    }
  });
  this.register('service:store', storeMock);
  let flashmessagesMock = Service.extend({
    success(){
    }
  });
  this.register('service:flashMessages', flashmessagesMock);


  this.set('session', session);
  this.set('visit', (newSession) => {
    assert.equal(newSession.id, 14);
  });
  this.render(hbs`{{session-copy session=session visit=(action visit)}}`);
  const yearSelect = '.year-select select';
  const courseSelect = '.course-select select';

  await wait();
  this.$(yearSelect).val(nextYear).change();
  await wait();
  assert.equal(this.$(courseSelect).val(), targetCourse.get('id'), 'first course is selected');
  this.$('.done').click();
  await wait();
});
