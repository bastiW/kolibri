import { Generic } from '@a11y-ui/core';
import { LinkProps, Stringified } from '../../components';

type RequiredProps = {
	label: string;
	links: Stringified<LinkProps[]>;
};
type OptionalProps = {
	/**
	 * @deprecated
	 */
	ariaLabel: string;
};

type RequiredStates = {
	label: string;
	links: LinkProps[];
};
type OptionalStates = OptionalProps;

export type KoliBriSkipNavStates = Generic.Element.Members<RequiredStates, OptionalStates>;
export type KoliBriSkipNavAPI = Generic.Element.ComponentApi<RequiredProps, OptionalProps, RequiredStates, OptionalStates>;
