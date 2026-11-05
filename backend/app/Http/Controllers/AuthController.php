<?php

namespace App\Http\Controllers;

use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'username' => 'required|string|max:50|unique:pengguna,username',
            'password' => 'required|string|min:5',
            'rt' => 'nullable|string|max:3',
            'no_rumah' => 'nullable|string|max:10',
            'no_hp' => 'nullable|string|max:20',
        ], [
            'username.unique' => 'Username sudah digunakan warga lain.',
            'password.min' => 'Kata sandi minimal 5 karakter.',
        ]);

        $user = Pengguna::create([
            'nama' => $validated['nama'],
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'peran' => 'warga',
            // Accounts require manual activation by RW administrators before login.
            'aktif' => false,
            'rt' => $validated['rt'] ?? null,
            'no_rumah' => $validated['no_rumah'] ?? null,
            'no_hp' => $validated['no_hp'] ?? null,
            'dibuat_pada' => now(),
        ]);

        return response()->json([
            'message' => 'Pendaftaran berhasil! Akun Anda sedang menunggu verifikasi/aktivasi oleh Pengurus RW 05.',
            'data' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
            'peran_target' => 'nullable|string|in:warga,admin',
        ]);

        $user = Pengguna::where('username', $request->username)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Username atau kata sandi salah.',
            ], 401);
        }

        if ($request->peran_target && $user->peran !== $request->peran_target) {
            return response()->json([
                'message' => "Akun ini tidak memiliki hak akses sebagai {$request->peran_target}.",
            ], 403);
        }

        if (! $user->aktif) {
            return response()->json([
                'message' => 'Akun Anda belum aktif. Silakan tunggu verifikasi/aktivasi dari Pengurus RW 05.',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil.',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'data' => $request->user(),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Berhasil keluar.',
        ]);
    }

    public function updateProfil(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'nama' => 'sometimes|required|string|max:100',
            'no_hp' => 'nullable|string|max:20',
            'no_rumah' => 'nullable|string|max:10',
            'rt' => 'nullable|string|max:3',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'data' => $user,
        ]);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'password_baru' => 'required|string|min:5',
        ], [
            'password_baru.min' => 'Password minimal 5 karakter.',
        ]);

        $user = $request->user();
        $user->password = Hash::make($request->password_baru);
        $user->save();

        return response()->json([
            'message' => 'Kata sandi berhasil diubah.',
        ]);
    }
}
