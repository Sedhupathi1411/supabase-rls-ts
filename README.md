
# supabase-rls-ts

**Type-safe TypeScript library for defining and generating Supabase Row Level Security (RLS) policy SQL from code.**


## Overview

`supabase-rls-ts` lets you define Supabase RLS policies in TypeScript using a fully type-safe, composable API. Write your RLS rules as code, generate ready-to-apply SQL, and keep your database security maintainable and version-controlled.


## Features

- **Type-safe RLS policy definitions** using expressive TypeScript DSL.
- **Generate SQL** for Supabase/Postgres RLS policies automatically.
- **Composable expressions**: eq, ne, lt, gt, in, like, and more.
- **Supports multiple policies per table**.
- **Integrates with migration tools** (see [Knex.js use case](#use-with-knexjs-migrations)).


## Installation

```sh
npm install supabase-rls-ts
# or
yarn add supabase-rls-ts
```


## Quick Example

```ts
import {
  eq,
  definePolicies,
  policiesToSql,
  Column,
} from 'supabase-rls-ts';

type ProfileRow = {
  id: Column;
  user_id: Column;
  avatar_url: Column;
};
type AuthCtx = {
  uid: Column;
};

const policies = definePolicies('profiles', [
  {
    command: 'select',
    name: 'Select own profile',
    policy: ({ row, auth }) => eq(auth.uid, row.user_id),
  },
  {
    command: 'insert',
    name: 'Insert own profile',
    policy: ({ row, auth }) => eq(auth.uid, row.user_id),
  },
]);

const sql = policiesToSql(policies);

console.log(sql);
// Outputs SQL ready to use in your Supabase/Postgres migration
```


## Use with Knex.js Migrations

You can integrate `supabase-rls-ts` into your Knex.js migration workflow to automate RLS policy deployment:

```ts
// migrations/20250707_create_profiles_rls.ts
import { Knex } from 'knex';
import {
  eq,
  definePolicies,
  policiesToSql,
  Column,
} from 'supabase-rls-ts';

type ProfileRow = {
  id: Column;
  user_id: Column;
  avatar_url: Column;
};
type AuthCtx = {
  uid: Column;
};

const policies = definePolicies('profiles', [
  {
    command: 'select',
    name: 'Select own profile',
    policy: ({ row, auth }) => eq(auth.uid, row.user_id),
  },
  {
    command: 'insert',
    name: 'Insert own profile',
    policy: ({ row, auth }) => eq(auth.uid, row.user_id),
  },
]);

export async function up(knex: Knex): Promise {
  await knex.raw(policiesToSql(policies));
}

export async function down(knex: Knex): Promise {
  // Optionally drop the policies by name
  await knex.raw('DROP POLICY IF EXISTS "Select own profile" ON profiles;');
  await knex.raw('DROP POLICY IF EXISTS "Insert own profile" ON profiles;');
}
```


## API Reference

- **Expressions:** `eq`, `ne`, `lt`, `lte`, `gt`, `gte`, `isNull`, `isNotNull`, `inList`, `notInList`, `like`, `notLike`, `and`, `or`, `not`
- **Policy Definition:** `definePolicy`, `definePolicies`
- **SQL Generation:** `policiesToSql`, `policyToSql`

See [TypeScript docs](./src/) for full API details.


## Testing

Run the test suite (Jest):

```
npm test
```


## License

MIT
