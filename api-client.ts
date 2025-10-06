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

const API_BASE_URL = '/api/v1';

// Configuración de debug
const DEBUG_MODE = true; // Cambiar a false en producción

class ApiClient {
	private baseUrl: string;
	private token: string | null = null;

	constructor(baseUrl: string = API_BASE_URL) {
		this.baseUrl = baseUrl;
		this.loadToken();
		this.log('ApiClient initialized', { baseUrl: this.baseUrl });
	}

	private log(message: string, data?: any): void {
		if (DEBUG_MODE) {
			console.log(`[ApiClient] ${message}`, data || '');
		}
	}

	private logError(message: string, error?: any): void {
		console.error(`[ApiClient Error] ${message}`, error || '');
	}

	private loadToken(): void {
		try {
			this.token = localStorage.getItem('auth_token');
			this.log('Token loaded', { hasToken: !!this.token });
		} catch (error) {
			this.logError('Failed to load token from localStorage', error);
		}
	}

	private saveToken(token: string): void {
		try {
			this.token = token;
			localStorage.setItem('auth_token', token);
			this.log('Token saved');
		} catch (error) {
			this.logError('Failed to save token to localStorage', error);
		}
	}

	private clearToken(): void {
		try {
			this.token = null;
			localStorage.removeItem('auth_token');
			this.log('Token cleared');
		} catch (error) {
			this.logError('Failed to clear token from localStorage', error);
		}
	}

	private getHeaders(includeAuth: boolean = true): HeadersInit {
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
		};

		if (includeAuth && this.token) {
			headers.Authorization = `Bearer ${this.token}`;
		}

