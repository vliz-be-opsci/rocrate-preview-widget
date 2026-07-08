# RO-Crate Searchbar & Responsive Grid Dropdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the search functionality of the RO-Crate Preview Widget to perform deep recursive property-path matches on-the-fly, displaying search results in an upgraded, responsive grid card UI featuring icons and highlighted matching path snippets.

**Architecture:** 
1. Create a modular, test-driven utility function `searchRoCrate` in a new file `src/utils/searchUtils.ts` that traverses the `@graph` array entities recursively to depth 3 and returns matching objects with path/value metadata.
2. Update `SearchComponent` input UI, adding search and clear icons/buttons and improving styling.
3. Update `SearchDropdown` (and its integration in `MainContainer`) to receive structured search results and render them in a responsive, beautifully styled card grid where each card presents the entity `@id`, matching type icon, matched path badge, and highlighted snippet.

**Tech Stack:** React, TypeScript, Tailwind CSS, Jest, `react-icons/fa`, `react-icons/ai`

## Global Constraints
- Target files and paths must be exact.
- Implement strictly via Test-Driven Development (TDD) for new utility code.
- Verify each step passes existing and new tests before moving to the next.

---

### Task 1: Create Search Utility Logic (TDD)

**Files:**
- Create: `src/utils/searchUtils.ts`
- Create: `src/utils/searchUtils.test.ts`

**Interfaces:**
- Produces: 
  ```typescript
  export interface SearchMatch {
      item: any;
      matchedPath: string;
      matchedValue: string;
  }
  export function searchRoCrate(rocrate: any, query: string): SearchMatch[];
  ```

- [ ] **Step 1: Write the failing test**
  Create `src/utils/searchUtils.test.ts` with tests for basic matches, nested matches (up to depth 3), and ignoring `@context`.
  ```typescript
  import { searchRoCrate } from './searchUtils';

  describe('searchRoCrate', () => {
      const mockCrate = {
          "@graph": [
              {
                  "@id": "./",
                  "@type": "Dataset",
                  "name": "My RO-Crate Dataset",
                  "publisher": {
                      "@id": "https://example.com/publisher",
                      "name": "Data Publishing Org"
                  }
              },
              {
                  "@id": "file.txt",
                  "@type": "File",
                  "description": "Simple text file",
                  "author": {
                      "contactPoint": {
                          "email": "author@example.com"
                      }
                  }
              }
          ]
      };

      test('finds top-level matches', () => {
          const results = searchRoCrate(mockCrate, "Dataset");
          expect(results.length).toBe(1);
          expect(results[0].item["@id"]).toBe("./");
          expect(results[0].matchedPath).toBe("@type");
          expect(results[0].matchedValue).toBe("Dataset");
      });

      test('finds nested matches up to depth 3', () => {
          const results = searchRoCrate(mockCrate, "author@example.com");
          expect(results.length).toBe(1);
          expect(results[0].item["@id"]).toBe("file.txt");
          expect(results[0].matchedPath).toBe("author ➔ contactPoint ➔ email");
          expect(results[0].matchedValue).toBe("author@example.com");
      });

      test('ignores @context metadata key', () => {
          const crateWithContext = {
              "@context": "https://w3id.org/ro/crate/1.1/context",
              "@graph": [
                  {
                      "@id": "file.txt",
                      "name": "Special file"
                  }
              ]
          };
          const results = searchRoCrate(crateWithContext, "w3id.org");
          expect(results.length).toBe(0);
      });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `npm run test -- src/utils/searchUtils.test.ts --watchAll=false`
  Expected: FAIL with "Cannot find module './searchUtils'"

- [ ] **Step 3: Write minimal implementation**
  Create `src/utils/searchUtils.ts` with the minimal recursive search logic.
  ```typescript
  export interface SearchMatch {
      item: any;
      matchedPath: string;
      matchedValue: string;
  }

  export function searchRoCrate(rocrate: any, query: string): SearchMatch[] {
      const cleanQuery = query.toLowerCase().trim();
      if (!cleanQuery || !rocrate || !Array.isArray(rocrate["@graph"])) {
          return [];
      }

      const results: SearchMatch[] = [];

      function traverse(val: any, currentPath: string[], depth: number): { path: string; value: string } | null {
          if (depth > 3) return null;
          if (val === null || val === undefined) return null;

          if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
              const strVal = String(val);
              if (strVal.toLowerCase().includes(cleanQuery)) {
                  return {
                      path: currentPath.join(" ➔ "),
                      value: strVal
                  };
              }
              return null;
          }

          if (Array.isArray(val)) {
              for (let i = 0; i < val.length; i++) {
                  const res = traverse(val[i], currentPath, depth + 1);
                  if (res) return res;
              }
              return null;
          }

          if (typeof val === 'object') {
              for (const key of Object.keys(val)) {
                  if (key === '@context') continue;
                  const res = traverse(val[key], [...currentPath, key], depth + 1);
                  if (res) return res;
              }
              return null;
          }

          return null;
      }

      for (const item of rocrate["@graph"]) {
          for (const key of Object.keys(item)) {
              if (key === '@context') continue;
              const res = traverse(item[key], [key], 1);
              if (res) {
                  results.push({
                      item,
                      matchedPath: res.path,
                      matchedValue: res.value
                  });
                  break;
              }
          }
      }

      return results;
  }
  ```

- [ ] **Step 4: Run test to verify it passes**
  Run: `npm run test -- src/utils/searchUtils.test.ts --watchAll=false`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/utils/searchUtils.ts src/utils/searchUtils.test.ts
  git commit -m "feat: add recursive ro-crate search utility with tests"
  ```

