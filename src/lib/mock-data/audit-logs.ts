/**
 * Seed Data: Immutable Audit Trail Logs
 */

import { AuditLogEntry } from '@/types/portal';

export const DEMO_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-99120',
    timestamp: '2026-11-03 13:45:10',
    actorEmail: 'admin.sentinel@nic.in',
    actorRole: 'ADMIN',
    actionType: 'RULE_MODIFIED',
    targetResource: 'PCR-2011-R06-1DA (Unit Sale Price)',
    details: 'Updated statutory threshold criteria for bulk e-commerce packaging compliance.',
    ipAddress: '10.24.110.14',
    hash: 'e4d8a1c920fbc3418903eac091bfd829104fae89',
  },
  {
    id: 'AUD-99119',
    timestamp: '2026-11-03 12:10:02',
    actorEmail: 'v.anand@delhi.gov.in',
    actorRole: 'OFFICER',
    actionType: 'INSPECTION_LOGGED',
    targetResource: 'DEL-CENT-INSP-2026-0301 (SuperMart CP)',
    details: 'Field inspection scheduled in response to verified citizen complaint CMP-2026-1044.',
    ipAddress: '10.24.112.85',
    hash: '91bc740ae01f28b4991c0e3a987ef24801daec67',
  },
  {
    id: 'AUD-99118',
    timestamp: '2026-11-02 17:05:40',
    actorEmail: 'p.deshmukh@maharashtra.gov.in',
    actorRole: 'OFFICER',
    actionType: 'NOTICE_ISSUED',
    targetResource: 'DOS-2026-8802 (Aura Botanics)',
    details: 'Formal statutory Show Cause Notice issued under Section 36(1) for illegal metric symbol (MLTRS).',
    ipAddress: '10.24.108.92',
    hash: 'fa208b5c90d81a3411e809fcd912e840139b4071',
  },
  {
    id: 'AUD-99117',
    timestamp: '2026-11-02 15:30:19',
    actorEmail: 'admin.sentinel@nic.in',
    actorRole: 'ADMIN',
    actionType: 'USER_INVITED',
    targetResource: 'USR-005 (Inspector Mahesh Patil)',
    details: 'Enrolled new Legal Metrology Officer with credentials tied to Bengaluru Urban Jurisdiction.',
    ipAddress: '10.24.110.14',
    hash: '6618d09eaf1490ccba129048a192837bc901ef23',
  },
  {
    id: 'AUD-99116',
    timestamp: '2026-11-01 11:20:00',
    actorEmail: 's.kaushik@delhi.gov.in',
    actorRole: 'OFFICER',
    actionType: 'CASE_FILED',
    targetResource: 'LM-DEL-2026-0074 (Krishna Dairy)',
    details: 'Compounded retail dual pricing sticker violation upon receipt of ₹ 15,000 compounding penalty.',
    ipAddress: '10.24.112.90',
    hash: '098f6bcd4621d373cade4e832627b4f6e12984a1',
  },
];

