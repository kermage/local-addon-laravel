import {
	addIpcAsyncListener,
	getServiceContainer,
	sendIPCEvent,
} from '@getflywheel/local/main';

import type { AddonMainContext } from '@getflywheel/local/main';

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
}
