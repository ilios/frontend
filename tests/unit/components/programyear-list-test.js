import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('programyear-list', 'Unit | Component | programyear list', {
  needs: ['service:currentUser'],
  unit: true
});

test('properties have default values', function(assert) {
  assert.expect(1);

  const expected = {
    program:      null,
    programYears: [],
    editorOn:     false,
    selection:    null
  };

  const component = this.subject();

  const actual = {
    program:      component.get('program'),
    programYears: component.get('programYears'),
    editorOn:     component.get('editorOn'),
    selection:    component.get('selection'),
  };

  assert.deepEqual(actual.program, expected.program, 'default values are correct');
});

test('`availableAcademicYears` computed property works properly', function(assert) {
  assert.expect(1);

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const twoYearsFromNow = nextYear + 1;
  const threeYearsFromNow = twoYearsFromNow + 1;

  const programYears = [{
    academicYears: `${nextYear} - ${twoYearsFromNow}`, startYear: `${nextYear}`
  }, {
    academicYears: `${twoYearsFromNow} - ${threeYearsFromNow}`, startYear: `${twoYearsFromNow}`
  }];

  for (let i = 0; i < 10; i++) {
    if (i !== 5) {
      let start = (currentYear - 5 + i).toString();
      let end = (currentYear - 4 + i).toString();

      programYears.pushObject({ academicYears: `${start} - ${end}`, startYear: start });
    }
  }

  const startYear = currentYear.toString();
  const endYear = (currentYear + 1).toString();

  const expected = [{ value: currentYear, label: `${startYear} - ${endYear}` }];
  const component = this.subject({ programYears });
  const actual = component.get('availableAcademicYears');

  assert.deepEqual(actual, expected, 'computed property works');
});
