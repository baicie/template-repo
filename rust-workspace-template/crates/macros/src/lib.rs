//! Optional procedural macro crate.
//!
//! Keep this crate only if your project needs proc macros.
//! Remove it from the workspace otherwise.

use proc_macro::TokenStream;

/// A no-op attribute macro useful as a placeholder.
#[proc_macro_attribute]
pub fn marker(_attr: TokenStream, item: TokenStream) -> TokenStream {
    item
}
