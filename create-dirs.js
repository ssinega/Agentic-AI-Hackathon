const fs = require('fs');
const path = require('path');

const dirs = [
  'app/api/insights/[id]',
  'app/api/opportunities/[id]',
  'app/api/personas/[id]',
  'app/api/themes/[id]'
];

dirs.forEach(d => {
  fs.mkdirSync(d, { recursive: true });
  console.log('Created', d);
});
