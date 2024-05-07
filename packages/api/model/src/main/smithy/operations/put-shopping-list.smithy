$version: "2"
namespace com.aws

/// Handles upserting of a Shopping List
@http(method: "POST", uri: "/shopping-list")
@handler(language: "typescript")
operation PutShoppingList {
    input := with [ShoppingListMixin] {
        shoppingListId: ShoppingListId
    }
    output := with [ShoppingListIdMixin] {}
    errors: [BadRequestError]
}
