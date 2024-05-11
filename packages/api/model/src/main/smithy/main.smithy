$version: "2"
namespace com.aws

use aws.protocols#restJson1

/// My API
@restJson1
service MyApi {
    version: "1.0"
    operations: [
        GetShoppingLists
        PutShoppingList
        DeleteShoppingList
        GetBucketList
        DeleteBuckets
    ]
    errors: [
        BadRequestError
        NotAuthorizedError
        InternalFailureError
    ]
}
