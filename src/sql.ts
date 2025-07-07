import { Expr, Policy } from './types';

/**
 * Converts a column descriptor to SQL.
 * @param col The column descriptor.
 */
function colToSql(col: { name: string }): string {
  if (col.name === 'auth.uid()') return 'auth.uid()';
  return col.name;
}

/**
 * Recursively converts an AST expression to SQL.
 * @param expr The expression AST.
 */
export function exprToSql(expr: Expr): string {
  switch (expr.op) {
    case 'eq':
      return `(${colToSql(expr.left)} = ${colToSql(expr.right)})`;
    case 'ne':
      return `(${colToSql(expr.left)} <> ${colToSql(expr.right)})`;
    case 'lt':
      return `(${colToSql(expr.left)} < ${colToSql(expr.right)})`;
    case 'lte':
      return `(${colToSql(expr.left)} <= ${colToSql(expr.right)})`;
    case 'gt':
      return `(${colToSql(expr.left)} > ${colToSql(expr.right)})`;
    case 'gte':
      return `(${colToSql(expr.left)} >= ${colToSql(expr.right)})`;
    case 'isNull':
      return `(${colToSql(expr.column)} IS NULL)`;
    case 'isNotNull':
      return `(${colToSql(expr.column)} IS NOT NULL)`;
    case 'in':
      return `(${colToSql(expr.column)} IN (${expr.values.map(colToSql).join(', ')}))`;
    case 'notIn':
      return `(${colToSql(expr.column)} NOT IN (${expr.values.map(colToSql).join(', ')}))`;
    case 'like':
      return `(${colToSql(expr.column)} LIKE ${colToSql(expr.pattern)})`;
    case 'notLike':
      return `(${colToSql(expr.column)} NOT LIKE ${colToSql(expr.pattern)})`;
    case 'and':
      return expr.exprs.map(exprToSql).join(' AND ');
    case 'or':
      return expr.exprs.map(exprToSql).join(' OR ');
    case 'not':
      return `NOT (${exprToSql(expr.expr)})`;
    default:
      throw new Error(`Unknown operator: ${(expr as any).op}`);
  }
}

/**
 * Generates a CREATE POLICY SQL statement for a single policy.
 * @param policy The policy definition.
 */
export function policyToSql<Row, Auth>(policy: Policy<Row, Auth>): string {
  const { table, command, name, policy: policyFn } = policy;

  // Build dummy context with only column names for SQL generation
  const dummyRow = new Proxy({}, {
    get: (_, prop: string) => ({ name: prop, type: '' })
  }) as Row;
  const dummyAuth = new Proxy({}, {
    get: (_, prop: string) =>
      prop === 'uid'
        ? { name: 'auth.uid()', type: '' }
        : { name: prop, type: '' }
  }) as Auth;

  const expr = policyFn({
    row: dummyRow,
    auth: dummyAuth,
    command
  });

  let usingClause = '';
  let withCheckClause = '';

  if (command === 'select' || command === 'delete') {
    usingClause = `USING (${exprToSql(expr)})`;
  } else if (command === 'insert') {
    withCheckClause = `WITH CHECK (${exprToSql(expr)})`;
  } else if (command === 'update') {
    usingClause = `USING (${exprToSql(expr)})`;
    withCheckClause = `WITH CHECK (${exprToSql(expr)})`;
  }

  return [
    `CREATE POLICY "${name}"`,
    `ON ${table}`,
    `FOR ${command}`,
    [usingClause, withCheckClause].filter(Boolean).join(' '),
    ';'
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Generates SQL for multiple policies.
 * @param policies Array of policies.
 */
export function policiesToSql<Row, Auth>(policies: Policy<Row, Auth>[]): string {
  return policies.map(policyToSql).join('\n\n');
}
