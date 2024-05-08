import { configure } from './core/configure';
import { createApp } from './core/createApp';
import { plugin } from './core/plugin';

const DOMY = {
  configure,
  createApp,
  plugin
} as const;

export default DOMY;
