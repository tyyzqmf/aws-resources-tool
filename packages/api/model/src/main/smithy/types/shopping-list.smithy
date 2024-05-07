$version: "2"
namespace com.aws

/// Identifier for a Shopping List
string ShoppingListId

/// A Shopping Item is just a string literal
string ShoppingItem

/// Defines the id attribute of the Shopping List
@mixin
structure ShoppingListIdMixin {
    @required
    shoppingListId: ShoppingListId
}

/// Defines the core attributes of a Shopping List
@mixin
structure ShoppingListMixin {
    @required
    name: String

    shoppingItems: ShoppingItems
}

/// A Shopping List is a union of these Mixins
structure ShoppingList with [ShoppingListIdMixin, ShoppingListMixin] {}

/// A collection of Shopping List
list ShoppingLists {
    member: ShoppingList
}

/// A collection of items within a Shopping List
list ShoppingItems {
    member: ShoppingItem
}
