import createLaravelContent from './components/CreateLaravelContent';
import createLaravelOption from './components/CreateLaravelOption';

import type { CreateSiteRadioOption } from '@getflywheel/local/renderer';
import type { Breadcrumbs, Environment, Route } from './types';

import {
	ADDSITE_CREATE_KEY,
	ADDSITE_CREATE_PATH,
	LARAVEL_CREATE_KEY,
	LARAVEL_CREATE_PATH,
} from './constants';

export function RadioOptions(options: CreateSiteRadioOption) {
	options[ADDSITE_CREATE_KEY] = createLaravelOption();

	return options;
}

export function RoutesArray(routes: Route[], path: string) {
	const customRoutes = [
		{
			key: LARAVEL_CREATE_KEY,
			path: LARAVEL_CREATE_PATH,
			component: createLaravelContent,
		},
	];

	routes.forEach((route) => {
		if (route.path === `${path}/`) {
			customRoutes.push({
				key: ADDSITE_CREATE_KEY,
				path: ADDSITE_CREATE_PATH,
				component: route.component,
			});
		}
		customRoutes.push(route);
	});

	return customRoutes;
}

export function NewSiteEnvironment(environment: Environment) {
	if (environment.siteSettings?.customOptions?.useLaravel) {
		environment.onContinue = () => {
			environment.history.push(LARAVEL_CREATE_PATH);
		};
	}

	return environment;
}

export function RenderBreadcrumbs(breadcrumbs: Breadcrumbs) {
	const {
		localHistory: {
			location: { pathname },
		},
		defaultStepper,
		siteSettings,
	} = breadcrumbs;

	if (pathname === ADDSITE_CREATE_PATH) {
		siteSettings.customOptions = {
			...siteSettings.customOptions,
			useLaravel: true,
		};
	}

	if (siteSettings?.customOptions?.useLaravel) {
		const stepper = defaultStepper();
		const sChildren = stepper.props.children;

		if (pathname === LARAVEL_CREATE_PATH) {
			sChildren[0].props.done = true;
			sChildren[1].props.done = true;
		}

		sChildren[2].props.children = 'Set up Laravel';
		breadcrumbs.defaultStepper = () => stepper;
	}

	return breadcrumbs;
}
