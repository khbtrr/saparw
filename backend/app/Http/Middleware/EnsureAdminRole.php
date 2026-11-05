<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminRole
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->peran !== 'admin') {
            return response()->json([
                'message' => 'Akses ditolak. Halaman ini khusus untuk Pengurus RW 05.',
            ], 403);
        }

        return $next($request);
    }
}
