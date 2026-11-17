import { irregular } from '@ember-data/request-utils/string';
import Inflector from 'ember-inflector';
irregular('pcrs', 'pcrses');
irregular('vocabulary', 'vocabularies');

Inflector.inflector.irregular('pcrs', 'pcrses');
Inflector.inflector.irregular('vocabulary', 'vocabularies');
