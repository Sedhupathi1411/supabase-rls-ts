import { Column, Expr } from './types';

/**
 * Equality expression.
 */
export function eq<T>(a: Column<T>, b: Column<T>): Expr {
  return { op: 'eq', left: a, right: b };
}

/**
 * Not-equal expression.
 */
export function ne<T>(a: Column<T>, b: Column<T>): Expr {
  return { op: 'ne', left: a, right: b };
}

/**
 * Less-than expression.
 */
export function lt<T extends number | string>(a: Column<T>, b: Column<T>): Expr {
  return { op: 'lt', left: a, right: b };
}

/**
 * Less-than-or-equal expression.
 */
export function lte<T extends number | string>(a: Column<T>, b: Column<T>): Expr {
  return { op: 'lte', left: a, right: b };
}

/**
 * Greater-than expression.
 */
export function gt<T extends number | string>(a: Column<T>, b: Column<T>): Expr {
  return { op: 'gt', left: a, right: b };
}

/**
 * Greater-than-or-equal expression.
 */
export function gte<T extends number | string>(a: Column<T>, b: Column<T>): Expr {
  return { op: 'gte', left: a, right: b };
}

/**
 * IS NULL expression.
 */
export function isNull<T>(column: Column<T>): Expr {
  return { op: 'isNull', column };
}

/**
 * IS NOT NULL expression.
 */
export function isNotNull<T>(column: Column<T>): Expr {
  return { op: 'isNotNull', column };
}

/**
 * IN expression.
 */
export function inList<T>(column: Column<T>, values: Array<Column<T>>): Expr {
  return { op: 'in', column, values };
}

/**
 * NOT IN expression.
 */
export function notInList<T>(column: Column<T>, values: Array<Column<T>>): Expr {
  return { op: 'notIn', column, values };
}

/**
 * LIKE expression.
 */
export function like(column: Column<string>, pattern: Column<string>): Expr {
  return { op: 'like', column, pattern };
}

/**
 * NOT LIKE expression.
 */
export function notLike(column: Column<string>, pattern: Column<string>): Expr {
  return { op: 'notLike', column, pattern };
}

/**
 * Logical AND expression.
 */
export function and(...exprs: Expr[]): Expr {
  return { op: 'and', exprs };
}

/**
 * Logical OR expression.
 */
export function or(...exprs: Expr[]): Expr {
  return { op: 'or', exprs };
}

/**
 * Logical NOT expression.
 */
export function not(expr: Expr): Expr {
  return { op: 'not', expr };
}
