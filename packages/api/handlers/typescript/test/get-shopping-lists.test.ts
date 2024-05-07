import {
  GetShoppingListsChainedRequestInput,
  GetShoppingListsRequestParameters,
  GetShoppingListsResponseContent,
} from 'myapi-typescript-runtime';
import { ddbClient } from '../src/dynamo-client';
import {
  getShoppingLists,
} from '../src/get-shopping-lists';

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
} satisfies Omit<GetShoppingListsChainedRequestInput, 'input'>;

jest.mock('../src/dynamo-client');

const SHOPPING_LIST_ITEMS = [{
  shoppingListId: { S: '1' },
  name: { S: '1' },
  shoppingItems: { S: '["a","b","c"]' },
}];

describe('GetShoppingLists', () => {
  it('should return an item', async () => {
    (ddbClient.send as jest.Mock).mockResolvedValue({ Items: SHOPPING_LIST_ITEMS });
    const response = await getShoppingLists({
      ...requestArguments,
      input: {
        requestParameters: {} as GetShoppingListsRequestParameters,
        body: {} as never,
      },
    });
    const responseContent = response.body as GetShoppingListsResponseContent;
    expect(response.statusCode).toBe(200);
    expect(responseContent.shoppingLists.length).toEqual(1);
    expect(responseContent.shoppingLists[0].name).toEqual(SHOPPING_LIST_ITEMS[0].name.S);
    expect(responseContent.shoppingLists[0].shoppingListId).toEqual(SHOPPING_LIST_ITEMS[0].shoppingListId.S);
    expect(responseContent.shoppingLists[0].shoppingItems).toEqual(JSON.parse(SHOPPING_LIST_ITEMS[0].shoppingItems.S));
  });
});
