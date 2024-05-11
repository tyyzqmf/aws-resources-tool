$version: "2"
namespace com.aws

/// Handles deletion of a Bucket
@http(method: "POST", uri: "/bucket")
@handler(language: "typescript")
operation DeleteBuckets {
    input := {
        @required
        @httpPayload
        body: BucketDeleteBody
    }
    output := with [BaseResponseOutputMixin] {}
    errors: [NotFoundError]
}
