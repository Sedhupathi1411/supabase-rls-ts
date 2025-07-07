/**
 * Supported RLS commands as literal types.
 */
export type RlsCommand = 'select' | 'insert' | 'update' | 'delete';

/**
 * Column descriptor for building AST and SQL.
 */
export interface Column<T> {
  /** Name of the column or special function (e.g., 'auth.uid()'). */
  name: string;
  /** Type of the column value. */
  type: T;
}

/**
 * Supported AST expression types for RLS policies.
 */
export type Expr =
  | { op: 'eq'; left: Column<unknown>; right: Column<unknown> }
  | { op: 'ne'; left: Column<unknown>; right: Column<unknown> }
  | { op: 'lt'; left: Column<number | string>; right: Column<number | string> }
  | { op: 'lte'; left: Column<number | string>; right: Column<number | string> }
  | { op: 'gt'; left: Column<number | string>; right: Column<number | string> }
  | { op: 'gte'; left: Column<number | string>; right: Column<number | string> }
  | { op: 'isNull'; column: Column<unknown> }
  | { op: 'isNotNull'; column: Column<unknown> }
  | { op: 'in'; column: Column<unknown>; values: Array<Column<unknown>> }
  | { op: 'notIn'; column: Column<unknown>; values: Array<Column<unknown>> }
  | { op: 'like'; column: Column<string>; pattern: Column<string> }
  | { op: 'notLike'; column: Column<string>; pattern: Column<string> }
  | { op: 'and'; exprs: Expr[] }
  | { op: 'or'; exprs: Expr[] }
  | { op: 'not'; expr: Expr };

/**
 * Context passed to a policy function.
 */
export interface PolicyContext<Row, Auth> {
  row: Row;
  auth: Auth;
  command: RlsCommand;
}

/**
 * Function signature for a policy rule.
 */
export type PolicyFunction<Row, Auth> = (ctx: PolicyContext<Row, Auth>) => Expr;

/**
 * Policy definition.
 */
export interface Policy<Row, Auth> {
  table: string;
  command: RlsCommand;
  name: string;
  policy: PolicyFunction<Row, Auth>;
}
