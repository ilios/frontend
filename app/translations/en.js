var translations = {};
var general = {
  'save': 'Save',
  'done': 'Done',
  'edit': 'Edit',
  'remove': 'Remove',
  'yes': 'Yes',
  'no': 'No',
  'undo': 'Undo',
  'home': 'Home',
  'add': 'Add',
  'published': 'Published',
  'notPublished': 'Not Published',
  'competencies': 'Competencies',
  'objectives': 'Objectives',
  'directors': 'Directors',
  'status': 'Status',
  'title': 'Title',
  'competency': 'Competency',
  'actions': 'Actions',
  'topics': 'Topics',
  'email': 'Email',
  'cohort': 'Cohort',
  'meshTerms': 'MeSH Terms',
  'members': 'Members',
  'people': 'People',
  'users': 'Users',
  'sessions': 'Sessions',
  'learners': 'Learners',
  'school': 'School',
  'year': 'Year',
  'publish': 'Publish',
  'unPublish': 'UnPublish',
  'overview': 'Overview',
  'start': 'Start',
  'end': 'End',
  'addNew': 'Add New',
  'program': 'Program',
  'level': 'Level',
  'description': 'Description',
  'parentObjectives': 'Parent Objectives'
};
translations.general = general;

var programs = {
  'allPrograms': 'All Programs',
  'programs': 'Programs',
  'selectSchool': 'Select School',
  'program': {
    'title': 'Program Title',
    'shortTitle': 'Short Title',
    'duration': 'Duration',
    'durationYears': {
      'one': '1 year',
      'other': '{{count}} years'
    },
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
    'stewardingSchools': 'Stewarding Schools',
    'classOf': 'Class of {{year}}',
    'objectives': {
      'showFullTitle': 'Show Full Title Text',
      'new': 'Create a new objective'
    },
    'competencies': {
      'available': 'Available Competencies',
      'selected': 'Selected Competencies'
    },
    'topics': {
      'available': 'Available Topics',
      'selected': 'Selected Topics'
    },
    'stewardingSchool': {
      'available': 'Available Schools',
      'selected': 'Selected Schools'
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
  'instructorGroups': 'Instructor Groups',
  'learnerGroups': 'Learner Groups',
  'courses': 'Courses and Sessions',
  'logout': 'Logout',
  'logo': 'Ilios Logo',
  'menu': 'Ilios Menu'
};
translations.navigation = navigation;

var mesh = {
  'buttonTitle': 'Select MeSH ({{count}})',
  'pickerTitle': 'Choose MeSH Terms',
  'selected': 'Selected MeSH Terms',
  'available': 'Available MeSH Terms',
  'search': 'Search MeSH Terms',
  'noResults': 'Your seach returned no results.',
};
translations.mesh = mesh;

var instructorGroups = {
  'new': 'New Instructor Group',
  'instructorName': 'Instructor Name',
  'instructors': 'Instructors',
  'editingGroup': 'Editing {{title}}',
  'addInstructor': 'Add Instructor',
  'availalbeInstructors': 'Available Instructors',
  'searchInstructors': 'Search Instructors',
  'noSearchResults': 'Your seach returned no results.',
  'confirmGroupRemovalTitle': 'Remove Instructor Group',
  'confirmGroupRemovalText': 'Are you sure you want to remove the {{title}} instructor group?',
  'relatedCourses': 'Related Courses',
  'selectSchool': 'Select School',
  'noGroups': 'There are no instructor groups in this school.',
};
translations.instructorGroups = instructorGroups;

var learnerGroups = {
  'learners': 'Learners',
  'new': 'New Learner Group',
  'learnerName': 'Learner Name',
  'addLearner': 'Add Learner',
  'learnerGroups': 'Learner Groups',
  'list': 'All Groups',
  'confirmGroupRemovalTitle': 'Remove Learner Group',
  'confirmGroupRemovalText': 'Are you sure you want to remove the {{title}} learner group?',
  'relatedCourses': 'Related Courses',
  'subGroups': 'Sub Groups',
  'noGroups': 'There are no learner groups in this cohort.',
  'selectCohort': 'Select Cohort',
  'selectSchool': 'Select School',
  'currentSchool': 'Current School',
};
translations.learnerGroups = learnerGroups;

var courses = {
  'currentSchool': 'Current School',
  'courseTitle': 'Course',
  'selectSchool': 'Select School',
  'selectYear': 'Select Educational Year',
  'new': 'New Course',
  'noCourses': 'There are no courses in this school',
  'educationalYear': 'Educational Year',
  'academicYear': 'Academic Year',
  'externalId': 'External ID',
  'startDate': 'Start Date',
  'endDate': 'End Date',
  'level': 'Level',
  'myCourses': 'My Courses Only',
  'newSession': 'New Session',
  'backToCourses': 'Back to Courses List',
  'details': 'Course Details',
  'cohorts': 'Cohorts',
  'titleFilterPlaceholder': 'Filter by course title',
};
translations.courses = courses;

var groupMembers = {
  'filterPlaceholder': 'Filter by name or email',
  'noSearchResults': 'Your search did not return any results'
};
translations.groupMembers = groupMembers;

var relatedCourses = {
  'title': 'Related Courses',
  'filterPlaceholder': 'Filter by name',
  'noCourses': 'There are no related courses',
  'noCoursesMatchFilter': 'No courses match your filter'
};
translations.relatedCourses = relatedCourses;

export default translations;
