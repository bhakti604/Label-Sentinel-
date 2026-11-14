'use client';

import React from 'react';
import { PortalLayout } from '@/components/layout/PortalLayout';

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout portal="officer">{children}</PortalLayout>;
}

