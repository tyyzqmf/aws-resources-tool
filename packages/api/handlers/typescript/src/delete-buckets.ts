import {
  S3,
} from '@aws-sdk/client-s3';
import {
  deleteBucketsHandler,
  DeleteBucketsChainedHandlerFunction,
  INTERCEPTORS,
  Response,
  BucketDeleteBody,
  BucketSummary,
} from 'myapi-typescript-runtime';
import pLimit from 'p-limit';
import { logger } from './logger';

const promisePool = pLimit(10);

/**
 * Type-safe handler for the DeleteBuckets operation
 */
export const deleteBuckets: DeleteBucketsChainedHandlerFunction = async (request) => {
  logger.info('Start DeleteBuckets Operation');

  const body: BucketDeleteBody = request.input.body;
  logger.debug('BucketDeleteBody', { body });
  await batchDeleteBucket(body.buckets);
  return Response.success({
    code: 0,
    message: 'Success',
  });
};

/**
 * Entry point for the AWS Lambda handler for the DeleteBuckets operation.
 * The deleteBucketsHandler method wraps the type-safe handler and manages marshalling inputs and outputs
 */
export const handler = deleteBucketsHandler(...INTERCEPTORS, deleteBuckets);

export const batchDeleteBucket = async (buckets: BucketSummary[]) => {
  const results: any[] = [];
  const input = [];
  for (let bucket of buckets) {
    input.push(promisePool(() => {
      return deleteOneBucketForce(bucket.name, bucket.region).then(res => {
        results.push({
          bucket,
          success: true,
        });
      }).catch(err => {
        logger.warn('Failed to delete bucket', { bucket, err });
        results.push({
          bucket,
          success: false,
        });
      });
    }));
  }
  await Promise.all(input);
  return results;
};

export const deleteOneBucketForce = async (bucket: string, region: string) => {
  const s3Client = new S3({
    region,
  });
  try {
    const allObjects = await s3Client.listObjectsV2({
      Bucket: bucket,
    });
    for (let object of allObjects.Contents ?? []) {
      try {
        await s3Client.deleteObject({
          Bucket: bucket,
          Key: object.Key,
        });
      } catch (err) {
        console.warn(`Error deleting object: ${bucket}/${object.Key}`, { err });
      }
    }
    const allVersions = await s3Client.listObjectVersions({
      Bucket: bucket,
    });
    for (let version of allVersions.Versions ?? []) {
      try {
        await s3Client.deleteObject({
          Bucket: bucket,
          Key: version.Key,
          VersionId: version.VersionId,
        });
      } catch (err) {
        console.warn(`Error deleting object version: ${bucket}/${version.Key}/${version.VersionId}`, { err });
      }
    }
    for (let version of allVersions.DeleteMarkers ?? []) {
      try {
        await s3Client.deleteObject({
          Bucket: bucket,
          Key: version.Key,
          VersionId: version.VersionId,
        });
      } catch (err) {
        console.warn(`Error deleting object version: ${bucket}/${version.Key}/${version.VersionId}`, { err });
      }
    }
    await s3Client.deleteBucket({
      Bucket: bucket,
    });
  } catch (err) {
    console.error(`Error deleting bucket: ${bucket}`, { err });
    throw err;
  }
};
