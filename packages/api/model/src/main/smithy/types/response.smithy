$version: "2"

namespace com.aws

@mixin
structure BaseResponseOutputMixin {
    @required
    code: Integer
    @required
    message: String
}
