// API Types based on backend specification
export type AnalysisStatus = "pending" | "processing" | "completed" | "error";
export type FinalVerdict = "pending" | "confirmed" | "false_positive" | "candidate";
export type UserRole = "researcher" | "admin" | "moderator";
export type VerificationStatus = "pending" | "verified" | "rejected";

// Authentication Types
export interface RegisterRequest {
	username: string;
	email: string;
	password: string;
	full_name?: string;
	research_specialization?: string;
	organization_id?: string;
	bio?: string;
	role?: UserRole;
}

export interface LoginRequest {
	username: string;
	password: string;
}

export interface AuthResponse {
	access_token: string;
	token_type: string;
	user: User;
}

export interface User {
	id: string;
	username: string;
	email: string;
	full_name?: string;
	research_specialization?: string;
	organization_id?: string;
	bio?: string;
	role: UserRole;
	is_active: boolean;
	created_at: string;
}

export interface ChangePasswordRequest {
	current_password: string;
	new_password: string;
}

// Exoplanet Candidate Types
export interface ExoplanetCandidate {
	id: string;
	kepid: number;
	kepoi_name?: string;
	koi_period?: number;
	koi_depth?: number;
	koi_prad?: number;
	koi_model_snr?: number;
	koi_kepmag?: number;
	koi_teq?: number;
	koi_score?: number;
	analysis_status: AnalysisStatus;
	final_verdict: FinalVerdict;
	ai_prediction?: number;
	consensus_score?: number;
	uploaded_by: string;
	uploaded_at: string;
	updated_at: string;
}

// Analysis Types
export interface AnalysisResult {
	id: string;
	candidate_id: string;
	ai_prediction: number;
	confidence_score: number;
	analysis_timestamp: string;
	model_version: string;
	feature_importance?: Record<string, number>;
}

export interface AnalysisSession {
	id: string;
	candidate_id: string;
	researcher_id: string;
	session_timestamp: string;
	researcher_verdict?: FinalVerdict;
	time_spent_analyzing?: number;
	notes?: string;
	created_at: string;
	updated_at: string;
}

export interface CreateSessionRequest {
	candidate_id: string;
}

export interface UpdateSessionRequest {
	researcher_verdict?: FinalVerdict;
	time_spent_analyzing?: number;
	notes?: string;
}

// Feedback Types
export interface ResearcherFeedback {
	id: string;
	candidate_id: string;
	researcher_id: string;
	expert_classification: FinalVerdict;
	detailed_reasoning: string;
	confidence_score: number;
	agrees_with_ai?: boolean;
	created_at: string;
	updated_at: string;
}

export interface SubmitFeedbackRequest {
	candidate_id: string;
	expert_classification: FinalVerdict;
	detailed_reasoning: string;
	confidence_score: number;
	agrees_with_ai?: boolean;
}

export interface UpdateFeedbackRequest {
	expert_classification?: FinalVerdict;
	detailed_reasoning?: string;
	confidence_score?: number;
	agrees_with_ai?: boolean;
}

export interface ConsensusResponse {
	candidate_id: string;
	consensus_score: number;
	total_feedback_count: number;
	verdict_distribution: Record<FinalVerdict, number>;
}

export interface ResearcherStats {
	researcher_id: string;
	total_feedback_count: number;
	verdict_distribution: Record<FinalVerdict, number>;
	average_confidence: number;
	agreement_with_ai_percentage: number;
}

// Bulk Analysis Types
export interface BulkAnalysisRequest {
	filename?: string;
	user_candidates_only?: boolean;
}

export interface BulkAnalysisStatus {
	filename: string;
	status: AnalysisStatus;
	total_candidates: number;
	processed_candidates: number;
	started_at: string;
	completed_at?: string;
	error_message?: string;
}

// API Response Types
export interface ApiResponse<T> {
	data: T;
	message?: string;
}

export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	skip: number;
	limit: number;
}

export interface ApiError {
	detail: string;
	status_code: number;
}

// Query Parameters
export interface PaginationParams {
	skip?: number;
	limit?: number;
}

export interface CandidateFilters extends PaginationParams {
	status_filter?: AnalysisStatus;
	verdict_filter?: FinalVerdict;
}