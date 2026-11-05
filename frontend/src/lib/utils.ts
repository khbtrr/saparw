import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTanggal(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function getStatusBadgeStyle(status: string) {
  switch (status) {
    case 'Diajukan':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'Diverifikasi':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Diproses':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'Selesai':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'Ditolak':
      return 'bg-rose-100 text-rose-800 border-rose-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}
