<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;

class CheckRegistrationEnabled
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        if (!Config::get('app.registration.enabled', true)) {
            return response()->json([
                'success' => false,
                'message' => 'Registration is currently disabled',
                'errors' => [
                    'registration' => ['Pendaftaran akun baru sedang dinonaktifkan']
                ]
            ], 403);
        }

        return $next($request);
    }
}