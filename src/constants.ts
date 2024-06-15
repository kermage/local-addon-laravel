import { readJSONSync } from 'fs-extra';
import { join } from 'path';

const packageJSON = readJSONSync(join(__dirname, '..', 'package.json'));

const ADDON_ID = packageJSON.name;
const ROUTE_KEY = 'add-site';
const BASE_PATH = `/main`;

export const ADDSITE_CREATE_KEY = `${ROUTE_KEY}/create-${ADDON_ID}`;
export const LARAVEL_CREATE_KEY = `${ROUTE_KEY}-create-${ADDON_ID}`;
export const ADDSITE_CREATE_PATH = `${BASE_PATH}/${ADDSITE_CREATE_KEY}`;
export const LARAVEL_CREATE_PATH = `${BASE_PATH}/${ROUTE_KEY}/${ADDON_ID}`;
export const LARAVEL_CREATE_EVENT = `${ROUTE_KEY}-created-${ADDON_ID}`;
