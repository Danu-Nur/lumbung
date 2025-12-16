import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            roleId: string;
            roleName: string;
            organizationId: string | null;
            organizationName: string | null;
        } & DefaultSession['user'];
    }

    interface User {
        id: string;
        roleId: string;
        roleName: string;
        organizationId: string | null;
        organizationName: string | null;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        roleId: string;
        roleName: string;
        organizationId: string | null;
        organizationName: string | null;
    }
}
