/**
 * Seed Data: Statutory Legal Metrology Jurisdictions
 */

import { JurisdictionNode } from '@/types/portal';

export const DEMO_JURISDICTIONS: JurisdictionNode[] = [
  {
    id: 'JUR-DEL-01',
    code: 'DL-HQ',
    name: 'Delhi State Legal Metrology Headquarters',
    state: 'NCT of Delhi',
    level: 'STATE_HEADQUARTERS',
    controllerName: 'Dr. Alok Verma, IAS',
    activeInspectorsCount: 42,
    activeCasesCount: 128,
    contactEmail: 'controller.delhi@legalmetrology.gov.in',
    phone: '011-23378901',
  },
  {
    id: 'JUR-DEL-02',
    code: 'DL-CENT',
    name: 'Delhi State - Central District Zone',
    state: 'NCT of Delhi',
    level: 'DISTRICT_OFFICE',
    controllerName: 'Assistant Controller K. L. Sharma',
    activeInspectorsCount: 14,
    activeCasesCount: 39,
    contactEmail: 'central.delhi@legalmetrology.gov.in',
    phone: '011-23381240',
  },
  {
    id: 'JUR-MAH-01',
    code: 'MH-MUM-SUB',
    name: 'Maharashtra - Mumbai Suburban District',
    state: 'Maharashtra',
    level: 'DISTRICT_OFFICE',
    controllerName: 'Deputy Controller R. K. Sawant',
    activeInspectorsCount: 28,
    activeCasesCount: 94,
    contactEmail: 'mumbaisuburban@legalmetrology.gov.in',
    phone: '022-26514430',
  },
  {
    id: 'JUR-KAR-01',
    code: 'KA-BLR-URB',
    name: 'Karnataka - Bengaluru Urban Metrology Zone',
    state: 'Karnataka',
    level: 'DISTRICT_OFFICE',
    controllerName: 'Joint Controller S. V. Gowda',
    activeInspectorsCount: 22,
    activeCasesCount: 76,
    contactEmail: 'bengaluru.urban@legalmetrology.gov.in',
    phone: '080-22258819',
  },
  {
    id: 'JUR-TN-01',
    code: 'TN-CHN-CENT',
    name: 'Tamil Nadu - Chennai Central Zone',
    state: 'Tamil Nadu',
    level: 'DISTRICT_OFFICE',
    controllerName: 'Assistant Controller P. Srinivasan',
    activeInspectorsCount: 18,
    activeCasesCount: 52,
    contactEmail: 'chennai.metrology@tn.gov.in',
    phone: '044-25367711',
  },
];

