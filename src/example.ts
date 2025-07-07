import {
    definePolicies,
    eq,
    policiesToSql,
} from './index';

// Define your row and auth column descriptors
type ProfileRow = {
    id: string;
    user_id: string;
};


// Define policies for the "profiles" table
const policies = definePolicies<ProfileRow>('profiles', [
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

/*
Output:
 
CREATE POLICY "Select own profile"
ON profiles
FOR select
USING ((auth.uid() = user_id))
;
 
CREATE POLICY "Insert own profile"
ON profiles
FOR insert
WITH CHECK ((auth.uid() = user_id))
;
*/
