'use client';

/**
 * Global Sentinel State Provider & Persistent Architecture
 *
 * Provides reactive application state with local storage persistence and
 * cross-portal synchronization across Citizen, Officer, and Admin portals.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ComplianceDossier,
  ComplianceStatus,
  StatutoryRuleDefinition,
} from '@/types/compliance';
import {
  CitizenComplaint,
  EnforcementInspection,
  EnforcementCase,
  UserProfile,
  AuthUser,
  JurisdictionNode,
  AuditLogEntry,
  ComplaintStatus,
  InspectionStatus,
  CaseStatus,
} from '@/types/portal';
import { DEMO_SCANS } from '@/lib/mock-data/scans';
import { DEMO_COMPLAINTS } from '@/lib/mock-data/complaints';
import { DEMO_INSPECTIONS } from '@/lib/mock-data/inspections';
import { DEMO_CASES } from '@/lib/mock-data/cases';
import { STATUTORY_RULES_REGISTRY } from '@/lib/rule-engine/rules';
import { DEMO_USERS } from '@/lib/mock-data/users';
import { DEMO_JURISDICTIONS } from '@/lib/mock-data/jurisdictions';
import { DEMO_AUDIT_LOGS } from '@/lib/mock-data/audit-logs';

export interface ToastNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface SentinelContextType {
  scans: ComplianceDossier[];
  complaints: CitizenComplaint[];
  inspections: EnforcementInspection[];
  cases: EnforcementCase[];
  rules: StatutoryRuleDefinition[];
  users: UserProfile[];
  jurisdictions: JurisdictionNode[];
  auditLogs: AuditLogEntry[];
  notifications: ToastNotification[];
  isHydrated: boolean;
  currentUser: AuthUser | null;

  login: (
    email: string,
    password?: string,
    requestedPortal?: 'citizen' | 'officer' | 'admin'
  ) => { success: boolean; error?: string; user?: AuthUser };
  logout: () => void;

  addScan: (scan: ComplianceDossier) => void;
  addComplaint: (complaint: Omit<CitizenComplaint, 'id' | 'submittedAt' | 'status'>) => string;
  updateComplaintStatus: (id: string, status: ComplaintStatus, remarks?: string) => void;
  resolveReviewQueueItem: (
    dossierId: string,
    ruleId: string,
    newStatus: ComplianceStatus,
    officerNotes: string
  ) => void;
  addInspection: (inspection: Omit<EnforcementInspection, 'id'>) => void;
  updateInspectionStatus: (id: string, status: InspectionStatus, notes?: string) => void;
  addCase: (enforcementCase: Omit<EnforcementCase, 'id'>) => void;
  updateCaseStatus: (id: string, status: CaseStatus, penalty?: number) => void;
  toggleRuleActive: (ruleId: string) => void;
  updateRule: (rule: StatutoryRuleDefinition) => void;
  addUser: (user: Omit<UserProfile, 'id' | 'createdAt'>) => void;
  toggleUserStatus: (userId: string) => void;
  addJurisdiction: (jurisdiction: Omit<JurisdictionNode, 'id'>) => void;
  dismissNotification: (id: string) => void;
  showNotification: (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => void;
  resetToDefaults: () => void;
}

const SentinelContext = createContext<SentinelContextType | undefined>(undefined);

// Storage key constants
const STORAGE_KEYS = {
  SCANS: 'sentinel_scans',
  COMPLAINTS: 'sentinel_complaints',
  INSPECTIONS: 'sentinel_inspections',
  CASES: 'sentinel_cases',
  RULES: 'sentinel_rules',
  USERS: 'sentinel_users',
  JURISDICTIONS: 'sentinel_jurisdictions',
  AUDIT_LOGS: 'sentinel_audit_logs',
  CURRENT_USER: 'sentinel_current_user',
} as const;

export function SentinelProvider({ children }: { children: React.ReactNode }) {
  const [scans, setScans] = useState<ComplianceDossier[]>(DEMO_SCANS);
  const [complaints, setComplaints] = useState<CitizenComplaint[]>(DEMO_COMPLAINTS);
  const [inspections, setInspections] = useState<EnforcementInspection[]>(DEMO_INSPECTIONS);
  const [cases, setCases] = useState<EnforcementCase[]>(DEMO_CASES);
  const [rules, setRules] = useState<StatutoryRuleDefinition[]>(STATUTORY_RULES_REGISTRY);
  const [users, setUsers] = useState<UserProfile[]>(DEMO_USERS);
  const [jurisdictions, setJurisdictions] = useState<JurisdictionNode[]>(DEMO_JURISDICTIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(DEMO_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // 1. Initial LocalStorage restoration on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const loadStored = <T,>(key: string, fallback: T): T => {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) return fallback;
          const parsed = JSON.parse(raw);
          if (Array.isArray(fallback)) {
            return Array.isArray(parsed) && parsed.length > 0 ? (parsed as T) : fallback;
          }
          return (parsed as T) ?? fallback;
        } catch (e) {
          console.warn(`[SentinelStorage] Could not parse stored ${key}, using defaults:`, e);
          return fallback;
        }
      };

      setScans(loadStored(STORAGE_KEYS.SCANS, DEMO_SCANS));
      setComplaints(loadStored(STORAGE_KEYS.COMPLAINTS, DEMO_COMPLAINTS));
      setInspections(loadStored(STORAGE_KEYS.INSPECTIONS, DEMO_INSPECTIONS));
      setCases(loadStored(STORAGE_KEYS.CASES, DEMO_CASES));
      setRules(loadStored(STORAGE_KEYS.RULES, STATUTORY_RULES_REGISTRY));
      setUsers(loadStored(STORAGE_KEYS.USERS, DEMO_USERS));
      setJurisdictions(loadStored(STORAGE_KEYS.JURISDICTIONS, DEMO_JURISDICTIONS));
      setAuditLogs(loadStored(STORAGE_KEYS.AUDIT_LOGS, DEMO_AUDIT_LOGS));
      const savedUser = loadStored<AuthUser | null>(STORAGE_KEYS.CURRENT_USER, null);
      if (savedUser && savedUser.id) {
        setCurrentUser(savedUser);
      }
    } catch (err) {
      console.warn('[SentinelStorage] Initialization error:', err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // 2. Synchronize state changes to localStorage once hydrated
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(scans));
    } catch (e) {
      console.warn('[SentinelStorage] Error saving scans:', e);
    }
  }, [scans, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
    } catch (e) {
      console.warn('[SentinelStorage] Error saving complaints:', e);
    }
  }, [complaints, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(inspections));
    } catch (e) {
      console.warn('[SentinelStorage] Error saving inspections:', e);
    }
  }, [inspections, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
    } catch (e) {
      console.warn('[SentinelStorage] Error saving cases:', e);
    }
  }, [cases, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
    } catch (e) {
      console.warn('[SentinelStorage] Error saving rules:', e);
    }
  }, [rules, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.warn('[SentinelStorage] Error saving users:', e);
    }
  }, [users, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.JURISDICTIONS, JSON.stringify(jurisdictions));
    } catch (e) {
      console.warn('[SentinelStorage] Error saving jurisdictions:', e);
    }
  }, [jurisdictions, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
    } catch (e) {
      console.warn('[SentinelStorage] Error saving audit logs:', e);
    }
  }, [auditLogs, isHydrated]);

  // 3. Cross-tab and multi-window synchronization via window storage events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.CURRENT_USER) {
        try {
          setCurrentUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {}
        return;
      }
      if (!e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (!Array.isArray(parsed)) return;

        switch (e.key) {
          case STORAGE_KEYS.SCANS:
            setScans(parsed);
            break;
          case STORAGE_KEYS.COMPLAINTS:
            setComplaints(parsed);
            break;
          case STORAGE_KEYS.INSPECTIONS:
            setInspections(parsed);
            break;
          case STORAGE_KEYS.CASES:
            setCases(parsed);
            break;
          case STORAGE_KEYS.RULES:
            setRules(parsed);
            break;
          case STORAGE_KEYS.USERS:
            setUsers(parsed);
            break;
          case STORAGE_KEYS.JURISDICTIONS:
            setJurisdictions(parsed);
            break;
          case STORAGE_KEYS.AUDIT_LOGS:
            setAuditLogs(parsed);
            break;
        }
      } catch (err) {
        console.warn('[SentinelStorage] Error syncing storage event:', err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Show a toast notification
  const showNotification = (
    type: 'success' | 'warning' | 'error' | 'info',
    title: string,
    message: string
  ) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setNotifications((prev) => [...prev, { id, type, title, message }]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const resetToDefaults = () => {
    setScans(DEMO_SCANS);
    setComplaints(DEMO_COMPLAINTS);
    setInspections(DEMO_INSPECTIONS);
    setCases(DEMO_CASES);
    setRules(STATUTORY_RULES_REGISTRY);
    setUsers(DEMO_USERS);
    setJurisdictions(DEMO_JURISDICTIONS);
    setAuditLogs(DEMO_AUDIT_LOGS);
    setCurrentUser(null);

    if (typeof window !== 'undefined') {
      try {
        Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
      } catch (e) {
        console.warn('[SentinelStorage] Error clearing storage:', e);
      }
    }
    showNotification('info', 'Data Reset to Defaults', 'All records restored to statutory standard demonstrations.');
  };

  const login = (
    email: string,
    password?: string,
    requestedPortal?: 'citizen' | 'officer' | 'admin'
  ): { success: boolean; error?: string; user?: AuthUser } => {
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      return { success: false, error: 'Email or User ID is required.' };
    }

    const matched = users.find(
      (u) =>
        u.email.toLowerCase() === normalized ||
        u.id.toLowerCase() === normalized ||
        (u.badgeNumber && u.badgeNumber.toLowerCase() === normalized)
    );

    if (!matched) {
      return {
        success: false,
        error: `Account '${email}' not found in directory. In demo mode, please use an authorized demo credential.`,
      };
    }

    if (matched.status === 'SUSPENDED') {
      return {
        success: false,
        error: `Account '${matched.email}' is currently SUSPENDED by the National Directorate.`,
      };
    }

    // Role validation against requested portal
    if (requestedPortal === 'citizen' && matched.role !== 'CITIZEN') {
      return {
        success: false,
        error: `Access Denied: Account '${matched.email}' holds role ${matched.role}. This role is not authorized for the Citizen Portal.`,
      };
    }

    if (requestedPortal === 'officer' && matched.role !== 'OFFICER' && matched.role !== 'CONTROLLER') {
      return {
        success: false,
        error: `Access Denied: Account '${matched.email}' holds role ${matched.role}. Access to the Officer Portal requires Legal Metrology Officer (LMO) credentials.`,
      };
    }

    if (requestedPortal === 'admin' && matched.role !== 'ADMIN') {
      return {
        success: false,
        error: `Access Denied: Account '${matched.email}' holds role ${matched.role}. Access to the Admin Portal requires National Directorate Administrator credentials.`,
      };
    }

    const authUser: AuthUser = {
      id: matched.id,
      name: matched.name,
      email: matched.email,
      role: matched.role,
      badgeNumber: matched.badgeNumber,
      jurisdictionId: matched.jurisdictionId,
      jurisdictionName: matched.jurisdictionName,
    };

    setCurrentUser(authUser);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(authUser));
      } catch (e) {
        console.warn('[SentinelStorage] Error saving current user:', e);
      }
    }
    showNotification('success', 'Authentication Successful', `Signed in as ${authUser.name} (${authUser.role}).`);
    return { success: true, user: authUser };
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      } catch (e) {
        console.warn('[SentinelStorage] Error clearing current user:', e);
      }
    }
    showNotification('info', 'Signed Out', 'You have been signed out of your portal session.');
  };

  const addScan = (newScan: ComplianceDossier) => {
    setScans((prev) => [newScan, ...prev]);
    showNotification('success', 'Scan Dossier Saved', `Product "${newScan.productName}" added to scan ledger.`);

    // Append to audit logs
    const audit: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorEmail: 'public.citizen@sentinel.org',
      actorRole: 'CITIZEN',
      actionType: 'INSPECTION_LOGGED',
      targetResource: newScan.id,
      details: `Compliance scan performed for barcode ${newScan.barcode} (${newScan.overallStatus}).`,
      ipAddress: '127.0.0.1 (Web Portal)',
      hash: Math.random().toString(36).substring(2, 15),
    };
    setAuditLogs((prev) => [audit, ...prev]);
  };

  const addComplaint = (data: Omit<CitizenComplaint, 'id' | 'submittedAt' | 'status'>) => {
    const id = `CMP-2026-${1045 + complaints.length}`;
    const newComplaint: CitizenComplaint = {
      ...data,
      id,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'SUBMITTED',
    };
    setComplaints((prev) => [newComplaint, ...prev]);
    showNotification(
      'success',
      'Complaint Registered Successfully',
      `Filing Reference: ${id}. Routed to Legal Metrology Officer Inbox.`
    );
    return id;
  };

  const updateComplaintStatus = (id: string, status: ComplaintStatus, remarks?: string) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status, officerRemarks: remarks || c.officerRemarks } : c))
    );
    showNotification('info', 'Complaint Status Updated', `Complaint ${id} marked as ${status}.`);
  };

  const resolveReviewQueueItem = (
    dossierId: string,
    ruleId: string,
    newStatus: ComplianceStatus,
    officerNotes: string
  ) => {
    setScans((prev) =>
      prev.map((scan) => {
        if (scan.id !== dossierId) return scan;

        const updatedEvals = scan.evaluations.map((ev) => {
          if (ev.ruleId === ruleId) {
            return {
              ...ev,
              status: newStatus,
              requiresOfficerReview: false,
              findingNotes: `Officer Review Completed: ${officerNotes}`,
            };
          }
          return ev;
        });

        // Recompute overall status
        const hasFail = updatedEvals.some((e) => e.status === 'FAIL');
        const hasNeedsReview = updatedEvals.some((e) => e.status === 'NEEDS_REVIEW');
        const overallStatus: ComplianceStatus = hasFail ? 'FAIL' : hasNeedsReview ? 'NEEDS_REVIEW' : 'PASS';

        return {
          ...scan,
          evaluations: updatedEvals,
          overallStatus,
          officerNotes,
          reviewedByOfficer: 'Inspector Vikram Anand',
          reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          declarationsCount: {
            ...scan.declarationsCount,
            passed: updatedEvals.filter((e) => e.status === 'PASS').length,
            failed: updatedEvals.filter((e) => e.status === 'FAIL').length,
            needsReview: updatedEvals.filter((e) => e.status === 'NEEDS_REVIEW').length,
          },
        };
      })
    );

    // Audit log
    const audit: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorEmail: 'v.anand@delhi.gov.in',
      actorRole: 'OFFICER',
      actionType: 'VERDICT_OVERRIDDEN',
      targetResource: `${dossierId} / ${ruleId}`,
      details: `Officer adjudicated declaration to ${newStatus}. Notes: ${officerNotes}`,
      ipAddress: '10.24.112.85',
      hash: Math.random().toString(36).substring(2, 15),
    };
    setAuditLogs((prev) => [audit, ...prev]);

    showNotification('success', 'Review Decision Recorded', `Dossier ${dossierId} updated to ${newStatus}.`);
  };

  const addInspection = (data: Omit<EnforcementInspection, 'id'>) => {
    const id = `INSP-2026-0${302 + inspections.length}`;
    const newInsp: EnforcementInspection = { ...data, id };
    setInspections((prev) => [newInsp, ...prev]);
    showNotification('success', 'Inspection Created', `Inspection order ${newInsp.inspectionCode} scheduled.`);
  };

  const updateInspectionStatus = (id: string, status: InspectionStatus, notes?: string) => {
    setInspections((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status, notes: notes || i.notes } : i))
    );
    showNotification('info', 'Inspection Updated', `Inspection ${id} marked as ${status}.`);
  };

  const addCase = (data: Omit<EnforcementCase, 'id'>) => {
    const id = `CASE-2026-00${82 + cases.length}`;
    const newCase: EnforcementCase = { ...data, id };
    setCases((prev) => [newCase, ...prev]);
    showNotification('success', 'Legal Metrology Docket Filed', `Case ${newCase.caseDocketNumber} registered.`);
  };

  const updateCaseStatus = (id: string, status: CaseStatus, penalty?: number) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status, penaltyAmountInr: penalty !== undefined ? penalty : c.penaltyAmountInr }
          : c
      )
    );
    showNotification('info', 'Legal Case Updated', `Case ${id} docket updated to ${status}.`);
  };

  const toggleRuleActive = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, active: !r.active } : r))
    );
    showNotification('info', 'Rule Registry Updated', `Rule status toggled for ${ruleId}.`);
  };

  const updateRule = (updated: StatutoryRuleDefinition) => {
    setRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    showNotification('success', 'Rule Specification Saved', `Statutory definition for ${updated.section} updated.`);
  };

  const addUser = (data: Omit<UserProfile, 'id' | 'createdAt'>) => {
    const id = `USR-00${7 + users.length}`;
    const newUser: UserProfile = {
      ...data,
      id,
      createdAt: new Date().toISOString().substring(0, 10),
    };
    setUsers((prev) => [...prev, newUser]);
    showNotification('success', 'User Enrolled', `${newUser.name} enrolled with role ${newUser.role}.`);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          showNotification(
            nextStatus === 'ACTIVE' ? 'success' : 'warning',
            'User Status Updated',
            `${u.name} status changed to ${nextStatus}.`
          );
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const addJurisdiction = (data: Omit<JurisdictionNode, 'id'>) => {
    const id = `JUR-00${4 + jurisdictions.length}`;
    const newJur: JurisdictionNode = { ...data, id };
    setJurisdictions((prev) => [...prev, newJur]);
    showNotification('success', 'Jurisdiction Registered', `${newJur.name} (${newJur.code}) enrolled.`);
  };

  return (
    <SentinelContext.Provider
      value={{
        scans,
        complaints,
        inspections,
        cases,
        rules,
        users,
        jurisdictions,
        auditLogs,
        notifications,
        isHydrated,
        currentUser,
        login,
        logout,
        addScan,
        addComplaint,
        updateComplaintStatus,
        resolveReviewQueueItem,
        addInspection,
        updateInspectionStatus,
        addCase,
        updateCaseStatus,
        toggleRuleActive,
        updateRule,
        addUser,
        toggleUserStatus,
        addJurisdiction,
        dismissNotification,
        showNotification,
        resetToDefaults,
      }}
    >
      {children}
    </SentinelContext.Provider>
  );
}

export function useSentinel() {
  const context = useContext(SentinelContext);
  if (!context) {
    throw new Error('useSentinel must be used within a SentinelProvider');
  }
  return context;
}