		this.log('Headers generated', { includeAuth, hasAuth: !!headers.Authorization });
		return headers;
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {},
		requireAuth: boolean = true
	): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;
		const headers = this.getHeaders(requireAuth);

		this.log('Making request', {
			url,
			method: options.method || 'GET',
			requireAuth,
			hasToken: !!this.token,
		});

		try {
			// Añadir timeout para detectar problemas de conectividad
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

			const response = await fetch(url, {
				...options,
				headers: {
					...headers,
					...options.headers,
				},
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			this.log('Response received', {
				status: response.status,
				statusText: response.statusText,
				ok: response.ok,
			});

			if (!response.ok) {
				let errorData;
				try {
					errorData = await response.json();
					this.logError('Response not OK', {
						status: response.status,
						statusText: response.statusText,
						errorData,
					});
				} catch (parseError) {
					this.logError('Failed to parse error response', parseError);
					errorData = { detail: 'Unknown error' };
				}
				throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			this.log('Response parsed successfully');
			return data;

		} catch (error: any) {
			// Detectar tipos específicos de errores
			if (error.name === 'AbortError') {
				this.logError('Request timeout', { url, timeout: '30s' });
				throw new Error('Request timeout: El servidor no respondió a tiempo');
			}

			if (error instanceof TypeError && error.message === 'Failed to fetch') {
				this.logError('Network error - Failed to fetch', {
					url,
					possibleCauses: [
						'Backend no está corriendo',
						'URL incorrecta',
						'Problema de CORS',
						'Firewall bloqueando la conexión',
						'Problema de red'
					]
				});
				throw new Error(
					'Error de red: No se pudo conectar al servidor. ' +
					'Verifica que el backend esté corriendo en ' + this.baseUrl
				);
			}

			// Error de CORS específico
			if (error.message && error.message.includes('CORS')) {
				this.logError('CORS error detected', { url });
				throw new Error(
					'Error de CORS: El servidor debe permitir solicitudes desde este origen. ' +
					'Verifica la configuración de CORS en el backend.'
				);
			}

			this.logError('Request failed', error);
			throw error;
		}
	}

	// Método de diagnóstico
	async diagnose(): Promise<void> {
		console.log('=== API Client Diagnostics ===');
		console.log('Base URL:', this.baseUrl);
		console.log('Has Token:', !!this.token);
		console.log('Token:', this.token ? `${this.token.substring(0, 20)}...` : 'null');

		// Test de conectividad básica
		console.log('\n--- Testing Basic Connectivity ---');
		try {
			const response = await fetch(this.baseUrl.replace('/api/v1', ''));
			console.log('✓ Base URL reachable:', response.status);
		} catch (error) {
			console.error('✗ Base URL unreachable:', error);
		}

		// Test de health endpoint
		console.log('\n--- Testing Health Endpoint ---');
		try {
			const health = await this.healthCheck();
			console.log('✓ Health check passed:', health);
		} catch (error) {
			console.error('✗ Health check failed:', error);
		}

		// Test de CORS
		console.log('\n--- Testing CORS ---');
		try {
			const response = await fetch(`${this.baseUrl}/health`, {
				method: 'OPTIONS',
			});
			console.log('✓ CORS preflight:', response.status);
			console.log('CORS Headers:', {
				'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
				'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
				'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
			});
		} catch (error) {
			console.error('✗ CORS test failed:', error);
		}

		console.log('\n=== Diagnostics Complete ===');
	}

	// Authentication Methods
	async register(data: RegisterRequest): Promise<AuthResponse> {
		this.log('Registering user', { email: data.email });
		const response = await this.request<AuthResponse>('/auth/register', {
			method: 'POST',
			body: JSON.stringify(data),
		}, false);

		this.saveToken(response.access_token);
		return response;
	}

	async login(data: LoginRequest): Promise<AuthResponse> {
		this.log('Logging in user', { email: data.email });
		const response = await this.request<AuthResponse>('/auth/login', {
			method: 'POST',
			body: JSON.stringify(data),
		}, false);

		this.saveToken(response.access_token);
		return response;
	}

	async logout(): Promise<void> {
		this.log('Logging out user');
		this.clearToken();
	}

	async getProfile(): Promise<User> {
		this.log('Getting user profile');
		return this.request<User>('/auth/me');
	}

	async updateProfile(data: Partial<User>): Promise<User> {
		this.log('Updating user profile');
		return this.request<User>('/auth/me', {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	async deleteAccount(): Promise<void> {
		this.log('Deleting user account');
		await this.request<void>('/auth/me', {
			method: 'DELETE',
		});
		this.clearToken();
	}

	async changePassword(data: ChangePasswordRequest): Promise<void> {
		this.log('Changing password');
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
		this.log('Listing users', { params });
		return this.request<PaginatedResponse<User>>(`/auth/users${query ? `?${query}` : ''}`);
	}

	async getUser(userId: string): Promise<User> {
		this.log('Getting user', { userId });
		return this.request<User>(`/auth/users/${userId}`);
	}

	// Data Upload Methods
	async uploadCsv(file: File): Promise<{ message: string; candidates_created: number }> {
		this.log('Uploading CSV', { filename: file.name, size: file.size });
		
		const formData = new FormData();
		formData.append('file', file);

		const url = `${this.baseUrl}/data/upload-csv`;

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos para uploads

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.token}`,
				},
				body: formData,
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			this.log('Upload response received', {
				status: response.status,
				ok: response.ok,
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }));
				this.logError('Upload failed', errorData);
				throw new Error(errorData.detail || `HTTP ${response.status}`);
			}

			const data = await response.json();
			this.log('Upload successful', data);
			return data;

		} catch (error: any) {
			if (error.name === 'AbortError') {
				this.logError('Upload timeout');
				throw new Error('Upload timeout: El archivo es muy grande o la conexión es lenta');
			}
			this.logError('Upload error', error);
			throw error;
		}
	}

	async getMyUploads(params?: PaginationParams): Promise<PaginatedResponse<ExoplanetCandidate>> {
		const searchParams = new URLSearchParams();
		if (params?.skip) searchParams.set('skip', params.skip.toString());
		if (params?.limit) searchParams.set('limit', params.limit.toString());

		const query = searchParams.toString();
		this.log('Getting my uploads', { params });
		return this.request<PaginatedResponse<ExoplanetCandidate>>(`/data/uploads/me${query ? `?${query}` : ''}`);
	}

	async getUploadDetails(candidateId: string): Promise<ExoplanetCandidate> {
		this.log('Getting upload details', { candidateId });
		return this.request<ExoplanetCandidate>(`/data/uploads/${candidateId}`);
	}

	async deleteUpload(candidateId: string): Promise<void> {
		this.log('Deleting upload', { candidateId });
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
		this.log('Listing all candidates', { filters });
		return this.request<PaginatedResponse<ExoplanetCandidate>>(`/data/candidates${query ? `?${query}` : ''}`);
	}

	// Analysis Methods
	async analyzeCandidate(candidateId: string): Promise<AnalysisResult> {
		this.log('Analyzing candidate', { candidateId });
		return this.request<AnalysisResult>(`/analysis/predict/${candidateId}`, {
			method: 'POST',
		});
	}

	async getResults(candidateId: string): Promise<AnalysisResult> {
		this.log('Getting analysis results', { candidateId });
		return this.request<AnalysisResult>(`/analysis/results/${candidateId}`);
	}

	async updateVerdict(candidateId: string, verdict: FinalVerdict): Promise<void> {
		this.log('Updating verdict', { candidateId, verdict });
		return this.request<void>(`/analysis/results/${candidateId}/verdict?verdict=${verdict}`, {
			method: 'PUT',
		});
	}

	async createSession(data: CreateSessionRequest): Promise<AnalysisSession> {
		this.log('Creating analysis session');
		return this.request<AnalysisSession>('/analysis/sessions', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async getSession(sessionId: string): Promise<AnalysisSession> {
		this.log('Getting session', { sessionId });
		return this.request<AnalysisSession>(`/analysis/sessions/${sessionId}`);
	}

	async updateSession(sessionId: string, data: UpdateSessionRequest): Promise<AnalysisSession> {
		this.log('Updating session', { sessionId });
		return this.request<AnalysisSession>(`/analysis/sessions/${sessionId}`, {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	async getCandidateSessions(candidateId: string): Promise<AnalysisSession[]> {
		this.log('Getting candidate sessions', { candidateId });
		return this.request<AnalysisSession[]>(`/analysis/sessions/candidate/${candidateId}`);
	}

	async getPendingCandidates(limit?: number): Promise<ExoplanetCandidate[]> {
		const query = limit ? `?limit=${limit}` : '';
		this.log('Getting pending candidates', { limit });
		return this.request<ExoplanetCandidate[]>(`/analysis/candidates/pending${query}`);
	}

	async bulkAnalyze(filename?: string, userCandidatesOnly?: boolean): Promise<{ message: string }> {
		const searchParams = new URLSearchParams();
		if (filename) searchParams.set('filename', filename);
		if (userCandidatesOnly !== undefined) searchParams.set('user_candidates_only', userCandidatesOnly.toString());

		const query = searchParams.toString();
		this.log('Starting bulk analysis', { filename, userCandidatesOnly });
		return this.request<{ message: string }>(`/analysis/bulk-predict${query ? `?${query}` : ''}`, {
			method: 'POST',
		});
	}

	async getBulkStatus(filename?: string): Promise<BulkAnalysisStatus> {
		const query = filename ? `?filename=${filename}` : '';
		this.log('Getting bulk analysis status', { filename });
		return this.request<BulkAnalysisStatus>(`/analysis/bulk-status${query}`);
	}

	// Feedback Methods
	async submitFeedback(data: SubmitFeedbackRequest): Promise<ResearcherFeedback> {
		this.log('Submitting feedback');
		return this.request<ResearcherFeedback>('/feedback/submit', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async getCandidateFeedback(candidateId: string): Promise<ResearcherFeedback[]> {
		this.log('Getting candidate feedback', { candidateId });
		return this.request<ResearcherFeedback[]>(`/feedback/candidate/${candidateId}`);
	}

	async getMyFeedback(params?: PaginationParams): Promise<PaginatedResponse<ResearcherFeedback>> {
		const searchParams = new URLSearchParams();
		if (params?.skip) searchParams.set('skip', params.skip.toString());
		if (params?.limit) searchParams.set('limit', params.limit.toString());

		const query = searchParams.toString();
		this.log('Getting my feedback', { params });
		return this.request<PaginatedResponse<ResearcherFeedback>>(`/feedback/my-feedback${query ? `?${query}` : ''}`);
	}

	async updateFeedback(feedbackId: string, data: UpdateFeedbackRequest): Promise<ResearcherFeedback> {
		this.log('Updating feedback', { feedbackId });
		return this.request<ResearcherFeedback>(`/feedback/${feedbackId}`, {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	async deleteFeedback(feedbackId: string): Promise<void> {
		this.log('Deleting feedback', { feedbackId });
		return this.request<void>(`/feedback/${feedbackId}`, {
			method: 'DELETE',
		});
	}

	async getFeedback(feedbackId: string): Promise<ResearcherFeedback> {
		this.log('Getting feedback', { feedbackId });
		return this.request<ResearcherFeedback>(`/feedback/${feedbackId}`);
	}

	async getConsensus(candidateId: string): Promise<ConsensusResponse> {
		this.log('Getting consensus', { candidateId });
		return this.request<ConsensusResponse>(`/feedback/consensus/${candidateId}`);
	}

	async getResearcherStats(researcherId: string): Promise<ResearcherStats> {
		this.log('Getting researcher stats', { researcherId });
		return this.request<ResearcherStats>(`/feedback/researcher/${researcherId}/stats`);
	}

	async getMyStats(): Promise<ResearcherStats> {
		this.log('Getting my stats');
		return this.request<ResearcherStats>('/feedback/my-stats');
	}

	// Utility Methods
	async healthCheck(): Promise<{ status: string }> {
		this.log('Health check');
		return this.request<{ status: string }>('/health', {}, false);
	}

	isAuthenticated(): boolean {
		return !!this.token;
	}

	// Método para cambiar URL base (útil para debugging)
	setBaseUrl(url: string): void {
		this.baseUrl = url;
		this.log('Base URL changed', { newUrl: url });
	}

	// Método para activar/desactivar debug
	setDebugMode(enabled: boolean): void {
		// @ts-ignore
		DEBUG_MODE = enabled;
		this.log('Debug mode changed', { enabled });
	}
}

// Export singleton instance
export const apiClient = new ApiClient();

// Exponer diagnose en window para debugging en consola
if (typeof window !== 'undefined') {
	(window as any).apiClient = apiClient;
	console.log('💡 Debug tip: Ejecuta apiClient.diagnose() en la consola para diagnosticar problemas');
}

export default apiClient;