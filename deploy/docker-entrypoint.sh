#!/bin/sh
set -e

cd /var/www/saparw/backend

if [ ! -f .env ]; then
    cp .env.production.example .env
fi

mkdir -p storage/app/public/aduan \
         storage/framework/cache/data \
         storage/framework/sessions \
         storage/framework/views \
         storage/logs \
         bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

if [ -z "$APP_KEY" ] && ! grep -q "^APP_KEY=base64:" .env; then
    php artisan key:generate --force
fi

echo "Menunggu koneksi database MySQL (${DB_HOST:-db}:${DB_PORT:-3306})..."
php -r '
$host = getenv("DB_HOST") ?: "db";
$port = getenv("DB_PORT") ?: "3306";
$db   = getenv("DB_DATABASE") ?: "saparw_db";
$user = getenv("DB_USERNAME") ?: "saparw_user";
$pass = getenv("DB_PASSWORD") ?: "saparw_secret";
for ($i = 0; $i < 30; $i++) {
    try {
        new PDO("mysql:host={$host};port={$port};dbname={$db}", $user, $pass);
        echo "Database MySQL siap.\n";
        exit(0);
    } catch (Throwable $e) {
        sleep(2);
    }
}
fwrite(STDERR, "Gagal terhubung ke database MySQL setelah 60 detik.\n");
exit(1);
'

php artisan storage:link --force || true
php artisan migrate --force

USER_COUNT=$(php -r '
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
echo \App\Models\Pengguna::count();
')

if [ "$USER_COUNT" = "0" ]; then
    echo "Mengisi data awal (DatabaseSeeder)..."
    php artisan db:seed --force
fi

php artisan config:cache
php artisan route:cache

chown -R www-data:www-data storage bootstrap/cache

echo "Menjalankan PHP-FPM dan Nginx untuk SapaRW 05..."
php-fpm -D
exec nginx -g "daemon off;"
