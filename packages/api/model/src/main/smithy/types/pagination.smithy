$version: "2"

namespace com.aws

/// Extends inputs for "list" type operations to accept pagination details
@mixin
structure PaginatedInputMixin {
    /// A token for an additional page of results
    @httpQuery("nextToken")
    nextToken: String

    /// The number of results to return in a page
    @httpQuery("pageSize")
    pageSize: Integer
}

/// Extends outputs for "list" type operations to return pagination details
@mixin
structure PaginatedOutputMixin {
    /// Pass this in the next request for another page of results
    nextToken: String
}
