require('dotenv').config();

const fs = require('fs');

const ormConfigPath = './ormconfig.json';
const ormConfig = require(ormConfigPath);

function replaceConfigValues(config, env) {
  const regex = /\$\{(.+?)\}/g;
  return JSON.parse(JSON.stringify(config).replace(regex, (_, prop) => env[prop]));
}

const configWithEnv = replaceConfigValues(ormConfig, process.env);

fs.writeFileSync(ormConfigPath, JSON.stringify(configWithEnv, null, 2));
