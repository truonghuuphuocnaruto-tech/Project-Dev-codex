/**
 * Game Data Model for Detective Investigation System
 * Định nghĩa cấu trúc dữ liệu cho vụ án trinh thám
 */

export type EvidenceType = 'physical' | 'document' | 'digital' | 'testimony' | 'forensic';

export interface IEvidence {
  id: string;
  title: string;
  type: EvidenceType;
  description: string;
  details: string;
  locationFound: string;
  icon?: string;
  isKeyEvidence: boolean;
  discoveredAt?: string;
  relatedSuspectId?: string;
}

export interface ISuspect {
  id: string;
  name: string;
  role: string;
  age: number;
  avatar?: string;
  bio: string;
  relationToVictim: string;
  motive: string;
  alibi: string;
  suspicionLevel: 'low' | 'medium' | 'high';
  initialDialogueId: string;
  isCulprit: boolean;
}

export interface IDialogueOption {
  id: string;
  text: string;
  nextNodeId?: string;
  requiredEvidenceId?: string;
  unlockEvidenceId?: string;
  triggerContradiction?: boolean;
  isEnd?: boolean;
}

export interface IDialogueNode {
  id: string;
  suspectId?: string;
  speaker: string;
  text: string;
  options: IDialogueOption[];
  evidenceUnlocked?: string;
  isQuestioningAlibi?: boolean;
  isEnd?: boolean;
}

export interface IHotspot {
  id: string;
  title: string;
  description: string;
  x: number; // Tọa độ phần trăm (%) chiều ngang trên hiện trường (0 - 100)
  y: number; // Tọa độ phần trăm (%) chiều dọc trên hiện trường (0 - 100)
  sceneId: string;
  evidenceId?: string;
  discovered: boolean;
  hint?: string;
}

export type BoardNodeType = 'victim' | 'suspect' | 'evidence' | 'timeline' | 'motive' | 'contradiction';

export interface IBoardNode {
  id: string;
  type: BoardNodeType;
  title: string;
  description: string;
  x: number;
  y: number;
  referenceId?: string; // id của IEvidence, ISuspect hoặc mốc thời gian
  pinned?: boolean;
  isContradiction?: boolean;
}

export type ConnectionType = 'corroborates' | 'contradicts' | 'suspects' | 'timeline' | 'motive';

export interface IConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label: string;
  type: ConnectionType;
  description?: string;
}

export interface ITimelineConflict {
  criticalTime: string; // Mốc thời gian mâu thuẫn (e.g. "22:15")
  claimedAlibi: string;
  contradictoryEvidenceIds: string[];
  explanation: string;
}

export interface IVerdict {
  caseId: string;
  culpritId: string;
  culpritName: string;
  keyEvidenceIds: string[];
  timelineConflict: ITimelineConflict;
  motive: string;
  method: string;
  fullDeduction: string;
  conclusion: string;
}

export interface IVictim {
  name: string;
  age: number;
  role: string;
  causeOfDeath: string;
  estimatedTimeOfDeath: string;
  location: string;
  description: string;
}

export interface ICase {
  id: string;
  title: string;
  subtitle: string;
  synopsis: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó' | 'Cực khó';
  victim: IVictim;
  suspects: ISuspect[];
  evidence: IEvidence[];
  dialogues: Record<string, IDialogueNode>;
  hotspots: IHotspot[];
  boardNodes: IBoardNode[];
  connections: IConnection[];
  verdict: IVerdict;
}
