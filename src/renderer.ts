import { ipcAsync, sendIPCEvent } from '@getflywheel/local/renderer';
import { ipcRenderer } from 'electron';

import type { AddonRendererContext } from '@getflywheel/local/renderer';

export default function (context: AddonRendererContext) {
	const { hooks } = context;

	hooks.addAction('CreateSite:Mounted', async () => {
		console.log('[main-event]:', await ipcAsync('main-event'));
		ipcRenderer.once('pong', (_, args) => {
			console.log('RECEIVED: "pong"', args);
		});
		sendIPCEvent('ping', { data: Date.now() });
	});
}
