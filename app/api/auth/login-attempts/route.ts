import { NextRequest, NextResponse } from 'next/server';
import { getLoginAttemptStatus, recordFailedLoginAttempt, resetLoginAttempts } from '@/lib/auth/rate-limit';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { error: 'Email es requerido' },
                { status: 400 }
            );
        }

        const identifier = email.trim().toLowerCase();
        const status = getLoginAttemptStatus(identifier);

        return NextResponse.json({
            attempts: status.attempts,
            requiresTurnstile: status.requiresTurnstile,
            lockoutExpiresAt: status.lockoutExpiresAt?.toISOString(),
        });
    } catch (error) {
        console.error('Error obteniendo estado de intentos:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { email, action } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email es requerido' },
                { status: 400 }
            );
        }

        const identifier = email.trim().toLowerCase();

        if (action === 'failed') {
            const status = recordFailedLoginAttempt(identifier);
            return NextResponse.json({
                attempts: status.attempts,
                requiresTurnstile: status.requiresTurnstile,
                lockoutExpiresAt: status.lockoutExpiresAt?.toISOString(),
            });
        } else if (action === 'reset') {
            resetLoginAttempts(identifier);
            return NextResponse.json({
                attempts: 0,
                requiresTurnstile: false,
                lockoutExpiresAt: null,
            });
        } else {
            return NextResponse.json(
                { error: 'Acción no válida' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error actualizando estado de intentos:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
