import Inflector from 'ember-inflector';
import { irregular } from '@ember-data/request-utils/string';
irregular('pcrs', 'pcrses');
irregular('vocabulary', 'vocabularies');

Inflector.inflector.irregular('pcrs', 'pcrses');
Inflector.inflector.irregular('vocabulary', 'vocabularies');
