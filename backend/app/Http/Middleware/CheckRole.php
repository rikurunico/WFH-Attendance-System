<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $role
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (!auth()->check()) {
            abort(401, 'Unauthenticated.');
        }

        $user = auth()->user();

        if ($role === 'manager' && !$user->isManager()) {
            abort(403, 'Unauthorized. Manager role required.');
        }

        if ($role === 'employee' && !$user->isEmployee()) {
            abort(403, 'Unauthorized. Employee role required.');
        }

        return $next($request);
    }
}
