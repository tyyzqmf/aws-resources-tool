import {
  PutShoppingListChainedRequestInput,
  PutShoppingListRequestParameters,
  PutShoppingListResponseContent,
} from 'myapi-typescript-runtime';
import { ddbClient } from '../src/dynamo-client';
import {
  putShoppingList,
} from '../src/put-shopping-list';

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
} satisfies Omit<PutShoppingListChainedRequestInput, 'input'>;

jest.mock('../src/dynamo-client');

describe('PutShoppingList', () => {
  it('should put an item', async () => {
    (ddbClient.send as jest.Mock).mockResolvedValue({ });
    const response = await putShoppingList({
      ...requestArguments,
      input: {
        requestParameters: {} as PutShoppingListRequestParameters,
        body: {} as any,
      },
    });

    expect(response.statusCode).toBe(200);
    expect((response.body as PutShoppingListResponseContent).shoppingListId).toBeDefined();
  });
});
