
import { Logger } from '@aws-lambda-powertools/logger';

const defaultValues = {
  region: process.env.AWS_REGION ?? 'N/A',
  executionEnv: process.env.AWS_EXECUTION_ENV ?? 'N/A',
};

const logger = new Logger({
  serviceName: 'myapi',
  sampleRateValue: 1,
  persistentLogAttributes: {
    ...defaultValues,
  },
});

export {
  logger,
};