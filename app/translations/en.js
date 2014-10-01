var translations = {};
var general = {
  'save': 'Save',
  'done': 'Done',
  'edit': 'Edit',
  'published': 'Published',
  'notPublished': 'Not Published',
  'competencies': 'Competencies',
  'objectives': 'Objectives',
  'directors': 'Directors',
  'status': 'Status',
  'title': 'Title',
  'competency': 'Competency',
  'actions': 'Actions',
  'topics': 'Topics'
};
translations.general = general;

var programs = {
  'allPrograms': 'All Programs',
  'programs': 'Programs',
  'program': {
    'title': 'Program Title',
    'shortTitle': 'Short Title',
    'duration': 'Duration',
    'durationYears.one': '1 year',
    'durationYears.other': '{{count}} years',
    'editingProgram': 'Editing {{title}}',
    'createNew': 'Create a New Program'
  },
  'programYear': {
    'academicYear': 'Academic Year',
    'createNew': 'Create a New Program Year',
    'addDirector': 'Add Director',
    'removeDirector': 'Remove Director',
    'addCompetency': 'Add Competency',
    'removeCompetency': 'Remove Competency',
    'addTopic': 'Add Topic',
    'removeTopic': 'Remove Topic',
    'objectives': {
      'showFullTitle': 'Show Full Title Text',
      'new': 'Crete a new objective'
    },
    'competencies': {
      'available': 'Available Competencies',
      'selected': 'Selected Competencies'
    },
    'topics': {
      'available': 'Available Topics',
      'selected': 'Selected Topics'
    },
    'directors': {
      'available': 'Available Directors',
      'selected': 'Selected Directors',
      'noResults': 'Your seach returned no results.',
      'search': 'Search for directors'
    }
  }
};
translations.programs = programs;

var navigation = {
  'dashboard': 'Dashboard',
  'programs': 'Programs',
  'instructors': 'Instructors',
  'learnerGroups': 'Learner Group',
  'coursesSessions': 'Courses and Sessions',
  'logout': 'Logout',
  'logo': 'Ilios Logo'
};
translations.navigation = navigation;

export default translations;
