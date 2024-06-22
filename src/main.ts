import { SiteServiceRole, SiteServiceType } from '@getflywheel/local';
import {
	HooksMain,
	addIpcAsyncListener,
	getServiceContainer,
	registerLightningService,
	sendIPCEvent,
} from '@getflywheel/local/main';
import Service from './Service';

import type { NewSiteInfo, Site } from '@getflywheel/local';
import type { AddonMainContext } from '@getflywheel/local/main';
import type { CustomSite, LaravelSettings } from './types';

import {
	LARAVEL_CREATE_EVENT,
	LARAVEL_CREATE_KEY,
	packageJSON,
} from './constants';

export default function (context: AddonMainContext): void {
	const {
		electron: { ipcMain },
	} = context;

	const {
		cradle: { localLogger },
	} = getServiceContainer();

	registerLightningService(Service, packageJSON.name, packageJSON.version);

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

	HooksMain.addFilter(
		'modifyAddSiteObjectBeforeCreation',
		(
			site: Site & CustomSite<LaravelSettings>,
			newSiteInfo: NewSiteInfo & CustomSite<LaravelSettings>,
		) => {
			if (newSiteInfo.asLaravel) {
				site.asLaravel = newSiteInfo.asLaravel;
				site.services = {
					...site.services,
					laravel: {
						name: packageJSON.name,
						version: packageJSON.version,
						type: SiteServiceType.LIGHTNING,
						role: SiteServiceRole.OTHER,
					},
				};
			}

			return site;
		},
	);
}
