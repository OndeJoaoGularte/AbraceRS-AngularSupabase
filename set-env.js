const { writeFileSync } = require('fs');
const { NG_APP_SUPABASE_URL, NG_APP_SUPABASE_KEY } = process.env;

const targetPath = './src/environments/environment.prod.ts';

const envConfigFile = `
export const environment = {
  production: true,
  supabaseUrl: '${NG_APP_SUPABASE_URL}',
  supabaseKey: '${NG_APP_SUPABASE_KEY}'
};
`;

writeFileSync(targetPath, envConfigFile);
console.log('✅ Arquivo environment.prod.ts gerado com sucesso.');
