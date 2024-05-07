$version: "2"
namespace com.aws

/// Handles fetching of Shopping List(s)
@readonly
@http(method: "GET", uri: "/shopping-list")
@paginated(inputToken: "nextToken", outputToken: "nextToken", pageSize: "pageSize", items: "shoppingLists")
@handler(language: "typescript")
operation GetShoppingLists {
    input := with [PaginatedInputMixin] {
        @httpQuery("shoppingListId")
        shoppingListId: ShoppingListId
    }
    output := with [PaginatedOutputMixin] {
        /// List of Shopping List
        @required
        shoppingLists: ShoppingLists
    }
}
