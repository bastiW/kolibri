import React, { FC } from 'react';
import { FormWrap } from '../FormWrap';
import { InputFileVariants } from './partials/variants';

export const InputFileBasic: FC = () => <FormWrap RefComponent={InputFileVariants} />;
