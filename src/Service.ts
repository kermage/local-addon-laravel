import { execFile } from 'child_process';
import { remove, rename } from 'fs-extra';
import { join } from 'path';
import { promisify } from 'util';

import {
	LightningService,
	getServiceContainer,
	sendIPCEvent,
} from '@getflywheel/local/main';

import type { Services } from '@getflywheel/local/main';

import { packageJSON } from './constants';

export default class extends LightningService {
	readonly serviceName: string = packageJSON.name;

	// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// // @ts-ignore
	get bins() {
		return {};
	}

	async getInfo(wpCli: Services.WpCli) {
		const output = await wpCli.run(this._site, ['cli', 'info']);

		if (!output) {
			throw new Error('WP-CLI info output was empty');
		}

		return output.split('\n').reduce(
			(acc, line) => {
				const [key, value] = line.split('\t');

				return { ...acc, [key.slice(0, -1)]: value };
			},
			{} as {
				[key: string]: string;
			},
		);
	}

	setMessage(prefix: string) {
		sendIPCEvent(
			'updateSiteMessage',
			this._site.id,
			`${prefix} ${packageJSON.productName}`,
		);
	}

	async provision(): Promise<void> {
		this.setMessage('Provisioning');

		const { wpCli } = getServiceContainer().cradle;
		const cliInfo = await this.getInfo(wpCli);

		await promisify(execFile).apply(null, [
			cliInfo['PHP binary'],
			[
				join(
					process.resourcesPath,
					'extraResources',
					'bin',
					'composer',
					'composer.phar',
				),
				'create-project',
				'laravel/laravel',
			],
			{
				cwd: this._site.path,
				shell: false,
			},
		] as const);
	}

	async finalizeNewSite() {
		const { errorHandler } = getServiceContainer().cradle;

		this.setMessage('Finalizing');

		try {
			const appDir = join(this._site.path, 'app');
			const laraDir = join(this._site.path, 'laravel');

			await remove(appDir);
			await rename(laraDir, appDir);
		} catch (e: unknown) {
			const error = e as Error;

			errorHandler.handleError({
				error: error,
				message: error.toString(),
				dialogTitle: 'Uh-oh! Local ran into an error.',
				dialogMessage: error.toString(),
			});
		}
	}

	start() {
		return [];
	}
}
