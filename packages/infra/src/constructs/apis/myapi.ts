import { UserIdentity } from "@aws/pdk/identity";
import { Authorizers, Integrations } from "@aws/pdk/type-safe-api";
import { Stack } from "aws-cdk-lib";
import { Cors } from "aws-cdk-lib/aws-apigateway";
import {
  AccountPrincipal,
  AnyPrincipal,
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
} from "aws-cdk-lib/aws-iam";
import { Function } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import {
  Api,
  DeleteBucketsFunction,
  DeleteShoppingListFunction,
  GetBucketListFunction,
  GetShoppingListsFunction,
  PutShoppingListFunction,
} from "myapi-typescript-infra";
import { DatabaseConstruct } from "../database";

/**
 * Api construct props.
 */
export interface MyApiProps {
  /**
   * Instance of the UserIdentity.
   */
  readonly userIdentity: UserIdentity;

  /**
   * Instance of the DatabaseConstruct.
   */
  readonly databaseConstruct: DatabaseConstruct;
}

/**
 * Infrastructure construct to deploy a Type Safe API.
 */
export class MyApi extends Construct {
  /**
   * API instance
   */
  public readonly api: Api;

  constructor(scope: Construct, id: string, props?: MyApiProps) {
    super(scope, id);

    const putShoppingListFunction = new PutShoppingListFunction(
      this,
      "PutShoppingListFunction",
    );
    const deleteShoppingListFunction = new DeleteShoppingListFunction(
      this,
      "DeleteShoppingListFunction",
    );
    const getShoppingListsFunction = new GetShoppingListsFunction(
      this,
      "GetShoppingListsFunction",
    );
    const getBucketListFunction = new GetBucketListFunction(
      this,
      "GetBucketListFunction",
    );
    const deleteBucketsFunction = new DeleteBucketsFunction(
      this,
      "DeleteBucketsFunction",
    );

    this.api = new Api(this, id, {
      defaultAuthorizer: Authorizers.iam(),
      corsOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
      integrations: {
        putShoppingList: {
          integration: Integrations.lambda(putShoppingListFunction),
        },
        deleteShoppingList: {
          integration: Integrations.lambda(deleteShoppingListFunction),
        },
        getShoppingLists: {
          integration: Integrations.lambda(getShoppingListsFunction),
        },
        getBucketList: {
          integration: Integrations.lambda(getBucketListFunction),
        },
        deleteBuckets: {
          integration: Integrations.lambda(deleteBucketsFunction),
        },
      },
      policy: new PolicyDocument({
        statements: [
          // Here we grant any AWS credentials from the account that the prototype is deployed in to call the api.
          // Machine to machine fine-grained access can be defined here using more specific principals (eg roles or
          // users) and resources (ie which api paths may be invoked by which principal) if required.
          // If doing so, the cognito identity pool authenticated role must still be granted access for cognito users to
          // still be granted access to the API.
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [new AccountPrincipal(Stack.of(this).account)],
            actions: ["execute-api:Invoke"],
            resources: ["execute-api:/*"],
          }),
          // Open up OPTIONS to allow browsers to make unauthenticated preflight requests
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [new AnyPrincipal()],
            actions: ["execute-api:Invoke"],
            resources: ["execute-api:/*/OPTIONS/*"],
          }),
        ],
      }),
    });

    // Grant our lambda functions scoped access to call Dynamo
    props?.databaseConstruct.shoppingListTable.grantReadData(
      getShoppingListsFunction,
    );
    [putShoppingListFunction, deleteShoppingListFunction].forEach((f) =>
      props?.databaseConstruct.shoppingListTable.grantWriteData(f),
    );

    // Grant authenticated users access to invoke the api
    props?.userIdentity.identityPool.authenticatedRole.addToPrincipalPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["execute-api:Invoke"],
        resources: [this.api.api.arnForExecuteApi("*", "/*", "*")],
      }),
    );

    // Grant the lambda functions access to call S3
    this._grantS3BucketAccessToGetBucketsFunction(getBucketListFunction);
    this._grantS3BucketAccessToDeleteBucketsFunction(deleteBucketsFunction);
  }

  private _grantS3BucketAccessToGetBucketsFunction(fn: Function) {
    if (fn.role) {
      const ps = new PolicyStatement({
        actions: ["s3:ListAllMyBuckets", "s3:GetBucketLocation"],
        resources: ["*"],
      });
      (fn.role as Role).addToPolicy(ps);
    }
  }

  private _grantS3BucketAccessToDeleteBucketsFunction(fn: Function) {
    if (fn.role) {
      const ps = new PolicyStatement({
        actions: [
          "s3:ListBucket",
          "s3:ListBucketVersions",
          "s3:DeleteObject",
          "s3:DeleteBucket",
          "s3:DeleteObjectVersion",
        ],
        resources: ["*"],
      });
      (fn.role as Role).addToPolicy(ps);
    }
  }
}
