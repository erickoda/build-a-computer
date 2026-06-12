fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_prost_build::configure()
        .protoc_arg("--experimental_allow_proto3_optional")
        .compile_protos(
            &[
                "../proto/auth/auth.proto",
                "../proto/user/user.proto",
                "../proto/recommendation/game.proto",
                "../proto/recommendation/builder.proto",
                "../proto/recommendation/benchmark.proto",
            ],
            &["../proto", "../proto/recommendation"],
        )?;

    Ok(())
}
