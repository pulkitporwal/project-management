// Database Models Index File
// Project Management + Employee Performance Management SaaS Platform

export { User } from './User';
export type { IUser } from './User';
export { Team } from './Team';
export type { ITeam } from './Team';
export { Project } from './Project';
export type { IProject } from './Project';
export { Task } from './Task';
export type { ITask } from './Task';
export { Milestone } from './Milestone';
export type { IMilestone } from './Milestone';
export { TimeLog } from './TimeLog';
export type { ITimeLog } from './TimeLog';
export { Comment } from './Comment';
export type { IComment } from './Comment';
export { Notification } from './Notification';
export type { INotification } from './Notification';
export { Attachment } from './Attachment';
export type { IAttachment } from './Attachment';
export { PerformanceReview } from './PerformanceReview';
export type { IPerformanceReview } from './PerformanceReview';
export { OKR } from './OKR';
export type { IOKR } from './OKR';
export { Skill } from './Skill';
export type { ISkill } from './Skill';
export { SkillAssessment } from './SkillAssessment';
export type { ISkillAssessment } from './SkillAssessment';
export { Feedback } from './Feedback';
export type { IFeedback } from './Feedback';
export { AIReport } from './AIReport';
export type { IAIReport } from './AIReport';
export { AuditLog } from './AuditLog';
export type { IAuditLog } from './AuditLog';
export { Settings } from './Settings';
export type { ISettings } from './Settings';

// Import all models to ensure they are registered with Mongoose
import './User';
import './Team';
import './Project';
import './Task';
import './Milestone';
import './TimeLog';
import './Comment';
import './Notification';
import './Attachment';
import './PerformanceReview';
import './OKR';
import './Skill';
import './SkillAssessment';
import './Feedback';
import './AIReport';
import './AuditLog';
import './Settings';
