import React, { FC } from 'react';
import { FormWrap } from '../FormWrap';
import { InputCheckboxVariants } from './partials/variants';

export const InputCheckboxButton: FC = () => <FormWrap RefComponent={InputCheckboxVariants} _variant="button" />;
