import {
	addIpcAsyncListener,
	getServiceContainer,
	sendIPCEvent,
} from '@getflywheel/local/main';

import type { AddonMainContext } from '@getflywheel/local/main';
import { LARAVEL_CREATE_EVENT, LARAVEL_CREATE_KEY } from './constants';

export default function (context: AddonMainContext): void {
	const {
		electron: { ipcMain },
	} = context;

	const {
		cradle: { localLogger },
	} = getServiceContainer();

	addIpcAsyncListener('main-event', async () => {
		return 'Hello world! From Laravel';
	});

	ipcMain.on('ping', async (_, args) => {
		localLogger.warn('RECEIVED: "ping"', args);
		sendIPCEvent('pong', args);
	});

	ipcMain.on(LARAVEL_CREATE_KEY, async (_, args) => {
		localLogger.warn('CREATED: "Laravel"', args);
		sendIPCEvent(LARAVEL_CREATE_EVENT, args);
	});
}