---

### Task 2: Redesign Search Input UI

**Files:**
- Modify: `src/components/main_container/SearchComponent.tsx`

**Interfaces:**
- Consumes: `searchRoCrate` from `src/utils/searchUtils.ts`
- Produces: Updates the `onResults` callback parameter from `any[]` to `SearchMatch[]` containing item, matchedPath, and matchedValue.

- [ ] **Step 1: Write failing/visual test or verify component contract change**
  Modify tests (if any exist for `SearchComponent`) or inspect the file. Let's make sure the component handles imports correctly. We will rewrite the input field to include:
  * Search icon: `FaSearch` or `AiOutlineSearch`.
  * Clear button: a close icon or "×" button when `searchText` is not empty.
  * Teal focus border (`focus:border-[#4CAF9C]`), rounded-lg padding, and soft shadow.

- [ ] **Step 2: Update SearchComponent.tsx**
  Let's replace the existing input with the modern visual input:
  ```tsx
  import * as React from "react";
  import { useState, useRef, useEffect } from "react";
  import { FaSearch, FaTimes } from "react-icons/fa";
  import { searchRoCrate, SearchMatch } from "../../utils/searchUtils";

  interface SearchComponentProps {
      rocrate: any;
      onSelect: (id: string) => void;
      onClose: () => void;
      onFocus: () => void;
      onResults: (results: SearchMatch[]) => void;
  }

  export default function SearchComponent({ rocrate, onSelect, onFocus, onResults, onClose }: SearchComponentProps) {
      const [searchText, setSearchText] = useState("");
      const searchRef = useRef<HTMLDivElement>(null);

      const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
          const text = event.target.value;
          setSearchText(text);
          if (text) {
              const matchedResults = searchRoCrate(rocrate, text);
              onResults(matchedResults);
          } else {
              onResults([]);
          }
      };

      const handleClear = () => {
          setSearchText("");
          onResults([]);
          onClose();
      };

      const handleClickOutside = (event: MouseEvent) => {
          if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
              setSearchText("");
              onResults([]);
              onClose();
          }
      };

      useEffect(() => {
          document.addEventListener("mousedown", handleClickOutside);
          return () => {
              document.removeEventListener("mousedown", handleClickOutside);
          };
      }, []);

      return (
          <div ref={searchRef} className="relative w-full sm:w-80">
              <div className="relative flex items-center">
                  <span className="absolute left-3 text-gray-400">
                      <FaSearch size={14} />
                  </span>
                  <input
                      type="text"
                      value={searchText}
                      onChange={handleSearch}
                      onFocus={onFocus}
                      placeholder="Search entities, properties..."
                      className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-[#4CAF9C] focus:ring-1 focus:ring-[#4CAF9C] transition-all text-sm"
                  />
                  {searchText && (
                      <button
                          onClick={handleClear}
                          className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                          <FaTimes size={14} />
                      </button>
                  )}
              </div>
          </div>
      );
  }
  ```

