import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { organizationName, name, email, password } = body;

        // Validate input
        if (!organizationName || !name || !email || !password) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            );
        }

        // Create organization slug
        const slug = organizationName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Check if organization slug exists
        const existingOrg = await prisma.organization.findUnique({
            where: { slug },
        });

        if (existingOrg) {
            return NextResponse.json(
                { error: 'Organization name already taken' },
                { status: 400 }
            );
        }

        // Get Admin role
        const adminRole = await prisma.role.findUnique({
            where: { name: 'Admin' },
        });

        if (!adminRole) {
            return NextResponse.json(
                { error: 'System error: Admin role not found' },
                { status: 500 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create organization and user in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create organization
            const organization = await tx.organization.create({
                data: {
                    name: organizationName,
                    slug,
                },
            });

            // Create user (first user becomes admin)
            const user = await tx.user.create({
                data: {
                    email,
                    name,
                    password: hashedPassword,
                    roleId: adminRole.id,
                    organizationId: organization.id,
                    isActive: true,
                },
            });

            return { organization, user };
        });

        return NextResponse.json(
            {
                message: 'Registration successful',
                organizationId: result.organization.id,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'An error occurred during registration' },
            { status: 500 }
        );
    }
}
