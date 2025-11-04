import fs from 'fs';
import yaml from 'js-yaml';

const file = fs.readFileSync('./src/docs/swagger.yml', 'utf8');
const specs = yaml.load(file);

export default specs;