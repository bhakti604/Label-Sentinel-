/**
 * Seed Data: Users & Role-Based Access Control
 */

import { UserProfile } from '@/types/portal';

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'USR-001',
    name: 'Dr. Alok Verma, IAS',
    email: 'controller.delhi@legalmetrology.gov.in',
    role: 'CONTROLLER',
    badgeNumber: 'LM-CONT-01',
    jurisdictionId: 'JUR-DEL-01',
    jurisdictionName: 'Delhi State Legal Metrology HQ',
    status: 'ACTIVE',
    createdAt: '2025-04-10',
  },
  {
    id: 'USR-002',
    name: 'Inspector Vikram Anand',
    email: 'v.anand@delhi.gov.in',
    role: 'OFFICER',
    badgeNumber: 'LMO-DEL-409',
    jurisdictionId: 'JUR-DEL-02',
    jurisdictionName: 'Delhi State - Central District',
    status: 'ACTIVE',
    createdAt: '2025-06-15',
  },
  {
    id: 'USR-003',
    name: 'Senior Inspector Priya Deshmukh',
    email: 'p.deshmukh@maharashtra.gov.in',
    role: 'OFFICER',
    badgeNumber: 'LMO-MAH-112',
    jurisdictionId: 'JUR-MAH-01',
    jurisdictionName: 'Maharashtra - Mumbai Suburban',
    status: 'ACTIVE',
    createdAt: '2025-08-01',
  },
  {
    id: 'USR-004',
    name: 'Devraj Sen (System Administrator)',
    email: 'admin.sentinel@nic.in',
    role: 'ADMIN',
    jurisdictionName: 'National Metrology IT Directorate',
    status: 'ACTIVE',
    createdAt: '2025-01-05',
  },
  {
    id: 'USR-005',
    name: 'Inspector Mahesh Patil',
    email: 'm.patil@karnataka.gov.in',
    role: 'OFFICER',
    badgeNumber: 'LMO-KAR-204',
    jurisdictionId: 'JUR-KAR-01',
    jurisdictionName: 'Karnataka - Bengaluru Urban',
    status: 'ACTIVE',
    createdAt: '2025-09-12',
  },
  {
    id: 'USR-006',
    name: 'Public Consumer User',
    email: 'public.citizen@sentinel.org',
    role: 'CITIZEN',
    jurisdictionName: 'All India Public Access',
    status: 'ACTIVE',
    createdAt: '2026-01-01',
  },
];

