import type { SiteSettings } from '@getflywheel/local/renderer';
import type { ReactElement } from 'react';

export interface Route {
	key: string;
	path: string;
	component: (RouteComponentProps) => ReactElement;
}

export interface History {
	location: Location;
	push: (path: string) => void;
	goBack: () => void;
}

export interface Environment {
	onContinue: () => void;
	onGoBack: () => void;
	siteSettings: SiteSettings;
	buttonText: string;
	history: History;
}

export interface Breadcrumbs {
	defaultStepper: () => ReactElement;
	localHistory: History;
	siteSettings: SiteSettings;
}
