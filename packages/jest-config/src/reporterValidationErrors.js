/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * @flow
 */

import type {ReporterConfig} from 'types/Config';

const {ValidationError} = require('jest-validate');

const chalk = require('chalk');
const {getType} = require('jest-matcher-utils');
const {DOCUMENTATION_NOTE, BULLET} = require('./utils');

const validReporterTypes = ['array', 'string'];
const ERROR = `${BULLET}Reporter Validation Error`;

/**
 * Reporter Vaidation Error is thrown if the given arguments
 * within the reporter are not valid.
 *
 * This is a highly specific reporter error and in the future will be
 * merged with jest-validate. Till then, we can make use of it. It works
 * and that's what counts most at this time.
 */
function createReporterError(
  reporterIndex: number,
  reporterValue: Array<ReporterConfig> | string,
): ValidationError {
  const errorMessage =
    `  Reporter at index ${reporterIndex} must be of type:\n` +
    `    ${chalk.bold.green(validReporterTypes.join(' or '))}\n` +
    `  but instead received:\n` +
    `    ${chalk.bold.red(getType(reporterValue))}`;

  return new ValidationError(ERROR, errorMessage, DOCUMENTATION_NOTE);
}

function createArrayReporterError(
  arrayReporter: ReporterConfig,
  reporterIndex: number,
  valueIndex: number,
  value: string | Object,
  expectedType: string,
  valueName: string,
): ValidationError {
  const errorMessage =
    `  Unexpected value for ${valueName} ` +
    `at index ${valueIndex} of reporter at index ${reporterIndex}\n` +
    '  Expected:\n' +
    `    ${chalk.bold.red(expectedType)}\n` +
    '  Got:\n' +
    `    ${chalk.bold.green(getType(value))}\n` +
    `  Reporter configuration:\n` +
    `    ${chalk.bold.green(JSON.stringify(arrayReporter, null, 2)
        .split('\n')
        .join('\n    '))}`;

  return new ValidationError(ERROR, errorMessage, DOCUMENTATION_NOTE);
}

function validateReporters(
  reporterConfig: Array<ReporterConfig | string>,
): boolean {
  return reporterConfig.every((reporter, index) => {
    if (Array.isArray(reporter)) {
      validateArrayReporter(reporter, index);
    } else if (typeof reporter !== 'string') {
      throw createReporterError(index, reporter);
    }

    return true;
  });
}

function validateArrayReporter(
  arrayReporter: ReporterConfig,
  reporterIndex: number,
) {
  const [path, options] = arrayReporter;
  if (typeof path !== 'string') {
    throw createArrayReporterError(
      arrayReporter,
      reporterIndex,
      0,
      path,
      'string',
      'Path',
    );
  } else if (typeof options !== 'object') {
    throw createArrayReporterError(
      arrayReporter,
      reporterIndex,
      1,
      options,
      'object',
      'Reporter Configuration',
    );
  }
}

module.exports = {
  createArrayReporterError,
  createReporterError,
  validateReporters,
};
