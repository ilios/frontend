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
  'addNew': 'Add New',
  'published': 'Published',
  'notPublished': 'Not Published',
  'scheduled': 'Scheduled',
  'competencies': 'Competencies',
  'objectives': 'Objectives',
  'objective': 'Objective',
  'directors': 'Directors',
  'status': 'Status',
  'title': 'Title',
  'competency': 'Competency',
  'actions': 'Actions',
  'topics': 'Topics',
  'email': 'Email',
  'cohort': 'Cohort',
  'meshTerms': 'MeSH Terms',
  'mesh': 'MeSH',
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
  'program': 'Program',
  'level': 'Level',
  'description': 'Description',
  'parentObjectives': 'Parent Objectives',
  'learningMaterials': 'Learning Materials',
  'findDirector': 'Find Director',
  'moreInputRequiredPrompt': 'keep typing...',
  'printSummary': 'Print Summary',
  'type': 'Type',
  'groups': 'Groups',
  'offerings': 'Offerings',
  'filterPlaceholder': 'Start typing to filter list',
  'required': 'Required'
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
  'groupName': 'Group Name',
  'subGroups': 'Sub Groups',
  'learners': 'Learners',
  'titleFilterPlaceholder': 'Filter by group title',
  'newGroupTitle': 'New Learner Group'
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
  'cohorts': 'Program Cohorts',
  'noAvailableCohorts': 'No available cohorts',
  'titleFilterPlaceholder': 'Filter by course title',
  'findDirector': 'Find Director',
  'expandDetail': 'View All/Edit',
  'collapseDetail': 'Close',
  'firstOffering': 'First Offering',
  'filterPlaceholder': ''
};
translations.courses = courses;

var learningMaterials = {
  'displayName': 'Display Name',
  'owner': 'Owner',
  'notes': 'Notes'
};
translations.learningMaterials = learningMaterials;

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
