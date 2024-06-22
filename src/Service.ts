import { execFile } from 'child_process';
import DotEnv from 'dotenv-extra';
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
			const dotEnv = new DotEnv(join(laraDir, '.env'));
			const commands = [
				`mysql -e "CREATE USER 'root'@'127.0.0.1' IDENTIFIED BY 'root'; GRANT ALL ON *.* TO 'root'@'127.0.0.1';"`,
				'cd ..',
				'php artisan migrate',
			];

			dotEnv.upsert('APP_NAME', this._site.name);
			dotEnv.upsert('APP_URL', this._site.url);
			dotEnv.upsert('DB_CONNECTION', 'mysql');
			dotEnv.upsert('DB_DATABASE', this._site.mysql?.database!);
			dotEnv.upsert('DB_USERNAME', this._site.mysql?.user!);
			dotEnv.upsert('DB_PASSWORD', this._site.mysql?.password!);
			dotEnv.upsert('DB_PORT', this._site.services?.mysql?.ports?.MYSQL);
			dotEnv.upsert('MAIL_MAILER', 'smtp');
			dotEnv.upsert('MAIL_FROM_ADDRESS', `"hello@${this._site.domain}"`);
			dotEnv.upsert(
				'MAIL_PORT',
				this._site.services?.mailpit?.ports?.SMTP,
			);
			dotEnv.save();

			await remove(appDir);
			await rename(laraDir, appDir);
			sendIPCEvent(
				'siteShellEntry:launch',
				this._site,
				commands.join('\n'),
			);
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
