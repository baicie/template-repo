//! Error definitions for the core crate.

/// Result type used by the core crate.
pub type CoreResult<T> = Result<T, CoreError>;

/// Errors returned by the core crate.
#[derive(Debug, thiserror::Error)]
pub enum CoreError {
    /// Input was invalid.
    #[error("invalid input: {0}")]
    InvalidInput(String),
}
