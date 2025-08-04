export type Verb =
  | "update"     // updating <filename>
  | "fix"        // making fixes in <filename>
  | "revert"     // reverting changes to <filename> 
  | "add"        // adding to <filename>
  | "create"     // creating content in <repo name>
  | "delete"     // deleting in <repo name>
  | "remove"     // removing content from <filename>
  | "change"     // making changes in <filename>
  | "refactor"   // refactoring <filename>
  | "merge"      // merging into <branch name>
  | "rename"     // renaming <filename> // if commit message has this, maybe look for file status with `rename`?
  | "improve"    // improving <filename>
  | "optimize"   // writing optimizations in <filename>
  | "enhance"    // enhancing in <filename> // REMOVE
  | "validate"   // REMOVE
  | "document"   // writing documentation in <filename>
  | "comment"    // writing comments in <filename>
  | "format"     // formatting <filename>
  | "configure"  // configuring <repo name>
  | "bump"       // bumping version // REMOVE
  | "lock"       // REMOVE
  | "initialize" // REMOVE
  | "test"       // writing tests in <file name>
  | "mock"       // 
  | "cherry"     // cherry picking
  | "squash"     // squashing commits
  | "tag";

export const knownVerbs: Record<string, Verb> = {
  "add": "add",
  "adds": "add",
  "added": "add",
  "adding": "add",

  "remove": "remove",
  "removes": "remove",
  "removed": "remove",
  "removing": "remove",

  "update": "update",
  "updates": "update",
  "updated": "update",
  "updating": "update",

  "fix": "fix",
  "fixes": "fix",
  "fixed": "fix",
  "fixing": "fix",

  "change": "change",
  "changes": "change",
  "changed": "change",
  "changing": "change",

  "refactor": "refactor",
  "refactors": "refactor",
  "refactored": "refactor",
  "refactoring": "refactor",

  "revert": "revert",
  "reverts": "revert",
  "reverted": "revert",
  "reverting": "revert",

  "merge": "merge",
  "merges": "merge",
  "merged": "merge",
  "merging": "merge",

  "rename": "rename",
  "renames": "rename",
  "renamed": "rename",
  "renaming": "rename",

  "improve": "improve",
  "improves": "improve",
  "improved": "improve",
  "improving": "improve",

  "optimize": "optimize",
  "optimizes": "optimize",
  "optimized": "optimize",
  "optimizing": "optimize",

  "enhance": "enhance",
  "enhances": "enhance",
  "enhanced": "enhance",
  "enhancing": "enhance",

  "document": "document",
  "documents": "document",
  "documented": "document",
  "documenting": "document",

  "comment": "comment",
  "comments": "comment",
  "commented": "comment",
  "commenting": "comment",

  "format": "format",
  "formats": "format",
  "formatted": "format",
  "formatting": "format",

  "configure": "configure",
  "configures": "configure",
  "configured": "configure",
  "configuring": "configure",

  "bump": "bump",
  "bumps": "bump",
  "bumped": "bump",
  "bumping": "bump",

  "lock": "lock",
  "locks": "lock",
  "locked": "lock",
  "locking": "lock",

  "initialize": "initialize",
  "initializes": "initialize",
  "initialized": "initialize",
  "initializing": "initialize",

  "test": "test",
  "tests": "test",
  "tested": "test",
  "testing": "test",

  "mock": "mock",
  "mocks": "mock",
  "mocked": "mock",
  "mocking": "mock",

  "validate": "validate",
  "validates": "validate",
  "validated": "validate",
  "validating": "validate",

  "cherry": "cherry",
  "cherry-picked": "cherry", // special case
  "cherry-pick": "cherry",

  "squash": "squash",
  "squashes": "squash",
  "squashed": "squash",
  "squashing": "squash",

  "tag": "tag",
  "tags": "tag",
  "tagged": "tag",
  "tagging": "tag",

  "create": "create",
  "creates": "create",
  "created": "create",
  "creating": "create",

  "delete": "delete",
  "deletes": "delete",
  "deleted": "delete",
  "deleting": "delete",
};

