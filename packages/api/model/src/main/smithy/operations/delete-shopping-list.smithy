$version: "2"
namespace com.aws

/// Handles deletion of a Shopping List
@http(method: "DELETE", uri: "/shopping-list/{shoppingListId}")
@handler(language: "typescript")
operation DeleteShoppingList {
    input := {
        @required
        @httpLabel
        shoppingListId: ShoppingListId
    }
    output := with [ShoppingListIdMixin] {}
    errors: [NotFoundError]
}
