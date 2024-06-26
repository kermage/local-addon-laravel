import { ipcRenderer } from 'electron';
import React, { useEffect, useRef, useState } from 'react';

import {
	FlyModal,
	FlySelect,
	PrimaryButton,
	Text,
	TextButton,
	Title,
} from '@getflywheel/local-components';
import { sendIPCEvent } from '@getflywheel/local/renderer';

import type { NewSiteDefaults, NewSiteInfo } from '@getflywheel/local';
import type { CustomSite, History, LaravelSettings } from '../types';

import { LARAVEL_CREATE_EVENT } from '../constants';

interface Props {
	defaultLocalSettings: {
		'new-site-defaults': NewSiteDefaults;
	};
	siteSettings: NewSiteInfo & CustomSite<LaravelSettings>;
	history: History;
}

const starterKits = {
	none: 'None',
	breeze: 'Breeze',
	jetstream: 'Jetstream',
};

const testFrameworks = {
	phpunit: 'PHPUnit',
	pest: 'Pest',
};

const stacks = {
	breeze: {
		blade: 'Blade with Alpine',
		livewire: 'Livewire (Volt Class API) with Alpine',
		'livewire-functional': 'Livewire (Volt Functional API) with Alpine',
		react: 'React with Inertia',
		vue: 'Vue with Inertia',
		api: 'API only',
	},
	jetstream: {
		livewire: 'Livewire',
		inertia: 'Vue with Inertia',
	},
};

let selected = {
	starterKit: 'none',
	testFramework: 'phpunit',
	stack: '',
};

export default function (props: Props) {
	const addSiteButtonRef = useRef<HTMLElement>();
	const [showModal, updateShowModal] = useState(false);
	const [modalContent, updateModalContent] = useState({});
	const [starterKit, updateStarterKit] = useState(selected.starterKit);
	const [testFramework, updateTestFramework] = useState(
		selected.testFramework,
	);
	const [stack, updateStack] = useState(selected.stack);
	const [stackOptions, updateStackOptions] = useState({});

	function addSite() {
		addSiteButtonRef.current?.setAttribute('disabled', 'true');
		addSiteButtonRef.current?.setAttribute('aria-disabled', 'true');
		sendIPCEvent('addSite', {
			newSiteInfo: props.siteSettings,
			wpCredentials: {
				adminEmail:
					props.defaultLocalSettings['new-site-defaults'].adminEmail,
			},
			goToSite: true,
		});
	}

	function closeModal() {
		addSiteButtonRef.current?.removeAttribute('disabled');
		addSiteButtonRef.current?.removeAttribute('aria-disabled');
		updateShowModal(false);
	}

	useEffect(() => {
		ipcRenderer.on(LARAVEL_CREATE_EVENT, (_, args) => {
			updateShowModal(true);
			updateModalContent(args);
		});
	}, []);

	useEffect(() => {
		if ('none' === starterKit) {
			return;
		}

		const stackOptions = stacks[starterKit as keyof typeof stacks];

		updateStackOptions(stackOptions);

		if (!(stack in stackOptions)) {
			updateStack(Object.keys(stackOptions)[0]);
		}
	}, [starterKit]);

	useEffect(() => {
		selected = { starterKit, testFramework, stack };
		props.siteSettings.asLaravel = selected;
	}, [starterKit, testFramework, stack]);

	return (
		<div className="AddSiteContent">
			<Title size="l" container={{ margin: 'l 0' }}>
				Set up Laravel
			</Title>

			<div className="Inner">
				<div className="FormRow FormRow__Half __Margin_0">
					<div className="FormField">
						<label>Starter Kit</label>
						<FlySelect
							value={starterKit}
							options={starterKits}
							onChange={updateStarterKit}
						/>
					</div>

					<div className="FormField">
						<label>Test Framework</label>
						<FlySelect
							value={testFramework}
							options={testFrameworks}
							onChange={updateTestFramework}
						/>
					</div>
				</div>

				{starterKit !== 'none' && (
					<div className="FormRow FormRow__Half FormRow__Center __MarginTop_20">
						<div className="FormField">
							<label>Stack</label>
							<FlySelect
								value={stack}
								options={stackOptions}
								onChange={updateStack}
							/>
						</div>
					</div>
				)}
			</div>

			<PrimaryButton
				// eslint-disable-next-line
				// @ts-ignore
				innerRef={addSiteButtonRef}
				onClick={() => addSite()}
				className="Continue"
			>
				Add site
			</PrimaryButton>

			<TextButton className="GoBack" onClick={props.history.goBack}>
				Go back
			</TextButton>

			<FlyModal isOpen={showModal} onRequestClose={closeModal}>
				<Title size="xl">Laravel Created</Title>
				<Text tag="p" size="default" style={{ padding: '0 6rem 6rem' }}>
					<pre style={{ textAlign: 'initial' }}>
						{JSON.stringify(modalContent, null, 4)}
					</pre>
				</Text>
			</FlyModal>
		</div>
	);
}
