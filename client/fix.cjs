const fs = require('fs');

const files = [
    'src/pages/Dashboard.jsx',
    'src/pages/Booking.jsx',
    'src/pages/WeeklyView.jsx',
    'src/pages/Admin.jsx',
    'src/services/api.js'
];

files.forEach(f => {
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        // Replace literal "\\`" with "`"
        content = content.replace(/\\\`/g, '\`');
        // Replace literal "\\$" with "$"
        content = content.replace(/\\\$/g, '$');
        fs.writeFileSync(f, content);
        console.log('Fixed', f);
    } else {
        console.log('Not found:', f);
    }
});
