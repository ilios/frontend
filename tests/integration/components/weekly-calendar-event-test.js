import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
const s = '[data-test-weekly-calendar-event]';
import { setupMirage } from 'ember-cli-mirage/test-support';
import ENV from 'dummy/config/environment';

module('Integration | Component | weekly-calendar-event', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    const element = document.getElementById(ENV.APP.rootElement.substring(1));
    const { width } = window.getComputedStyle(element);

    this.containerWidth = width.slice(0, -2);
    const lastModified = '2012-01-09 08:00:00';
    const color = '#00cc65';

    this.server.create('userevent', {
      color,
      startDate: '2019-01-09 08:00:00',
      endDate: '2019-01-09 09:00:00',
      lastModified,
    });
    this.server.create('userevent', {
      color,
      startDate: '2019-01-09 08:00:00',
      endDate: '2019-01-09 11:30:00',
      lastModified,
    });
    this.server.create('userevent', {
      color,
      startDate: '2019-01-09 08:10:00',
      endDate: '2019-01-09 10:00:00',
      lastModified,
    });
    this.server.create('userevent', {
      color,
      startDate: '2019-01-09 10:00:00',
      endDate: '2019-01-09 12:00:00',
      lastModified,
    });
    this.server.create('userevent', {
      color,
      startDate: '2019-01-09 10:10:00',
      endDate: '2019-01-09 12:00:00',
      lastModified,
    });
    this.server.create('userevent', {
      color,
      startDate: '2019-01-09 12:00:00',
      endDate: '2019-01-09 13:00:00',
      lastModified,
    });
    this.events = this.server.db.userevents;
  });

  this.getSizes = function (conflicts, order) {
    const width = (this.containerWidth / conflicts).toFixed(3);
    const left = ((this.containerWidth / conflicts) * order).toFixed(3);

    const f = new Intl.NumberFormat(
      'en-US',
      {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
        useGrouping: false,
      }
    );

    return {
      width: f.format(width),
      left: f.format(left),
    };
  };

  test('it renders alone', async function (assert) {
    this.set('event', this.events[0]);
    await render(hbs`<WeeklyCalendarEvent
      @event={{this.event}}
      @allDayEvents={{array}}
    />`);

    assert.dom(s).hasStyle({
      'background-color': 'rgb(0, 204, 101)',
      'border-left-width': '4px',
      'border-left-style': 'solid',
      'border-left-color': 'rgb(0, 173, 86)',
      'margin-left': '0px',
      'grid-row-start': '481',
      'grid-row-end': 'span 60',
      'width': `${this.containerWidth}px`,
    });
    assert.dom(s).hasText('8:00am event 0');
  });

  test('check event 0', async function (assert) {
    this.set('event', this.events[0]);
    this.set('events', this.events);
    await render(hbs`<WeeklyCalendarEvent
      @event={{this.event}}
      @allDayEvents={{this.events}}
    />`);

    const { width, left } = this.getSizes(3, 2);

    assert.dom(s).hasStyle({
      'background-color': 'rgb(0, 204, 101)',
      'border-left-width': '4px',
      'border-left-style': 'solid',
      'border-left-color': 'rgb(0, 173, 86)',
      'grid-row-start': '481',
      'grid-row-end': 'span 60',
      'margin-left': `${left}px`,
      'width': `${width}px`,
    });
    assert.dom(s).hasText('8:00am event 0');
  });

  test('check event 1', async function (assert) {
    this.set('event', this.events[1]);
    this.set('events', this.events);
    await render(hbs`<WeeklyCalendarEvent
      @event={{this.event}}
      @allDayEvents={{this.events}}
    />`);

    const { width, left } = this.getSizes(3, 0);

    assert.dom(s).hasStyle({
      'background-color': 'rgb(0, 204, 101)',
      'border-left-width': '4px',
      'border-left-style': 'solid',
      'border-left-color': 'rgb(0, 173, 86)',
      'grid-row-start': '481',
      'grid-row-end': 'span 210',
      'margin-left': `${left}px`,
      'width': `${width}px`,
    });
    assert.dom(s).hasText('8:00am event 1');
  });

  test('check event 2', async function (assert) {
    this.set('event', this.events[2]);
    this.set('events', this.events);
    await render(hbs`<WeeklyCalendarEvent
      @event={{this.event}}
      @allDayEvents={{this.events}}
    />`);

    const { width, left } = this.getSizes(3, 1);

    assert.dom(s).hasStyle({
      'background-color': 'rgb(0, 204, 101)',
      'border-left-width': '4px',
      'border-left-style': 'solid',
      'border-left-color': 'rgb(0, 173, 86)',
      'grid-row-start': '491',
      'grid-row-end': 'span 110',
      'margin-left': `${left}px`,
      'width': `${width}px`,
    });
    assert.dom(s).hasText('8:10am event 2');
  });

  test('check event 3', async function (assert) {
    this.set('event', this.events[3]);
    this.set('events', this.events);
    await render(hbs`<WeeklyCalendarEvent
      @event={{this.event}}
      @allDayEvents={{this.events}}
    />`);

    const { width, left } = this.getSizes(3, 1);

    assert.dom(s).hasStyle({
      'background-color': 'rgb(0, 204, 101)',
      'border-left-width': '4px',
      'border-left-style': 'solid',
      'border-left-color': 'rgb(0, 173, 86)',
      'grid-row-start': '601',
      'grid-row-end': 'span 120',
      'margin-left': `${left}px`,
      'width': `${width}px`,
    });
    assert.dom(s).hasText('10:00am event 3');
  });

  test('check event 4', async function (assert) {
    this.set('event', this.events[4]);
    this.set('events', this.events);
    await render(hbs`<WeeklyCalendarEvent
      @event={{this.event}}
      @allDayEvents={{this.events}}
    />`);

    const { width, left } = this.getSizes(3, 2);

    assert.dom(s).hasStyle({
      'background-color': 'rgb(0, 204, 101)',
      'border-left-width': '4px',
      'border-left-style': 'solid',
      'border-left-color': 'rgb(0, 173, 86)',
      'grid-row-start': '611',
      'grid-row-end': 'span 110',
      'margin-left': `${left}px`,
      'width': `${width}px`,
    });
    assert.dom(s).hasText('10:10am event 4');
  });

  test('check event 5', async function (assert) {
    this.set('event', this.events[5]);
    this.set('events', this.events);
    await render(hbs`<WeeklyCalendarEvent
      @event={{this.event}}
      @allDayEvents={{this.events}}
    />`);

    const { width, left } = this.getSizes(1, 0);

    assert.dom(s).hasStyle({
      'background-color': 'rgb(0, 204, 101)',
      'border-left-width': '4px',
      'border-left-style': 'solid',
      'border-left-color': 'rgb(0, 173, 86)',
      'grid-row-start': '721',
      'grid-row-end': 'span 60',
      'margin-left': `${left}px`,
      'width': `${width}px`,
    });
    assert.dom(s).hasText('12:00pm event 5');
  });
});
