import React from 'react';
import type { StatusAduan } from '../types';
import { getStatusBadgeStyle } from '../lib/utils';

export const StatusBadge: React.FC<{ status: StatusAduan | string; className?: string }> = ({
  status,
  className = '',
}) => {
  const badgeStyle = getStatusBadgeStyle(status);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle} ${className}`}
    >
      {status}
    </span>
  );
};
