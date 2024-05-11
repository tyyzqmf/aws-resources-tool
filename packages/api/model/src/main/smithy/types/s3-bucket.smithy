$version: "2"
namespace com.aws

string Name
string Region

/// Defines the attribute of the Bucket 
structure BucketSummary {
    @required
    Name: Name
    @required
    Region: Region
    CreatedAt: Timestamp
}

structure BucketDeleteBody {
    @required
    Buckets: BucketSummaries
}

/// A collection of Bucket
list BucketSummaries {
    member: BucketSummary
}

