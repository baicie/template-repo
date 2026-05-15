use assert_cmd::Command;
use predicates::str::contains;

#[test]
fn cli_hello_works() {
    let mut cmd = Command::cargo_bin("your").expect("binary exists");
    cmd.args(["hello", "Zeus"])
        .assert()
        .success()
        .stdout(contains("Hello, Zeus!"));
}
