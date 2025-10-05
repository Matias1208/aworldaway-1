import type {
	AuthResponse,
	LoginRequest,
	RegisterRequest,
	User,
	ChangePasswordRequest,
	ExoplanetCandidate,
	AnalysisResult,
	AnalysisSession,
	CreateSessionRequest,
	UpdateSessionRequest,
	ResearcherFeedback,
	SubmitFeedbackRequest,
	UpdateFeedbackRequest,
	ConsensusResponse,
	ResearcherStats,
	BulkAnalysisStatus,
	PaginatedResponse,
	PaginationParams,
	CandidateFilters,
	FinalVerdict,
} from './api-types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

class ApiClient {
	private baseUrl: string;
	private token: string | null = null;

	constructor(baseUrl: string = API_BASE_URL) {
		this.baseUrl = baseUrl;
		this.loadToken();
	}

	private loadToken(): void {
		this.token = localStorage.getItem('auth_token');
	}

	private saveToken(token: string): void {
		this.token = token;
		localStorage.setItem('auth_token', token);
	}

	private clearToken(): void {
		this.token = null;
		localStorage.removeItem('auth_token');
	}

	private getHeaders(includeAuth: boolean = true): HeadersInit {
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
		};

		if (includeAuth && this.token) {
			headers.Authorization = `Bearer ${this.token}`;
		}

