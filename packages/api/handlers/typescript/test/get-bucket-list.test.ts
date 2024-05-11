import { S3Client, ListBucketsCommand, GetBucketLocationCommand } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import {
  GetBucketListChainedRequestInput,
  GetBucketListRequestParameters,
  GetBucketListResponseContent,
} from 'myapi-typescript-runtime';
import {
  getBucketList,
} from '../src/get-bucket-list';
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
} satisfies Omit<GetBucketListChainedRequestInput, 'input'>;

describe('GetBucketList', () => {
  beforeEach(() => {
    s3Client.reset();
  });
  it('should return bucket list', async () => {

    s3Client.on(ListBucketsCommand).resolves({
      Buckets: [
        {
          Name: 'EXAMPLE_BUCKET_1',
        },
        {
          Name: 'EXAMPLE_BUCKET_2',
        },
      ],
    });
    s3Client.on(GetBucketLocationCommand)
      .resolvesOnce({
        LocationConstraint: undefined,
      })
      .resolves({
        LocationConstraint: 'us-east-2',
      });
    const response = await getBucketList({
      ...requestArguments,
      input: {
        requestParameters: {} as GetBucketListRequestParameters,
        body: {} as never,
      },
    });
    const responseContent = response.body as GetBucketListResponseContent;
    expect(response.statusCode).toBe(200);
    expect(responseContent.items.length).toEqual(2);
    expect(responseContent.items[0].name).toEqual('EXAMPLE_BUCKET_1');
    expect(responseContent.items[0].region).toEqual('us-east-1');
    expect(responseContent.items[1].name).toEqual('EXAMPLE_BUCKET_2');
    expect(responseContent.items[1].region).toEqual('us-east-2');
  });

});

