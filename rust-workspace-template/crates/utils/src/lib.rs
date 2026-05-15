//! Shared utility helpers.

/// Normalizes a display name.
#[must_use]
pub fn normalize_name(input: &str) -> String {
    let trimmed = input.trim();

    if trimmed.is_empty() {
        "world".to_string()
    } else {
        trimmed.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_name_falls_back_to_world() {
        assert_eq!(normalize_name("  "), "world");
    }
}
