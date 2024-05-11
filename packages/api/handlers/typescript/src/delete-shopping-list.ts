import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import {
  deleteShoppingListHandler,
  DeleteShoppingListChainedHandlerFunction,
  INTERCEPTORS,
  Response,
  LoggingInterceptor,
} from 'myapi-typescript-runtime';
import { ddbClient } from './dynamo-client';

/**
 * Type-safe handler for the DeleteShoppingList operation
 */
export const deleteShoppingList: DeleteShoppingListChainedHandlerFunction = async (request) => {
  LoggingInterceptor.getLogger(request).info(
    'Start DeleteShoppingList Operation',
  );

  const shoppingListId = request.input.requestParameters.shoppingListId;
  await ddbClient.send(
    new DeleteItemCommand({
      TableName: 'shopping_list',
      Key: {
        shoppingListId: {
          S: shoppingListId,
        },
      },
    }),
  );

  return Response.success({
    shoppingListId,
  });
};

/**
 * Entry point for the AWS Lambda handler for the DeleteShoppingList operation.
 * The deleteShoppingListHandler method wraps the type-safe handler and manages marshalling inputs and outputs
 */
export const handler = deleteShoppingListHandler(
  ...INTERCEPTORS,
  deleteShoppingList,
);
