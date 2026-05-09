import {
  AgentInfo,
  FeedItem,
  IntentItem,
  ResearchItem,
  VerifyItem
} from './models';

export const VERIFY_ITEMS: VerifyItem[] = [
  {
    id: 1,
    file: 'Appeal_266_Docs.pdf',
    type: 'PDF',
    channel: 'Fax',
    pages: 12,
    time: '5m ago',
    confidence: 84,
    audit: 'AUD-2026-78432',
    patient: 'Martinez, Robert J.',
    claim: 'CLM-ABC-998341',
    provider: 'Memorial Regional',
    reason: "Name variation: 'Rob' vs 'Robert'",
    locked: false
  },
  {
    id: 2,
    file: 'MR_Additional_8827.pdf',
    type: 'PDF',
    channel: 'Portal',
    pages: 48,
    time: '18m ago',
    confidence: 91,
    audit: 'AUD-2026-91102',
    patient: 'Chen, Michelle L.',
    claim: 'CLM-DEF-112847',
    provider: 'Cedars-Sinai',
    reason: 'DOS mismatch within tolerance (±2 days)',
    locked: true,
    lockedBy: 'SK'
  },
  {
    id: 3,
    file: 'Fax_Inbound_0121.tif',
    type: 'TIF',
    channel: 'Fax',
    pages: 8,
    time: '32m ago',
    confidence: 86,
    audit: 'AUD-2026-88521',
    patient: 'Williams, James T.',
    claim: 'CLM-GHI-554231',
    provider: 'Johns Hopkins',
    reason: 'Provider ID partial match',
    locked: false
  },
  {
    id: 4,
    file: 'Portal_Records_5521.pdf',
    type: 'PDF',
    channel: 'Portal',
    pages: 156,
    time: '45m ago',
    confidence: 89,
    audit: 'AUD-2026-77841',
    patient: 'Johnson, Patricia A.',
    claim: 'CLM-JKL-887123',
    provider: 'Mayo Clinic',
    reason: 'Multiple candidate audits (2 matches)',
    locked: false
  },
  {
    id: 5,
    file: 'SFTP_Batch_Record.pdf',
    type: 'PDF',
    channel: 'SFTP',
    pages: 24,
    time: '1h ago',
    confidence: 82,
    audit: 'AUD-2026-65892',
    patient: 'Davis, Michael R.',
    claim: 'CLM-MNO-223456',
    provider: 'Cleveland Clinic',
    reason: 'Low overall confidence score',
    locked: true,
    lockedBy: 'JR'
  }
];

export const RESEARCH_ITEMS: ResearchItem[] = [
  {
    id: 10,
    file: 'Fax_NoLetter_0121.tif',
    type: 'TIF',
    channel: 'Fax',
    pages: 14,
    time: '12m ago',
    badge: 'No Match',
    badgeColor: '#f59e0b',
    reason: 'No CGI letter + payer iteration exhausted',
    locked: false
  },
  {
    id: 11,
    file: 'SFTP_MultiMatch.pdf',
    type: 'PDF',
    channel: 'SFTP',
    pages: 36,
    time: '45m ago',
    badge: 'Multi-Match',
    badgeColor: '#f59e0b',
    reason: '3 possible audit matches found',
    locked: false
  },
  {
    id: 12,
    file: 'Portal_MultiDOS_9921.pdf',
    type: 'PDF',
    channel: 'Portal',
    pages: 82,
    time: '1h ago',
    badge: 'Multi-Encounter',
    badgeColor: '#8b5cf6',
    reason: 'Multiple DOS detected: 10/03-10/08, 11/14-11/18',
    locked: true,
    lockedBy: 'DM'
  }
];

export const INTENT_ITEMS: IntentItem[] = [
  {
    id: 20,
    file: 'Provider_Response_4521.pdf',
    type: 'PDF',
    channel: 'Portal',
    pages: 6,
    time: '28m ago',
    badge: 'Conflict',
    badgeColor: '#f59e0b',
    reason: 'Checkbox: Agree · Comments: partial disagreement',
    scenario: 'conflict',
    audit: 'AUD-2026-55210',
    patient: 'Thompson, Karen M.'
  },
  {
    id: 21,
    file: 'Fax_Response_0892.pdf',
    type: 'PDF',
    channel: 'Fax',
    pages: 4,
    time: '1h ago',
    badge: 'Low Conf',
    badgeColor: '#dc2626',
    reason: 'Intent confidence 62% · Checkbox unclear',
    scenario: 'low-conf',
    audit: 'AUD-2026-44781',
    patient: 'Baker, William S.'
  },
  {
    id: 22,
    file: 'SFTP_ProvDocs_7741.pdf',
    type: 'PDF',
    channel: 'SFTP',
    pages: 38,
    time: '2h ago',
    badge: 'No Form',
    badgeColor: '#8b5cf6',
    reason: 'No Provider Response Form detected in packet',
    scenario: 'no-form',
    audit: 'AUD-2026-71083',
    patient: 'Rodriguez, Maria L.'
  }
];

export const FEED_ITEMS: FeedItem[] = [
  {
    type: 'processing',
    file: 'SFTP_Batch_0121_007.pdf',
    meta: 'OCR complete · Running classification',
    time: 'Just now'
  },
  {
    type: 'success',
    file: 'MR_570f2c8_Records.pdf',
    meta: 'Auto-indexed at 97% confidence → AVA, Audit Studio',
    time: '2m ago'
  },
  {
    type: 'handoff',
    file: 'Appeal_266_Docs.pdf',
    meta: 'Sent to Verification · 84% confidence',
    reason: "Name variation: 'Rob' vs 'Robert'",
    time: '5m ago'
  },
  {
    type: 'success',
    file: 'Portal_Upload_5UB.pdf',
    meta: 'Auto-indexed at 98% confidence → AVA',
    time: '8m ago'
  },
  {
    type: 'handoff',
    file: 'Fax_NoLetter_0121.tif',
    meta: 'Sent to Research · No matching audit found',
    reason: 'No request letter · Payer ID extraction failed',
    time: '12m ago'
  },
  {
    type: 'error',
    file: 'Fax_Corrupted_0094.tif',
    meta: 'Processing failed · OCR returned empty',
    time: '15m ago'
  }
];

export const AGENTS: AgentInfo[] = [
  { name: 'Indexing & Reconciliation', status: 'Processing' },
  { name: 'Clinical NLP Classification', status: 'Active' },
  { name: 'Document Completeness', status: 'Active' },
  { name: 'Intent Analysis', status: 'Idle' }
];
