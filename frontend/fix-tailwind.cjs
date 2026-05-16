const fs = require('fs');
const files = [
  'src/pages/AdminCourses.jsx',
  'src/pages/AdminUsers.jsx',
  'src/pages/teacher/TeacherCourses.jsx',
  'src/pages/CourseDetail.jsx',
  'src/pages/AdminTeachers.jsx',
  'src/pages/AssignmentPage.jsx',
  'src/pages/teacher/TeacherModules.jsx',
  'src/pages/Notifications.jsx',
  'src/pages/AdminCategories.jsx'
];

const regex = /(^|['"\s])((?:[a-z0-9-]+:)*)!([a-zA-Z0-9-\[\]\.\/]+)/g;

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    let matches = 0;
    
    content = content.replace(regex, (match, p1, p2, p3) => {
        matches++;
        return p1 + p2 + p3 + '!';
    });

    content = content.replace(/flex-grow/g, 'grow');
    content = content.replace(/rounded-\[1\.5rem\]!/g, 'rounded-3xl!');
    content = content.replace(/rounded-\[2rem\]!/g, 'rounded-4xl!');
    content = content.replace(/rounded-\[2rem\]/g, 'rounded-4xl');

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Replaced ' + matches + ' tailwind classes in ' + file);
    }
  }
}
