# Drizzle Schema Import Approaches for Monorepo (Without Shared Packages)

This document outlines different approaches to import Drizzle schemas from your backend into your frontend without using shared packages.

## Approach 1: TypeScript Path Mapping (Recommended) ✅

### Setup

1. **Configure TypeScript paths in `apps/web/tsconfig.json`:**

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@server/*": ["../server/src/*"]
    }
  },
  "references": [{ "path": "../server" }]
}
```

2. **Create type definitions (`apps/web/src/types/schema.ts`):**

```typescript
// Define types based on the backend schema structure
export type MessageRole = "user" | "assistant";
export type MessageType = "result" | "error";

export interface Message {
  id: number;
  content: string;
  role: MessageRole;
  type: MessageType;
  createdAt: string;
  updatedAt: string;
  fragmentId: number | null;
  projectId: number;
}

export interface Fragment {
  id: number;
  messageId: number;
  sandboxUrl: string | null;
  title: string | null;
  files: unknown; // JSON field
  createdAt: string;
  updatedAt: string;
}

// ... more interfaces
```

3. **Use in components:**

```typescript
import type {
  Message,
  Fragment,
  MessageType,
  MessageRole,
} from "@/types/schema";

interface MessageCardProps {
  content: string;
  role: MessageRole;
  fragment: Fragment | null | undefined;
  type: MessageType;
  // ...
}
```

## Approach 2: Direct Import (Alternative)

If you want to import directly from backend schemas:

```typescript
// This requires the @server/* path mapping
import type { MessageType, MessageRole } from "@server/db/schema/agent";

// For table schemas, you might need to handle Drizzle types differently
// since they have runtime dependencies
```

## Approach 3: Code Generation

You could create a build script that generates TypeScript types from your Drizzle schemas:

```javascript
// scripts/generate-types.js
const fs = require("fs");
const path = require("path");

// Read schema files and generate corresponding TypeScript interfaces
// This ensures type safety and reduces manual maintenance
```

## Benefits of Each Approach

### Approach 1 (Manual Type Definitions):

- ✅ No runtime dependencies
- ✅ Full control over frontend types
- ✅ Can add frontend-specific properties
- ❌ Manual maintenance required
- ❌ Could drift from backend schema

### Approach 2 (Direct Import):

- ✅ Always in sync with backend
- ✅ Less maintenance
- ❌ Brings Drizzle dependencies to frontend
- ❌ More complex build setup

### Approach 3 (Code Generation):

- ✅ Always in sync with backend
- ✅ No runtime dependencies
- ✅ Automated maintenance
- ❌ Additional build complexity
- ❌ Requires tooling setup

## Current Implementation

The project currently uses **Approach 1** with the following structure:

```
apps/
├── web/
│   ├── src/
│   │   ├── types/
│   │   │   └── schema.ts          # Frontend type definitions
│   │   └── components/
│   │       └── project/
│   │           ├── message-card.tsx    # Uses schema types
│   │           ├── message-form.tsx    # Uses schema types
│   │           └── messages-container.tsx
│   └── tsconfig.json              # Path mapping configured
└── server/
    └── src/
        └── db/
            └── schema/
                ├── agent.ts       # Backend schema definitions
                ├── auth.ts
                └── todo.ts
```

## Usage Examples

### In Components:

```typescript
// apps/web/src/components/project/message-card.tsx
import type { Fragment, MessageType, MessageRole } from "@/types/schema";

interface MessageCardProps {
  role: MessageRole;
  type: MessageType;
  fragment: Fragment | null | undefined;
  // ...
}
```

### In Pages:

```typescript
// apps/web/src/app/projects/[projectId]/page.tsx
import type { Project } from "@/types/schema";

interface ProjectPageProps {
  projectId: number;
}
```

This approach provides type safety while keeping the frontend independent of backend runtime dependencies.
