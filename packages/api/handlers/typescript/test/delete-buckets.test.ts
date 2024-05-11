import { DeleteBucketCommand, DeleteObjectCommand, ListObjectVersionsCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import {
  DeleteBucketsChainedRequestInput,
} from 'myapi-typescript-runtime';
import {
  deleteBuckets,
} from '../src/delete-buckets';
import 'aws-sdk-client-mock-jest';

const s3Client = mockClient(S3Client);

// Common request arguments
const requestArguments = {
  chain: undefined as never,
  event: {} as any,
  context: {} as any,
  interceptorContext: {
    logger: {
      info: jest.fn(),
    },
  },
} satisfies Omit<DeleteBucketsChainedRequestInput, 'input'>;

describe('DeleteBuckets', () => {
  beforeEach(() => {
    s3Client.reset();
  });

  it('should return delete success', async () => {

    s3Client.on(ListObjectsV2Command).resolves({
      Contents: [
        {
          Key: 'test-key-1',
        },
        {
          Key: 'test-key-2',
        },
      ],
    });
    s3Client.on(ListObjectVersionsCommand).resolves({
      Versions: [
        {
          Key: 'test-key-1',
          VersionId: 'test-version-id-1',
        },
        {
          Key: 'test-key-2',
          VersionId: 'test-version-id-2',
        },
      ],
      DeleteMarkers: [
        {
          Key: 'test-key-2',
          VersionId: 'test-version-id-3',
        },
      ],
    });
    s3Client.on(DeleteObjectCommand).resolves({});

    s3Client.on(DeleteBucketCommand).resolves({});

    const response = await deleteBuckets({
      ...requestArguments,
      input: {
        requestParameters: {} as any,
        body: {
          buckets: [
            {
              name: 'EXAMPLE_BUCKET_1',
              region: 'us-east-1',
            },
          ],
        } as any,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(s3Client).toHaveReceivedCommandTimes(ListObjectsV2Command, 1);
    expect(s3Client).toHaveReceivedCommandTimes(ListObjectVersionsCommand, 1);
    expect(s3Client).toHaveReceivedCommandTimes(DeleteObjectCommand, 5);
    expect(s3Client).toHaveReceivedCommandTimes(DeleteBucketCommand, 1);
  });

});

