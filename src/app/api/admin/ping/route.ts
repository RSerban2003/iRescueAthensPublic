import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

interface AdminJWTPayload {
    adminUserId: string;
    passwordHash: string;
    iat: number;
    exp: number;
}


export async function GET(req: Request) {
    try {
        const rawCookie = req.headers.get('cookie') || '';
        const token = rawCookie
            .split(';')
            .find((c) => c.trim().startsWith('admin_token='))
            ?.split('=')[1];

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized - no token' }, { status: 401 });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET!) as AdminJWTPayload;

        const user = await prisma.adminUser.findUnique({ where: { id: payload.adminUserId } });

        if (!user || user.password !== payload.passwordHash) {
            return NextResponse.json({ error: 'Unauthorized - invalidated' }, { status: 401 });
        }

        const now = Math.floor(Date.now() / 1000);
        const age = now - payload.iat;

        if (age >= 300 && age < 1200) {
            const refreshedToken = jwt.sign(
                {
                    adminUserId: user.id,
                    passwordHash: user.password,
                },
                process.env.JWT_SECRET!,
                { expiresIn: '20m' }
            );

            const res = NextResponse.json({ success: true, refreshed: true });
            res.cookies.set('admin_token', refreshedToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
            });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Ping error:', err);
        return NextResponse.json({ error: 'Unauthorized or invalid token' }, { status: 401 });
    }
}
