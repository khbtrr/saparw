<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('welcome');
});

// Serve public disk files when Windows symlink creation is unavailable without Administrator privileges.
Route::get('/storage/{path}', function (string $path) {
    if (str_contains($path, '..') || ! Storage::disk('public')->exists($path)) {
        abort(404);
    }

    return Storage::disk('public')->response($path);
})->where('path', '^aduan/[A-Za-z0-9_.-]+$');
