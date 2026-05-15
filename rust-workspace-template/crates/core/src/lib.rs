//! Core business logic.

pub mod error;

pub use error::{CoreError, CoreResult};

/// Returns a friendly greeting.
#[must_use]
pub fn hello(name: &str) -> String {
    let normalized = your_utils::normalize_name(name);
    format!("Hello, {normalized}!")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hello_trims_name() {
        assert_eq!(hello(" Zeus "), "Hello, Zeus!");
    }
}
