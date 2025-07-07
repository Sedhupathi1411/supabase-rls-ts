
# supabase-rls-ts

supabase-rls-ts enables you to define Supabase Row Level Security (RLS) policies in TypeScript with a type-safe, composable API. Write your policies as code, automatically generate the corresponding SQL, and manage your database security in a maintainable, version-controlled way

## Features

- **Type-safe RLS policy definitions** using expressive TypeScript DSL.
- **Generate SQL** for Supabase/Postgres RLS policies automatically.
- **Composable expressions**: eq, ne, lt, gt, in, like, and more.
- **Supports multiple policies per table**.
<!-- - **Integrates with migration tools** (see [Knex.js use case](#use-with-knexjs-migrations)). -->


## Installation

```sh
npm install supabase-rls-ts
# or
yarn add supabase-rls-ts
```


## Quick Example

```ts
import {
  definePolicies,
  eq,
  policiesToSql,
} from 'supabase-rls-ts';


// Define your row and auth column descriptors
type Profile = {
  id: string;
  user_id: string;
};

// Define policies for the "profiles" table
const policies = definePolicies<Profile>('profiles', [
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

// Generate SQL for all policies
const sql = policiesToSql(policies);

console.log(sql);
// Outputs SQL ready to use in your Supabase/Postgres migration
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
