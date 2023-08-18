// https://codepen.io/mbxtr/pen/OJPOYg?html-preprocessor=haml

import { Component, h, Host, JSX, Prop, State, Watch } from '@stencil/core';

import { HeadingLevel } from '../../types/heading-level';
import { LabelPropType, validateLabel } from '../../types/props/label';
import { OpenPropType, validateOpen } from '../../types/props/open';
import { featureHint } from '../../utils/a11y.tipps';
import { nonce } from '../../utils/dev.utils';
import { setState } from '../../utils/prop.validators';
import { processEnv } from '../../utils/reuse';
import { watchHeadingLevel } from '../heading/validation';
import { API, KoliBriAccordionCallbacks, States } from './types';

featureHint(`[KolAccordion] Anfrage nach einer KolAccordionGroup bei dem immer nur ein Accordion geöffnet ist.

- onClick auf der KolAccordion anwenden
- Click-Event prüft den _open-Status der Accordions
- Logik Öffnet und Schließt entsprechend`);
featureHint(`[KolAccordion] Tab-Sperre des Inhalts im geschlossenen Zustand.`);

/**
 *
 * @slot - Ermöglicht das Einfügen beliebigen HTML's in den Inhaltsbereich des Accordions.
 * @slot content - Ermöglicht das Einfügen beliebigen HTML's in den Inhaltsbereich des Accordions.
 * @slot header - Deprecated für Version 2: Ermöglicht das Einfügen beliebigen HTML's in den Kopfbereich des Accordions.
 */
@Component({
	tag: 'kol-accordion',
	styleUrls: {
		default: './style.css',
	},
	shadow: true,
})
export class KolAccordion implements API {
	private readonly nonce = nonce();
	private contentElement: HTMLElement | null = null;
	private contentWrapperElement: HTMLElement | null = null;
	private contentObserver: ResizeObserver | null = null;
	private transition = false;

	private readonly catchContentElement = (element?: HTMLElement) => {
		if (element) this.contentElement = element;
	};
	private readonly catchContentWrapperElement = (element?: HTMLElement) => {
		if (element) this.contentWrapperElement = element;
	};

	resizeWrapper(list?: ResizeObserverEntry[]) {
		const content = this.contentElement;
		const wrapper = this.contentWrapperElement;
		const observer = this.contentObserver;
		if (content && wrapper && observer) {
			if (this._open) {
				wrapper.style.display = 'block';
				setTimeout(() => {
					wrapper.style.height = `${content?.clientHeight ?? 0}px`;
				});
				if (!list) observer.observe(content);
				wrapper.addEventListener(
					'transitionend',
					() => {
						wrapper.style.overflow = '';
					},
					{ once: true }
				);
			} else {
				wrapper.style.overflow = 'hidden';
				observer.unobserve(content);
				wrapper.style.height = '0';
				if (this.transition) {
					wrapper.addEventListener(
						'transitionend',
						() => {
							wrapper.style.display = 'none';
						},
						{ once: true }
					);
				} else {
					wrapper.style.display = 'none';
				}
			}
		}
	}

	public render(): JSX.Element {
		return (
			<Host>
				<div
					class={{
						accordion: true,
						open: this.state._open === true,
						close: this.state._open !== true,
					}}
				>
					<kol-heading-wc _label="" _level={this.state._level}>
						<kol-button-wc
							// slot="expert"
							_ariaControls={this.nonce}
							_ariaExpanded={this.state._open}
							_icon={this.state._open ? 'codicon codicon-remove' : 'codicon codicon-add'}
							_label={this.state._label}
							_on={{ onClick: this.onClick }}
						></kol-button-wc>
					</kol-heading-wc>
					<div class="header">
						<slot name="header"></slot>
					</div>
					<div ref={this.catchContentWrapperElement} class={{ wrapper: true, transition: this.transition }}>
						<div ref={this.catchContentElement} aria-hidden={this.state._open === false ? 'true' : undefined} class="content" id={this.nonce}>
							<slot name="content"></slot> {/* Deprecated for version 2 */}
							<slot />
						</div>
					</div>
				</div>
			</Host>
		);
	}

	/**
	 * Deprecated: Gibt die Beschriftung der Komponente an.
	 * @deprecated Use _label.
	 */
	@Prop() public _heading?: string;

	/**
	 * Setzt die sichtbare oder semantische Beschriftung der Komponente (z.B. Aria-Label, Label, Headline, Caption, Summary usw.).
	 */
	@Prop() public _label?: string;

	/**
	 * Gibt an, welchen H-Level von 1 bis 6 die Überschrift hat. Oder bei 0, ob es keine Überschrift ist und als fett gedruckter Text angezeigt werden soll.
	 */
	@Prop() public _level?: HeadingLevel = 1;

	/**
	 * Gibt die EventCallback-Funktionen an.
	 */
	@Prop() public _on?: KoliBriAccordionCallbacks;

	/**
	 * If set (to true) opens/expands the element, closes if not set (or set to false).
	 * TODO: Change type back to `OpenPropType` after Stencil#4663 has been resolved
	 */
	@Prop({ mutable: true, reflect: true }) public _open?: boolean = false;

	@State() public state: States = {
		_label: '…', // ⚠ required
		_level: 1,
	};

	@Watch('_heading')
	public validateHeading(value?: string): void {
		this.validateLabel(value);
	}

	@Watch('_label')
	public validateLabel(value?: LabelPropType): void {
		validateLabel(this, value);
	}

	@Watch('_level')
	public validateLevel(value?: HeadingLevel): void {
		watchHeadingLevel(this, value);
	}

	@Watch('_on')
	public validateOn(value?: KoliBriAccordionCallbacks): void {
		if (typeof value === 'object' && value !== null && typeof value.onClick === 'function') {
			setState(this, '_on', value);
		}
	}

	@Watch('_open')
	public validateOpen(value?: OpenPropType): void {
		validateOpen(this, value);
	}

	public componentWillLoad(): void {
		this.validateLabel(this._label || this._heading);
		this.validateLevel(this._level);
		this.validateOn(this._on);
		this.validateOpen(this._open);
		if (processEnv !== 'test') this.contentObserver = new ResizeObserver(this.resizeWrapper.bind(this));
		setTimeout(() => {
			if (this.contentObserver && this.contentElement) this.contentObserver.observe(this.contentElement);
		});
		// So it does not transition if it is set to open from the start.
		setTimeout(() => {
			this.transition = true;
		}, 200);
	}

	private onClick = (event: Event) => {
		this._open = !this._open;
		this.resizeWrapper();

		/**
		 * Der Timeout wird benötigt, damit das Event
		 * vom Button- auf das Accordion-Event wechselt.
		 * So ist es dem Anwendenden möglich das _open-
		 * Attribute abzufragen.
		 */
		setTimeout(() => {
			if (typeof this.state._on?.onClick === 'function') {
				this.state._on.onClick(event, this._open === true);
			}
		});
	};
}
