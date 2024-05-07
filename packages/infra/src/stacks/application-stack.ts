import { UserIdentity } from "@aws/pdk/identity";
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { MyApi } from "../constructs/apis/myapi";
import { DatabaseConstruct } from "../constructs/database";
import { Website } from "../constructs/websites/website";

export class ApplicationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const userIdentity = new UserIdentity(this, `${id}UserIdentity`);
    const databaseConstruct = new DatabaseConstruct(this, "Database");
    const myapi = new MyApi(this, "MyApi", {
      databaseConstruct,
      userIdentity,
    });
    new Website(this, "Website", {
      userIdentity,
      myapi,
    });
  }
}
