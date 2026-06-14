const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Dice a Metro di osservare i file in tutto il monorepo
config.watchFolders = [workspaceRoot];

// 2. Dice a Metro di cercare i nodi nel frontend e nella root principale
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Regola Monorepo di Expo: impedisce a Metro di perdersi tra le cartelle genitori
config.resolver.disableHierarchicalLookup = true;

module.exports = config;