import { Auth, Policy, PolicyFunction, RlsCommand, ToColumnShape } from './types';

/**
 * Defines a single RLS policy.
 * @param table Table name.
 * @param command RLS command.
 * @param name Policy name.
 * @param policy Policy function.
 */
export function definePolicy<Row>(
  table: string,
  command: RlsCommand,
  name: string,
  policy: PolicyFunction<ToColumnShape<Row>, Auth>
): Policy<ToColumnShape<Row>, Auth> {
  return { table, command, name, policy };
}

/**
 * Defines multiple RLS policies for a table.
 * @param table Table name.
 * @param policies Array of {command, name, policy} objects.
 */
export function definePolicies<Row>(
  table: string,
  policies: Array<{
    command: RlsCommand;
    name: string;
    policy: PolicyFunction<ToColumnShape<Row>, Auth>;
  }>
): Policy<ToColumnShape<Row>, Auth>[] {
  return policies.map(({ command, name, policy }) =>
    definePolicy(table, command, name, policy)
  );
}
