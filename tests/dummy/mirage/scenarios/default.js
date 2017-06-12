import moment from 'moment';

export default function(server) {
  const user = server.create('user');
  const offerings = server.createList('offering', 2);
  const now = moment();
  server.create('userEvent', {
    user,
    startDate: now.format(),
    endDate: now.clone().add(1, 'hour').format(),
    offering: offerings[0],
    instructors: [
      'Coolest Guy',
      'Not as Cool of a guy'
    ],
    learningMaterials: [
      {
        "id": "1",
        "session": "1",
        "course": "1",
        "required": true,
        "title": "Medical Knowledge",
        "description": "abbreviations",
        "originalAuthor": "Agent 99",
        "absoluteFileUri": "/lm/test",
        "filename": "ilios_demofile.pdf",
        "mimetype": "application/pdf",
        "sessionTitle": "Skill Session",
        "courseTitle": "Medicine",
        "instructors": []
      }
    ]
  });
  server.create('userEvent', {
    user,
    startDate: now.clone().add(1, 'day').format(),
    endDate: now.clone().add(1, 'day').add(1, 'hour').format(),
    offering: offerings[1],
    instructors: [
      'Professor Smart',
      'Agent 99'
    ],
    learningMaterials: [
      {
        "id": "1",
        "session": "1",
        "course": "1",
        "required": true,
        "title": "Medical Knowledge",
        "description": "abbreviations",
        "originalAuthor": "Agent 99",
        "absoluteFileUri": "/lm/test",
        "filename": "ilios_demofile.pdf",
        "mimetype": "application/pdf",
        "sessionTitle": "Skill Session",
        "courseTitle": "Medicine",
        "instructors": []
      },
      {
        "id": "2",
        "session": "1",
        "course": "1",
        "required": false,
        "title": "Important Stuff",
        "description": "abbreviations",
        "originalAuthor": "Agent 99",
        "absoluteFileUri": "/lm/test",
        "filename": "ilios_demofile.pdf",
        "mimetype": "application/pdf",
        "sessionTitle": "Skill Session",
        "courseTitle": "Medicine",
        "instructors": []
      }
    ]

  });
}
