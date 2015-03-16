var translations = {};
var general = {
  'save': 'Save',
  'done': 'Done',
  'edit': 'Edit',
  'remove': 'Remove',
  'yes': 'Yes',
  'no': 'No',
  'cancel': 'Cancel',
  'undo': 'Undo',
  'results': 'Results',
  'home': 'Home',
  'add': 'Add',
  'addNew': 'Add New',
  'none': 'None',
  'published': 'Published',
  'notPublished': 'Not Published',
  'scheduled': 'Scheduled',
  'competencies': 'Competencies',
  'courses': 'Courses',
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
  'cohorts': 'Cohorts',
  'meshTerms': 'MeSH Terms',
  'mesh': 'MeSH',
  'members': 'Members',
  'people': 'People',
  'users': 'Users',
  'sessions': 'Sessions',
  'learners': 'Learners',
  'school': 'School',
  'year': 'Year',
  'overview': 'Overview',
  'start': 'Start',
  'end': 'End',
  'starts': 'Starts',
  'ends': 'Ends',
  'time': 'Time',
  'program': 'Program',
  'level': 'Level',
  'description': 'Description',
  'parentObjectives': 'Parent Objectives',
  'learningMaterials': 'Learning Materials',
  'findDirector': 'Find Director',
  'moreInputRequiredPrompt': 'keep typing...',
  'noSearchResultsPrompt': 'no results',
  'currentlySearchingPrompt': 'searching...',
  'printSummary': 'Print Summary',
  'type': 'Type',
  'groups': 'Groups',
  'associatedGroups': 'Associated Groups',
  'offerings': 'Offerings',
  'filterPlaceholder': 'Start typing to filter list',
  'required': 'Required',
  'loading': 'Loading Ilios',
  'backToTitle': 'Back to {{title}}',
  'clickToEdit': 'Click to edit',
  'academicYear': 'Academic Year',
  'groupName': 'Group Name',
  'dateTime': 'Date/Time',
  'location': 'Location',
  'instructors': 'Instructors',
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
  'noSessions': 'There are no sessions in this course',
  'educationalYear': 'Educational Year',
  'externalId': 'External ID',
  'startDate': 'Start Date',
  'endDate': 'End Date',
  'level': 'Level',
  'myCourses': 'My Courses',
  'allCourses': 'All Courses',
  'newSession': 'New Session',
  'backToCourses': 'Back to Courses List',
  'details': 'Course Details',
  'cohorts': 'Program Cohorts',
  'availableCohorts': 'Available Cohorts',
  'noAvailableCohorts': 'No available cohorts',
  'titleFilterPlaceholder': 'Filter by course title',
  'courseTitlePlaceholder': 'Enter a title for this course',
  'findDirector': 'Find Director',
  'expandDetail': 'View All/Edit',
  'collapseDetail': 'Close',
  'firstOffering': 'First Offering',
  'filterPlaceholder': '',
  'title': 'Course Title',
  'objectiveParentTitle': 'Select Parent Objectives',
  'objectiveDescriptorTitle': 'Select MeSH Descriptors',
  'chooseCohortTitle': 'Select Parent For',
  'missingCohortMessage': 'Please add at least one cohort to this course.',
  'confirmRemove': 'Are you sure you want to delete this course, with {{publishedOfferingCount}} published offerings? This action will remove all sessions and offerings for this course, and cannot be undone.',
  'meshSearchPlaceholder': 'Search MeSH',
  'topicsManageTitle': 'Manage Topics',
};
translations.courses = courses;

var sessions = {
  'specialAttireRequired': 'Special Attire Required',
  'specialEquipmentRequired': 'Special Equipment Required',
  'supplementalCurriculum': 'Supplemental Curriculum',
  'type': 'Session Type',
  'backToSessionList': 'Back to Session List',
  'backToDetails': 'Back to Session Details',
  'objectiveTitle': 'Session Objective',
  'missingCourseObjectivesMessage': 'Please add at least one objective to the course.',
  'objectiveParentsTitle': 'Selecte Parent Objectives',
  'titleFilterPlaceholder': 'Filter by title, type, or status',
  'sessionTitlePlaceholder': 'Enter a title for this session',
  'new': 'New Session',
  'loadingSessionTypes': 'Loading Session Types...',
  'title': 'Session Title',
  'noOfferings': 'This session has no offerings',
  'noOfferingLearnerGroups': 'No Groups',
  'openSmallGroupGenerator': 'Open Offering Small Group Generator',
  'multiday': 'Multiday',
  'independentLearning': 'Independent Learning',
  'hours': 'Hours',
  'dueBy': 'Due By',
};
translations.sessions = sessions;

var learningMaterials = {
  'displayName': 'Display Name',
  'owner': 'Owner',
  'contentAuthor': 'Content Author',
  'notes': 'Notes',
  'file': 'File',
  'link': 'Web Link',
  'citation': 'Citation',
  'userRole': 'User Role',
  'status': 'Status',
  'copyrightPermission': 'Copyright Permission',
  'copyrightAgreement': "The file I am attempting to upload is my own or I have express permission to reproduce and/or distribute this item and does not contain any protected health information. My use of this file is in compliance with Government and University policies on copyright and information security and my educational program's guidelines for professional conduct. This file also adheres to the Terms and Conditions for this application.",
  'copyrightRationale':'Copyright Rationale',

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

var publish = {
  'markAsScheduled': 'Mark as Scheduled',
  'publishAsIs': 'Publish As-is',
  'reviewMissingItems': 'Review {{count}} Missing Items',
  'missingItems': 'Missing Items',
  'publishSession': 'Publish Session',
  'unPublishSession': 'UnPublish Session',
  'publishCourse': 'Publish Course',
  'unPublishCourse': 'UnPublish Course',
};
translations.publish = publish;

export default translations;
