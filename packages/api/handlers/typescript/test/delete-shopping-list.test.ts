import {
  DeleteShoppingListChainedRequestInput,
  DeleteShoppingListResponseContent,
  DeleteShoppingListRequestParameters,
} from 'myapi-typescript-runtime';
import {
  deleteShoppingList,
} from '../src/delete-shopping-list';
import { ddbClient } from '../src/dynamo-client';

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
} satisfies Omit<DeleteShoppingListChainedRequestInput, 'input'>;

jest.mock('../src/dynamo-client');

describe('DeleteShoppingList', () => {

  it('should delete an item', async () => {
    (ddbClient.send as jest.Mock).mockResolvedValue({ });

    const listToDelete = 'deleted';
    const response = await deleteShoppingList({
      ...requestArguments,
      input: {
        requestParameters: {
          shoppingListId: listToDelete,
        } as DeleteShoppingListRequestParameters,
        body: {} as never,
      },
    });

    expect(response.statusCode).toBe(200);
    expect((response.body as DeleteShoppingListResponseContent).shoppingListId).toEqual(listToDelete);
  });
});
