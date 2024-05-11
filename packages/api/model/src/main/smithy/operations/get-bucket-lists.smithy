$version: "2"
namespace com.aws

/// Handles fetching of Bucket List(s)
@readonly
@http(method: "GET", uri: "/buckets")
@paginated(inputToken: "nextToken", outputToken: "nextToken", pageSize: "pageSize", items: "items")
@handler(language: "typescript")
operation GetBucketList {
    input := with [PaginatedInputMixin] {
    }
    output := with [BaseResponseOutputMixin, PaginatedOutputMixin] {
        @required
        items: BucketSummaries
    }
}
