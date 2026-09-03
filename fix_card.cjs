const fs = require('fs');
const file = 'src/components/DataUnavailableCard.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/const { language, setIsDemoMode, setCurrentPage } = useApp\(\);/g, 'const { language, setCurrentPage } = useApp();');

// Remove the SIH demo mode button completely
const btnRegex = /<button[\s\S]*?setIsDemoMode\(true\);[\s\S]*?<\/button>/;
data = data.replace(btnRegex, '');

fs.writeFileSync(file, data);
console.log('Fixed DataUnavailableCard');
