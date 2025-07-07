import {
    and,
    eq,
    gt,
    gte,
    inList,
    isNotNull,
    isNull,
    like,
    lt,
    lte,
    ne,
    not,
    notInList,
    notLike,
    or,
} from '../src/expr';
import { definePolicies, definePolicy } from '../src/policy';
import { exprToSql, policiesToSql } from '../src/sql';

import { Column } from '../src/types';

type Row = {
    id: Column<string>;
    user_id: Column<string>;
    age: Column<number>;
    name: Column<string>;
    status: Column<string>;
};
type Auth = {
    uid: Column<string>;
};

const dummyRow: Row = {
    id: { name: 'id', type: '' },
    user_id: { name: 'user_id', type: '' },
    age: { name: 'age', type: 0 },
    name: { name: 'name', type: '' },
    status: { name: 'status', type: '' },
};
const dummyAuth: Auth = {
    uid: { name: 'auth.uid()', type: '' },
};

describe('RLS Policy Library', () => {
    it('should generate simple eq SQL', () => {
        const expr = eq(dummyAuth.uid, dummyRow.user_id);
        expect(exprToSql(expr)).toBe('(auth.uid() = user_id)');
    });

    it('should generate all comparison operators', () => {
        expect(exprToSql(ne(dummyRow.id, dummyAuth.uid))).toBe('(id <> auth.uid())');
        expect(exprToSql(lt(dummyRow.age, { name: 'limit', type: 0 }))).toBe('(age < limit)');
        expect(exprToSql(lte(dummyRow.age, { name: 'limit', type: 0 }))).toBe('(age <= limit)');
        expect(exprToSql(gt(dummyRow.age, { name: 'min', type: 0 }))).toBe('(age > min)');
        expect(exprToSql(gte(dummyRow.age, { name: 'min', type: 0 }))).toBe('(age >= min)');
    });

    it('should generate IS NULL and IS NOT NULL', () => {
        expect(exprToSql(isNull(dummyRow.status))).toBe('(status IS NULL)');
        expect(exprToSql(isNotNull(dummyRow.status))).toBe('(status IS NOT NULL)');
    });

    it('should generate IN and NOT IN', () => {
        const values = [
            { name: "'active'", type: '' },
            { name: "'pending'", type: '' },
        ];
        expect(exprToSql(inList(dummyRow.status, values))).toBe("(status IN ('active', 'pending'))");
        expect(exprToSql(notInList(dummyRow.status, values))).toBe("(status NOT IN ('active', 'pending'))");
    });

    it('should generate LIKE and NOT LIKE', () => {
        expect(exprToSql(like(dummyRow.name, { name: "'A%'", type: '' }))).toBe("(name LIKE 'A%')");
        expect(exprToSql(notLike(dummyRow.name, { name: "'B%'", type: '' }))).toBe("(name NOT LIKE 'B%')");
    });

    it('should generate logical AND, OR, NOT', () => {
        const expr = and(
            eq(dummyAuth.uid, dummyRow.user_id),
            gt(dummyRow.age, { name: 'min', type: 0 })
        );
        expect(exprToSql(expr)).toBe('(auth.uid() = user_id) AND (age > min)');

        const expr2 = or(
            eq(dummyRow.status, { name: "'active'", type: '' }),
            eq(dummyRow.status, { name: "'pending'", type: '' })
        );
        expect(exprToSql(expr2)).toBe("(status = 'active') OR (status = 'pending')");

        const expr3 = not(eq(dummyRow.id, dummyAuth.uid));
        expect(exprToSql(expr3)).toBe('NOT ((id = auth.uid()))');
    });

    it('should generate full policy SQL for select', () => {
        const policies = definePolicies<Row, Auth>('profiles', [
            {
                command: 'select',
                name: 'Select own profile',
                policy: ({ row, auth }) => eq(auth.uid, row.user_id),
            },
        ]);
        const sql = policiesToSql(policies);
        expect(sql).toContain('CREATE POLICY "Select own profile"');
        expect(sql).toContain('ON profiles');
        expect(sql).toContain('FOR select');
        expect(sql).toContain('USING ((auth.uid() = user_id))');
    });

    it('should generate full policy SQL for insert', () => {
        const policies = definePolicies<Row, Auth>('profiles', [
            {
                command: 'insert',
                name: 'Insert own profile',
                policy: ({ row, auth }) => eq(auth.uid, row.user_id),
            },
        ]);
        const sql = policiesToSql(policies);
        expect(sql).toContain('CREATE POLICY "Insert own profile"');
        expect(sql).toContain('FOR insert');
        expect(sql).toContain('WITH CHECK ((auth.uid() = user_id))');
    });

    it('should generate complex policy SQL', () => {
        const policies = definePolicies<Row, Auth>('profiles', [
            {
                command: 'select',
                name: 'Active or Pending',
                policy: ({ row }) =>
                    or(
                        eq(row.status, { name: "'active'", type: '' }),
                        eq(row.status, { name: "'pending'", type: '' })
                    ),
            },
            {
                command: 'select',
                name: 'Age and Name',
                policy: ({ row }) =>
                    and(
                        gt(row.age, { name: 'min_age', type: 0 }),
                        like(row.name, { name: "'A%'", type: '' })
                    ),
            },
        ]);
        const sql = policiesToSql(policies);
        expect(sql).toContain("CREATE POLICY \"Active or Pending\"");
        expect(sql).toContain("CREATE POLICY \"Age and Name\"");
        expect(sql).toContain("(status = 'active') OR (status = 'pending')");
        expect(sql).toContain("(age > min_age) AND (name LIKE 'A%')");
    });

    it('should throw on unknown operator', () => {
        // @ts-expect-error purposely break the type
        expect(() => exprToSql({ op: 'unknown', foo: 1 })).toThrow();
    });
});
