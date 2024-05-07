import { randomUUID } from 'crypto';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import {
  putShoppingListHandler,
  PutShoppingListChainedHandlerFunction,
  INTERCEPTORS,
  Response,
  LoggingInterceptor,
} from 'myapi-typescript-runtime';
import { ddbClient } from './dynamo-client';

/**
 * Type-safe handler for the PutShoppingList operation
 */
export const putShoppingList: PutShoppingListChainedHandlerFunction = async (request) => {
  LoggingInterceptor.getLogger(request).info('Start PutShoppingList Operation');

  const shoppingListId = request.input.body.shoppingListId ?? randomUUID();
  await ddbClient.send(new PutItemCommand({
    TableName: 'shopping_list',
    Item: {
      shoppingListId: {
        S: shoppingListId,
      },
      name: {
        S: request.input.body.name,
      },
      shoppingItems: {
        S: JSON.stringify(request.input.body.shoppingItems || []),
      },
    },
  }));

  return Response.success({
    shoppingListId,
  });
};

/**
 * Entry point for the AWS Lambda handler for the PutShoppingList operation.
 * The putShoppingListHandler method wraps the type-safe handler and manages marshalling inputs and outputs
 */
export const handler = putShoppingListHandler(...INTERCEPTORS, putShoppingList);
