import {
  S3,
} from '@aws-sdk/client-s3';
import {
  getBucketListHandler,
  GetBucketListChainedHandlerFunction,
  INTERCEPTORS,
  Response,
  BucketSummary,
} from 'myapi-typescript-runtime';
import pLimit from 'p-limit';
import { logger } from './logger';

const promisePool = pLimit(50);
/**
 * Type-safe handler for the GetBucketList operation
 */
export const getBucketList: GetBucketListChainedHandlerFunction = async (request) => {
  logger.info('Start GetBucketList Operation');

  const nextToken = request.input.requestParameters.nextToken;
  const pageSize = request.input.requestParameters.pageSize;

  logger.debug('nextToken, pageSize', { nextToken, pageSize });

  const buckets = await listBucket();
  return Response.success({
    code: 0,
    message: 'Success',
    items: buckets,
    nextToken: undefined,
  });
};

/**
 * Entry point for the AWS Lambda handler for the GetBucketList operation.
 * The getBucketListHandler method wraps the type-safe handler and manages marshalling inputs and outputs
 */
export const handler = getBucketListHandler(...INTERCEPTORS, getBucketList);

export const listBucket = async () => {
  const s3Client = new S3();
  const result = await s3Client.listBuckets();
  const buckets = (result.Buckets ?? [])
    .map<BucketSummary>(item => ({
    name: item.Name ?? '',
    region: 'us-east-1',
    createdAt: item.CreationDate?.getTime() ?? 0,
  }));
  const bucketsWithRegion = await patchBucketRegion(buckets);
  return bucketsWithRegion;
};

export const patchBucketRegion = async (buckets: BucketSummary[]) => {
  const s3Client = new S3();
  const input = [];
  const results: BucketSummary[] = [];
  for (let bucket of buckets) {
    input.push(promisePool(() => {
      return s3Client.getBucketLocation({
        Bucket: bucket.name,
      }).then(res => {
        results.push({
          ...bucket,
          region: res.LocationConstraint ?? 'us-east-1',
        });
      }).catch(err => {
        logger.warn(`Failed to get region for bucket ${bucket.name}`, { err });
      });
    }));
  }
  await Promise.all(input);
  return results;
};
