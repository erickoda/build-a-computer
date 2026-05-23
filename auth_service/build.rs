fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_prost_build::compile_protos("../proto/auth/auth.proto")?;
    tonic_prost_build::compile_protos("../proto/user/user.proto")?;
    Ok(())
}
