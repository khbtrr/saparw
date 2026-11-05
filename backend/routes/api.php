<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AduanController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PublicController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/publik/statistik', [PublicController::class, 'statistik']);
Route::get('/kategori', [PublicController::class, 'kategori']);

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/profil', [AuthController::class, 'updateProfil']);
    Route::put('/auth/password', [AuthController::class, 'updatePassword']);

    // Aduan Warga
    Route::get('/aduan', [AduanController::class, 'index']);
    Route::get('/aduan/{id}', [AduanController::class, 'show']);
    Route::post('/aduan', [AduanController::class, 'store']);
    Route::delete('/aduan/{id}', [AduanController::class, 'destroy']);

    // Panel Admin Pengurus RW
    Route::prefix('admin')->group(function () {
        Route::get('/aduan', [AdminController::class, 'daftarAduan']);
        Route::post('/aduan/{id}/status', [AdminController::class, 'updateStatus']);
        Route::post('/aduan/{id}/tanggapan', [AdminController::class, 'kirimTanggapan']);

        Route::get('/pengguna', [AdminController::class, 'daftarPengguna']);
        Route::patch('/pengguna/{id}/aktif', [AdminController::class, 'toggleAktifPengguna']);

        Route::get('/kategori', [AdminController::class, 'indexKategori']);
        Route::post('/kategori', [AdminController::class, 'storeKategori']);
        Route::patch('/kategori/{id}/aktif', [AdminController::class, 'toggleAktifKategori']);

        Route::get('/rekap', [AdminController::class, 'rekap']);
    });
});
