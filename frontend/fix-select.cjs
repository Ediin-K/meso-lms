const fs = require('fs');
const glob = require('glob');

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

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace <Select ... without variant with <Select variant="outlined" ...
    // Note: this regex is simple and assumes <Select is followed by whitespace and doesn't already have variant="
    content = content.replace(/<Select\s+(?![\s\S]*?variant=)([^>]*?)>/g, '<Select variant="outlined" $1>');

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Added variant to Select in ' + file);
    }
  }
}
