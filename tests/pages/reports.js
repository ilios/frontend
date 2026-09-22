import { create, visitable } from 'ember-cli-page-object';
import switcher from './components/reports/switcher';
import curriculum from './components/reports/curriculum';
import subjects from './components/reports/subjects-list';

const page = {
  visit: visitable('/reports'),
  visitSubjectReports: visitable('/reports/subjects'),
  visitCurriculumReports: visitable('/reports/curriculum'),
  visitCurriculumReports2026: visitable('/reports/curriculum?years=2026'),
  visitCurriculumReports2025: visitable('/reports/curriculum?years=2025'),
  visitCurriculumReports2024_2025: visitable('/reports/curriculum?years=2024-2025'),
  switcher,
  curriculum,
  subjects,
};

export default create(page);
