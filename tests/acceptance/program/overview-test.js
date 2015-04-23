/* global moment */
import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';

var application;
var fixtures = {};
var url = '/program/1';
module('Acceptance: Program - Overview', {
  beforeEach: function() {
    application = startApp();
    server.create('user', {id: 4136});
    server.create('school');
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('check fields', function(assert) {
  var program = server.create('program', {
    owningSchool: 1,
  });
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'program.index');
    var container = find('.program-overview');
    assert.equal(getElementText(find('.programtitleshort div', container)), getText(program.shortTitle));
    assert.equal(getElementText(find('.programduration div', container)), program.duration);
  });
});

test('change title', function(assert) {
  var program = server.create('program', {
    owningSchool: 1,
  });
  visit(url);
  andThen(function() {
    var container = find('.detail-header');
    assert.equal(getElementText(find('.title h2', container)), getText('program 0'));
    click(find('.title h2 .editable', container));
    andThen(function(){
      var input = find('.title .editinplace input', container);
      assert.equal(getText(input.val()), getText('program 0'));
      fillIn(input, 'test new title');
      click(find('.title .editinplace .actions .save', container));
      andThen(function(){
        assert.equal(getElementText(find('.title h2', container)), getText('test new title'));
      });
    });
  });
});

test('change short title', function(assert) {
  var program = server.create('program', {
    owningSchool: 1,
  });
  visit(url);
  andThen(function() {
    var container = find('.detail-overview');
    assert.equal(getElementText(find('.programtitleshort div', container)), getText(program.shortTitle));
    click(find('.programtitleshort .editable', container));
    andThen(function(){
      var input = find('.programtitleshort .editinplace input', container);
      assert.equal(getText(input.val()), getText(program.shortTitle));
      fillIn(input, 'test new short title');
      click(find('.programtitleshort .editinplace .actions .save', container));
      andThen(function(){
        assert.equal(getElementText(find('.programtitleshort div', container)), getText('test new short title'));
      });
    });
  });
});

test('change duration', function(assert) {
  var program = server.create('program', {
    owningSchool: 1,
  });
  visit(url);
  andThen(function() {
    var container = find('.detail-overview');
    assert.equal(getElementText(find('.programduration div', container)), program.duration);
    click(find('.programduration .editable', container));
    andThen(function(){
      let options = find('.programduration select option', container);
      assert.equal(options.length, 10);
      for(let i = 0; i < 10; i++){
        assert.equal(getElementText(options.eq(i)), i+1);
      }
      pickOption(find('.programduration select', container), '9', assert);
      click(find('.programduration .editinplace .actions .save', container));
      andThen(function(){
        assert.equal(getElementText(find('.programduration div', container)), 9);
      });
    });
  });
});

test('leave duration at 1', function(assert) {
  var program = server.create('program', {
    owningSchool: 1,
    duration: null,
  });
  visit(url);
  andThen(function() {
    var container = find('.detail-overview');
    click(find('.programduration .editable', container));
    andThen(function(){
      click(find('.programduration .editinplace .actions .save', container));
      andThen(function(){
        assert.equal(getElementText(find('.programduration div', container)), 1);
      });
    });
  });
});
