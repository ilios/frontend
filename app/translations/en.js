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
  'close': 'Close',
  'published': 'Published',
  'notPublished': 'Not Published',
  'scheduled': 'Scheduled',
  'competencies': 'Competencies',
  'courses': 'Courses',
  'programs': 'Programs',
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
  'programYears': 'Program Years',
  'learners': 'Learners',
  'learnerGroups': 'Learner Groups',
  'school': 'School',
  'year': 'Year',
  'overview': 'Overview',
  'start': 'Start',
  'end': 'End',
  'starts': 'Starts',
  'ends': 'Ends',
  'time': 'Time',
  'startTime': 'Start Time',
  'endTime': 'End Time',
  'startDate': 'Start Date',
  'endDate': 'End Date',
  'date': 'Date',
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
  'instructorGroups': 'Instructor Groups',
  'other': 'Other',
  'singleDay': 'Single Day',
  'multiDay': 'Multi Day',
  'classOf': 'Class of {{year}}',
  'findInstructorOrGroup': 'Find Instructor or Group',
};
translations.general = general;

var programs = {
  'programTitle': 'Program Title',
  'titleFilterPlaceholder': 'Filter by Program Title',
  'programTitlePlaceholder': 'Enter a title for this program',
  'new': 'New Program',
  'confirmRemove': 'Are you sure you want to delete this program, with {{programYearCount}} program years and {{courseCount}} courses? This action will remove all courses and activities related to this program, and cannot be undone.',
  'backToPrograms': 'Back to Programs',
  'backToProgramYears': 'Back to Program Years',
  'programTitleShort': 'Program Title (short)',
  'durationInYears': 'Duration (in Years)',
  'noProgramYears': 'There are no program years in this program',
  'matriculationYear': 'Matriculation year',
  'competenciesManageTitle': 'Manage Competencies',
  'missingCompetenciesMessage': 'Please add at least one competency to this program year.',
  'currentCompetency': 'Current Competency',
  'objectiveCompetencyManagerTitle': 'Select Objective Competency',
  'stewardingSchoolsAndDepartments': 'Stewarding Schools and Departments',
  'stewardsManageTitle': 'Manage Stewards',
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
  'instructorGroupTitle': 'Instructor Group Title',
  'titleFilterPlaceholder': 'Filter by Instructor Group Title',
  'instructorGroupTitlePlaceholder': 'Enter a title for this instructor group',
  'new': 'New Instructor Group',
  'confirmRemove': 'Are you sure you want to delete this instructor group, with {{instructorCount}} instructors and {{courseCount}} courses? This action cannot be undone.',
  'members': 'Members',
  'associatedCourses': 'Associated Courses',
};
translations.instructorGroups = instructorGroups;

var learnerGroups = {
  'learnerGroupTitle': 'Learner Group Title',
  'titleFilterPlaceholder': 'Filter by Learner Group Title',
  'learnerGroupTitlePlaceholder': 'Enter a title for this learner group',
  'new': 'New Learner Group',
  'confirmRemove': 'Are you sure you want to delete this learner group, with {{learnerCount}} learners and {{subgroupCount}} subgroups? This action cannot be undone.',
  'members': 'Members',
  'subgroups': 'Subgroups',
  'defaultInstructors': 'Default Instructors',
  'defaultLocation': 'Default Location',
  'removeLearnerToCohort': 'Remove Learner to {{cohort}}',
  'switchLearnerToGroup': 'Switch Learner to {{{group}}}',
  'associatedCourses': 'Associated Courses',
  'noSubgroups': 'There are no subgroups in this learner group',
  'topGroupMembersNotInGroup': '{{groupTitle}} Members NOT in this Subgroup',
  'cohortMembersNotInGroup': 'Cohort Members NOT assigned to {{groupTitle}} ',
  'notInThisGroup': 'Not in this group',
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
  'noCohorts': 'There are no cohorts in this course',
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
  'expandDetail': 'View Details',
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
  'clerkshipType': 'Clerkship Type',
  'notAClerkship': 'Not a Clerkship',
  'cohortsManageTitle': 'Manage Cohorts',
  'learningMaterialManageTitle': 'Manage Learning Material',
  'learnerGroups': 'Learner Groups',
  'learnerGroupsManageTitle': 'Manage Learner Groups',
  'availalbeLearnerGroups': 'Available Learner Groups',
  'noAvailalbeLearnerGroups': 'There are no unselected learner groups in this cohort',
  'instructors': 'Instructors',
  'instructorsManageTitle': 'Manage Instructors',
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

var offerings = {
  'calendarOn': 'Calendar On',
  'calendarOff': 'Calendar Off',
};
translations.offerings = offerings;

var learningMaterials = {
  'displayName': 'Display Name',
  'owner': 'Owner',
  'contentAuthor': 'Content Author',
  'notes': 'Notes',
  'showNotesToStudents': 'Show Notes to Students',
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
  'publishProgram': 'Publish Program',
  'unPublishProgram': 'UnPublish Program',
  'publishProgramYear': 'Publish Program Year',
  'unPublishProgramYear': 'UnPublish Program Year',
};
translations.publish = publish;

export default translations;
