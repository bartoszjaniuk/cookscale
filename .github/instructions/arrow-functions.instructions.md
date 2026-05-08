---
name: Arrow Functions
description: Use when writing or refactoring TypeScript/JavaScript functions. Enforces arrow function style — const declarations, implicit returns for single expressions, and named export exception.
applyTo: "**/*.{ts,tsx}"
---

# Arrow Function Style

Always prefer arrow functions over `function` declarations.

## Rules

- Declare with `const`: `const myFn = () => {}`
- Single-expression body: omit braces and `return`
- `function` keyword is **only** acceptable for named exports

## Examples

```ts
// ✅ Regular function
const greet = (name: string) => `Hello, ${name}`;

// ✅ Multi-statement body
const process = (x: number) => {
  const result = x * 2;
  return result + 1;
};

// ✅ Named export exception
export function useMyHook() { ... }
export function MyComponent() { ... }

// ❌ Avoid
function greet(name: string) { return `Hello, ${name}`; }
const greet = (name: string) => { return `Hello, ${name}`; }; // single expression — drop braces
```
