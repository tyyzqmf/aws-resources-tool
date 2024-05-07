import { DynamoDBClient, QueryCommand, QueryCommandInput, ScanCommand, ScanCommandInput } from '@aws-sdk/client-dynamodb';
import {
  getShoppingListsHandler,
  GetShoppingListsChainedHandlerFunction,
  INTERCEPTORS,
  Response,
  LoggingInterceptor,
  ShoppingList,
} from 'myapi-typescript-runtime';
import { ddbClient } from './dynamo-client';

/**
 * Type-safe handler for the GetShoppingLists operation
 */
export const getShoppingLists: GetShoppingListsChainedHandlerFunction = async (request) => {
  LoggingInterceptor.getLogger(request).info('Start GetShoppingLists Operation');

  const nextToken = request.input.requestParameters.nextToken;
  const pageSize = request.input.requestParameters.pageSize;
  const shoppingListId = request.input.requestParameters.shoppingListId;
  const commandInput: ScanCommandInput | QueryCommandInput = {
    TableName: 'shopping_list',
    ConsistentRead: true,
    Limit: pageSize,
    ExclusiveStartKey: nextToken ? fromToken(nextToken) : undefined,
    ...(shoppingListId ? {
      KeyConditionExpression: 'shoppingListId = :shoppingListId',
      ExpressionAttributeValues: {
        ':shoppingListId': {
          S: request.input.requestParameters.shoppingListId!,
        },
      },
    } : {}),
  };
  const response = await ddbClient.send(shoppingListId ? new QueryCommand(commandInput) : new ScanCommand(commandInput));

  return Response.success({
    shoppingLists: (response.Items || [])
      .map<ShoppingList>(item => ({
      shoppingListId: item.shoppingListId.S!,
      name: item.name.S!,
      shoppingItems: JSON.parse(item.shoppingItems.S || '[]'),
    })),
    nextToken: response.LastEvaluatedKey ? toToken(response.LastEvaluatedKey) : undefined,
  });
};

/**
 * Decode a stringified token
 * @param token a token passed to the paginated request
 */
const fromToken = <T>(token?: string): T | undefined =>
  token ? (JSON.parse(Buffer.from(decodeURIComponent(token), 'base64').toString()) as T) : undefined;

/**
 * Encode pagination details into an opaque stringified token
 * @param paginationToken pagination token details
 */
const toToken = <T>(paginationToken?: T): string | undefined =>
  paginationToken ? encodeURIComponent(Buffer.from(JSON.stringify(paginationToken)).toString('base64')) : undefined;

/**
 * Entry point for the AWS Lambda handler for the GetShoppingLists operation.
 * The getShoppingListsHandler method wraps the type-safe handler and manages marshalling inputs and outputs
 */
export const handler = getShoppingListsHandler(...INTERCEPTORS, getShoppingLists);
