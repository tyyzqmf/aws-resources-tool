import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

/**
 * Database construct to deploy a DynamoDB table.
 */
export class DatabaseConstruct extends Construct {
  public readonly shoppingListTable: Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.shoppingListTable = new Table(this, "ShoppingList", {
      partitionKey: {
        name: "shoppingListId",
        type: AttributeType.STRING,
      },
      tableName: "shopping_list",
    });
  }
}
