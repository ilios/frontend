import { create, visitable } from 'ember-cli-page-object';
import subjects from './components/reports/subjects-list';
import switcher from './components/reports/switcher';
import curriculum from './components/reports/curriculum';

const page = {
  visit: visitable('/reports'),
  visitCurriculumReports: visitable('/reports/curriculum'),
  visitCurriculumReports2026: visitable('/reports/curriculum?years=2026'),
  visitCurriculumReports2025: visitable('/reports/curriculum?years=2025'),
  visitCurriculumReports2024_2025: visitable('/reports/curriculum?years=2024-2025'),
  switcher,
  subjects,
  curriculum,
};

export default create(page);
