# Design Spec: RO-Crate Searchbar & Responsive Grid Dropdown Redesign

This specification outlines the redesign of the search component in the RO-Crate Preview Widget. The goal is to replace the simple, barren `@id`-only text filter with a powerful, recursive property-path query system and a modern, mobile-friendly card-grid UI.

---

## 1. Objectives

* **Recursive JSON-LD Search**: Search for terms in nested properties down to a depth of 3 on the fly.
* **Match Snippet Context**: Display the `@id` of the matched entity, along with the specific property path and value where the match was found.
* **Modern & Responsive UI**: Replace the plain list with a responsive grid of card components.
* **Mobile Friendly**: Grid dynamically scales from desktop columns (e.g., 2 or 3 columns) to a stacked list layout on mobile.
* **High Performance**: Perform efficient, shallow traversal filtering directly on the parsed JSON-LD dataset on-the-fly.

---

## 2. Search & Match Logic

We will implement a recursive matching algorithm on the fly as the user types.

### Algorithm Specification

For every entity `item` in `rocrate["@graph"]`:
1. Recursively traverse its keys up to a maximum depth of 3.
2. Ignore meta-properties and non-searchable keys (like `@context`, or object structures that are not actual data keys).
3. If a value is a string, number, or boolean:
   * Perform a case-insensitive check to see if the value contains the search query.
   * If yes, return a match object:
     ```typescript
     {
         matched: true,
         path: "property ➔ subProperty ➔ ...",
         value: "Matched value text content"
     }
     ```
4. If a value is an array:
   * Loop through each item in the array, keeping track of the indices if necessary or merging results.
   * Recursively match.
5. If a value is an object (nested dictionary):
   * Recursively traverse its keys and properties, adding key names to the path tracker.
6. For each matching entity, we collect the first or most relevant match to display.

---

## 3. UI/UX Interface Design

### Search Input Component
* Located alongside the Breadcrumb in the header.
* Features:
  * Sleek search icon on the left of the input field.
  * Clear button (×) on the right of the input, visible only when there is query text.
  * Teal border highlight (`#4CAF9C`) on focus, soft border, and drop shadow.

### Upgraded Grid Results Panel
* Positioned in place of the `HasPartDropdown` under the header when search results are active.
* **Responsive Layout**:
  * Desktop / Large Screens: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2`
  * Mobile Screens: 1-column layout automatically stacking items vertically.
* **Card Details**:
  * **Border & Shadows**: Styled as a clean card with a subtle hover zoom or elevation transition, and a border color shift to `#4CAF9C`.
  * **Primary Label**: Shows the entity's `@id` in a bold, prominent typeface. Uses text-wrapping helper CSS to handle long URIs gracefully.
  * **Entity Type Icon**: Renders an appropriate icon (from `react-icons`) based on the entity's `@type` (e.g., folder for `Dataset`, file for `File`, user/contacts for `Person`, tag for others).
  * **Match Details Section**:
    * Displays the matched property path (e.g., `creator ➔ name`) in a styled badge or muted subtitle.
    * Displays the matching snippet text with the matching query highlighted (using `<mark>` styling or teal-highlighted text).

---

## 4. Verification Plan

### Manual Verification
* Test searching for:
  * Top-level fields: `@id`, name, types.
  * Nested fields: `publisher ➔ name`, `author ➔ contactPoint ➔ email`.
* Verify that the responsive layout adapts properly across different viewport widths:
  * Desktop (>= 1024px) -> 3 columns.
  * Tablet (>= 768px) -> 2 columns.
  * Mobile (< 768px) -> 1 column.
* Verify keyboard navigation or click triggers selecting the correct `@id`.