		return headers;
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {},
		requireAuth: boolean = true
	): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;
		const headers = this.getHeaders(requireAuth);

		const response = await fetch(url, {
			...options,
			headers: {
				...headers,
				...options.headers,
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
			throw new Error(errorData.detail || `HTTP ${response.status}`);
		}

		return response.json();
	}

	// Authentication Methods
	async register(data: RegisterRequest): Promise<AuthResponse> {
		const response = await this.request<AuthResponse>('/auth/register', {
			method: 'POST',
			body: JSON.stringify(data),
		}, false);

		this.saveToken(response.access_token);
		return response;
	}

	async login(data: LoginRequest): Promise<AuthResponse> {
		const response = await this.request<AuthResponse>('/auth/login', {
			method: 'POST',
			body: JSON.stringify(data),
		}, false);

		this.saveToken(response.access_token);
		return response;
	}

	async logout(): Promise<void> {
		this.clearToken();
	}

	async getProfile(): Promise<User> {
		return this.request<User>('/auth/me');
	}

	async updateProfile(data: Partial<User>): Promise<User> {
		return this.request<User>('/auth/me', {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	async deleteAccount(): Promise<void> {
		await this.request<void>('/auth/me', {
			method: 'DELETE',
		});
		this.clearToken();
	}

	async changePassword(data: ChangePasswordRequest): Promise<void> {
		return this.request<void>('/auth/me/change-password', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async listUsers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
		const searchParams = new URLSearchParams();
		if (params?.skip) searchParams.set('skip', params.skip.toString());
		if (params?.limit) searchParams.set('limit', params.limit.toString());

		const query = searchParams.toString();
		return this.request<PaginatedResponse<User>>(`/auth/users${query ? `?${query}` : ''}`);
	}

	async getUser(userId: string): Promise<User> {
		return this.request<User>(`/auth/users/${userId}`);
	}

	// Data Upload Methods
	async uploadCsv(file: File): Promise<{ message: string; candidates_created: number }> {
		const formData = new FormData();
		formData.append('file', file);

		const response = await fetch(`${this.baseUrl}/data/upload-csv`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${this.token}`,
			},
			body: formData,
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }));
			throw new Error(errorData.detail || `HTTP ${response.status}`);
		}

		return response.json();
	}

	async getMyUploads(params?: PaginationParams): Promise<PaginatedResponse<ExoplanetCandidate>> {
		const searchParams = new URLSearchParams();
		if (params?.skip) searchParams.set('skip', params.skip.toString());
		if (params?.limit) searchParams.set('limit', params.limit.toString());

		const query = searchParams.toString();
		return this.request<PaginatedResponse<ExoplanetCandidate>>(`/data/uploads/me${query ? `?${query}` : ''}`);
	}

	async getUploadDetails(candidateId: string): Promise<ExoplanetCandidate> {
		return this.request<ExoplanetCandidate>(`/data/uploads/${candidateId}`);
	}

	async deleteUpload(candidateId: string): Promise<void> {
		return this.request<void>(`/data/uploads/${candidateId}`, {
			method: 'DELETE',
		});
	}

	async listAllCandidates(filters?: CandidateFilters): Promise<PaginatedResponse<ExoplanetCandidate>> {
		const searchParams = new URLSearchParams();
		if (filters?.skip) searchParams.set('skip', filters.skip.toString());
		if (filters?.limit) searchParams.set('limit', filters.limit.toString());
		if (filters?.status_filter) searchParams.set('status_filter', filters.status_filter);
		if (filters?.verdict_filter) searchParams.set('verdict_filter', filters.verdict_filter);

		const query = searchParams.toString();
		return this.request<PaginatedResponse<ExoplanetCandidate>>(`/data/candidates${query ? `?${query}` : ''}`);
	}

	// Analysis Methods
	async analyzeCandidate(candidateId: string): Promise<AnalysisResult> {
		return this.request<AnalysisResult>(`/analysis/predict/${candidateId}`, {
			method: 'POST',
		});
	}

	async getResults(candidateId: string): Promise<AnalysisResult> {
		return this.request<AnalysisResult>(`/analysis/results/${candidateId}`);
	}

	async updateVerdict(candidateId: string, verdict: FinalVerdict): Promise<void> {
		return this.request<void>(`/analysis/results/${candidateId}/verdict?verdict=${verdict}`, {
			method: 'PUT',
		});
	}

	async createSession(data: CreateSessionRequest): Promise<AnalysisSession> {
		return this.request<AnalysisSession>('/analysis/sessions', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async getSession(sessionId: string): Promise<AnalysisSession> {
		return this.request<AnalysisSession>(`/analysis/sessions/${sessionId}`);
	}

	async updateSession(sessionId: string, data: UpdateSessionRequest): Promise<AnalysisSession> {
		return this.request<AnalysisSession>(`/analysis/sessions/${sessionId}`, {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	async getCandidateSessions(candidateId: string): Promise<AnalysisSession[]> {
		return this.request<AnalysisSession[]>(`/analysis/sessions/candidate/${candidateId}`);
	}

	async getPendingCandidates(limit?: number): Promise<ExoplanetCandidate[]> {
		const query = limit ? `?limit=${limit}` : '';
		return this.request<ExoplanetCandidate[]>(`/analysis/candidates/pending${query}`);
	}

	async bulkAnalyze(filename?: string, userCandidatesOnly?: boolean): Promise<{ message: string }> {
		const searchParams = new URLSearchParams();
		if (filename) searchParams.set('filename', filename);
		if (userCandidatesOnly !== undefined) searchParams.set('user_candidates_only', userCandidatesOnly.toString());

		const query = searchParams.toString();
		return this.request<{ message: string }>(`/analysis/bulk-predict${query ? `?${query}` : ''}`, {
			method: 'POST',
		});
	}

	async getBulkStatus(filename?: string): Promise<BulkAnalysisStatus> {
		const query = filename ? `?filename=${filename}` : '';
		return this.request<BulkAnalysisStatus>(`/analysis/bulk-status${query}`);
	}

	// Feedback Methods
	async submitFeedback(data: SubmitFeedbackRequest): Promise<ResearcherFeedback> {
		return this.request<ResearcherFeedback>('/feedback/submit', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async getCandidateFeedback(candidateId: string): Promise<ResearcherFeedback[]> {
		return this.request<ResearcherFeedback[]>(`/feedback/candidate/${candidateId}`);
	}

	async getMyFeedback(params?: PaginationParams): Promise<PaginatedResponse<ResearcherFeedback>> {
		const searchParams = new URLSearchParams();
		if (params?.skip) searchParams.set('skip', params.skip.toString());
		if (params?.limit) searchParams.set('limit', params.limit.toString());

		const query = searchParams.toString();
		return this.request<PaginatedResponse<ResearcherFeedback>>(`/feedback/my-feedback${query ? `?${query}` : ''}`);
	}

	async updateFeedback(feedbackId: string, data: UpdateFeedbackRequest): Promise<ResearcherFeedback> {
		return this.request<ResearcherFeedback>(`/feedback/${feedbackId}`, {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	async deleteFeedback(feedbackId: string): Promise<void> {
		return this.request<void>(`/feedback/${feedbackId}`, {
			method: 'DELETE',
		});
	}

	async getFeedback(feedbackId: string): Promise<ResearcherFeedback> {
		return this.request<ResearcherFeedback>(`/feedback/${feedbackId}`);
	}

	async getConsensus(candidateId: string): Promise<ConsensusResponse> {
		return this.request<ConsensusResponse>(`/feedback/consensus/${candidateId}`);
	}

	async getResearcherStats(researcherId: string): Promise<ResearcherStats> {
		return this.request<ResearcherStats>(`/feedback/researcher/${researcherId}/stats`);
	}

	async getMyStats(): Promise<ResearcherStats> {
		return this.request<ResearcherStats>('/feedback/my-stats');
	}

	// Utility Methods
	async healthCheck(): Promise<{ status: string }> {
		return this.request<{ status: string }>('/health', {}, false);
	}

	isAuthenticated(): boolean {
		return !!this.token;
	}
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;