- [ ] **Step 3: Run project tests**
  Run: `npm run test -- --watchAll=false`
  Expected: PASS

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/main_container/SearchComponent.tsx
  git commit -m "feat: upgrade SearchComponent UI with icons, clear button, and recursive search integration"
  ```

---

### Task 3: Redesign Search Results Grid

**Files:**
- Modify: `src/components/main_container/SearchDropdown.tsx`
- Modify: `src/components/main_container/MainContainer.tsx:179-183`

**Interfaces:**
- Consumes: `SearchMatch[]` from `SearchComponent`
- Produces: Interactive grid card triggers `onSelect(item["@id"])` when clicked.

- [ ] **Step 1: Update SearchDropdown.tsx to accept `SearchMatch[]`**
  Modify `SearchDropdown.tsx` to map through search match results, display entity details (type, id, matching path with highlighted text).
  ```tsx
  import * as React from "react";
  import { FaFolder, FaFile, FaUser, FaInfoCircle, FaTag } from "react-icons/fa";
  import { SearchMatch } from "../../utils/searchUtils";

  interface SearchDropdownProps {
      results: SearchMatch[];
      onSelect: (id: string) => void;
  }

  export default function SearchDropdown({ results, onSelect }: SearchDropdownProps) {
      const getIcon = (type: any) => {
          const types = Array.isArray(type) ? type : [type];
          if (types.includes("Dataset")) {
              return <FaFolder className="text-[#4CAF9C] text-lg mr-2 flex-shrink-0" />;
          }
          if (types.includes("File")) {
              return <FaFile className="text-blue-500 text-lg mr-2 flex-shrink-0" />;
          }
          if (types.includes("Person") || types.includes("Organization")) {
              return <FaUser className="text-orange-500 text-lg mr-2 flex-shrink-0" />;
          }
          return <FaTag className="text-purple-500 text-lg mr-2 flex-shrink-0" />;
      };

      const highlightText = (text: string, highlight: string) => {
          if (!highlight.trim()) return <span>{text}</span>;
          const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
          const parts = text.split(regex);
          return (
              <span>
                  {parts.map((part, index) => 
                      regex.test(part) ? (
                          <mark key={index} className="bg-yellow-100 text-teal-800 font-semibold rounded px-0.5">
                              {part}
                          </mark>
                      ) : (
                          part
                      )
                  )}
              </span>
          );
      };

      // Retrieve highlight query text if results exist
      // We can infer the search query term from the matched values or path matches
      // But keeping it generic by highlighting standard match values
      if (results.length === 0) {
          return (
              <div className="w-full text-center p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <FaInfoCircle className="mx-auto text-gray-400 text-3xl mb-2" />
                  <p className="text-gray-500 font-medium">No results found matching your search.</p>
              </div>
          );
      }

      return (
          <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 mt-2">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 px-1">
                  Search Results ({results.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map((match, index) => {
                      const item = match.item;
                      const type = item["@type"] || "Unknown";
                      return (
                          <div
                              key={index}
                              onClick={() => onSelect(item["@id"])}
                              className="bg-white border border-gray-200 hover:border-[#4CAF9C] rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between"
                          >
                              <div>
                                  <div className="flex items-center mb-2">
                                      {getIcon(type)}
                                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                          {Array.isArray(type) ? type.join(", ") : type}
                                      </span>
                                  </div>
                                  <h4 
                                      className="font-bold text-gray-800 text-sm mb-3 break-all line-clamp-2" 
                                      title={item["@id"]}
                                  >
                                      {item["@id"]}
                                  </h4>
                              </div>
                              <div className="mt-auto border-t border-gray-100 pt-2">
                                  <div className="flex items-center mb-1">
                                      <span className="text-[10px] font-semibold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100 break-all">
                                          {match.matchedPath}
                                      </span>
                                  </div>
                                  <p className="text-xs text-gray-600 italic break-all line-clamp-2">
                                      {match.matchedValue}
                                  </p>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      );
  }
  ```

- [ ] **Step 2: Update MainContainer.tsx component layout**
  Update the rendering of `SearchDropdown` in `src/components/main_container/MainContainer.tsx`.
  Line range: 179-183.
  Currently:
  ```tsx
  {showSearchResults ? (
      <SearchDropdown rocrate={{ "@graph": searchResults }} onSelect={handleSelect} />
  ) : (
      <HasPartDropdown rocrate={rocrate} rocrateID={rocrateID} onSelect={handleSelect} />
  )}
  ```
  Change to:
  ```tsx
  {showSearchResults ? (
      <SearchDropdown results={searchResults} onSelect={handleSelect} />
  ) : (
      <HasPartDropdown rocrate={rocrate} rocrateID={rocrateID} onSelect={handleSelect} />
  )}
  ```
  Also update `searchResults` state type if needed or keep it simple: `const [searchResults, setSearchResults] = useState<any[]>([]);` is fine, we just feed it to `results` prop.

- [ ] **Step 3: Run all unit and build tests**
  Run: `npm run build`
  Expected: Success

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/main_container/SearchDropdown.tsx src/components/main_container/MainContainer.tsx
  git commit -m "feat: redesign SearchDropdown results grid UI and integrate with MainContainer"
  ```
