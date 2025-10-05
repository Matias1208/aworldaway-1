import { useState, useEffect, useCallback } from 'react';
import { apiClient } from './api-client';
import type {
	User,
	ExoplanetCandidate,
	AnalysisResult,
	ResearcherFeedback,
	PaginatedResponse,
	LoginRequest,
	RegisterRequest,
	SubmitFeedbackRequest,
	CandidateFilters,
	FinalVerdict,
} from './api-types';

// Generic hook for API calls with loading and error states
export function useApiCall<T>(
	apiCall: () => Promise<T>,
	dependencies: any[] = []
) {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const execute = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const result = await apiCall();
			setData(result);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setLoading(false);
		}
	}, dependencies);

	useEffect(() => {
		execute();
	}, [execute]);

	return { data, loading, error, refetch: execute };
}

// Authentication hooks
export function useAuth() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const checkAuth = useCallback(async () => {
		if (!apiClient.isAuthenticated()) {
			setLoading(false);
			return;
		}

		try {
			const profile = await apiClient.getProfile();
			setUser(profile);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Authentication failed');
			apiClient.logout();
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	const login = async (credentials: LoginRequest) => {
		try {
			setLoading(true);
			setError(null);
			const response = await apiClient.login(credentials);
			setUser(response.user);
			return response;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Login failed';
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const register = async (userData: RegisterRequest) => {
		try {
			setLoading(true);
			setError(null);
			const response = await apiClient.register(userData);
			setUser(response.user);
			return response;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Registration failed';
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const logout = () => {
		apiClient.logout();
		setUser(null);
	};

	return {
		user,
		loading,
		error,
		login,
		register,
		logout,
		isAuthenticated: !!user,
		refetch: checkAuth,
	};
}

// Data upload hooks
export function useFileUpload() {
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const uploadCsv = async (file: File) => {
		try {
			setUploading(true);
			setError(null);
			const result = await apiClient.uploadCsv(file);
			return result;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Upload failed';
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setUploading(false);
		}
	};

	return { uploadCsv, uploading, error };
}

// Candidates hooks
export function useCandidates(filters?: CandidateFilters) {
	return useApiCall(
		() => apiClient.listAllCandidates(filters),
		[filters?.skip, filters?.limit, filters?.status_filter, filters?.verdict_filter]
	);
}

export function useMyUploads(skip?: number, limit?: number) {
	return useApiCall(
		() => apiClient.getMyUploads({ skip, limit }),
		[skip, limit]
	);
}

export function useCandidate(candidateId: string | null) {
	return useApiCall(
		() => candidateId ? apiClient.getUploadDetails(candidateId) : Promise.resolve(null),
		[candidateId]
	);
}

export function usePendingCandidates(limit?: number) {
	return useApiCall(
		() => apiClient.getPendingCandidates(limit),
		[limit]
	);
}

// Analysis hooks
export function useAnalysisResult(candidateId: string | null) {
	return useApiCall(
		() => candidateId ? apiClient.getResults(candidateId) : Promise.resolve(null),
		[candidateId]
	);
}

export function useAnalysis() {
	const [analyzing, setAnalyzing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const analyzeCandidate = async (candidateId: string) => {
		try {
			setAnalyzing(true);
			setError(null);
			const result = await apiClient.analyzeCandidate(candidateId);
			return result;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setAnalyzing(false);
		}
	};

	const updateVerdict = async (candidateId: string, verdict: FinalVerdict) => {
		try {
			setError(null);
			await apiClient.updateVerdict(candidateId, verdict);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to update verdict';
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	};

	const bulkAnalyze = async (filename?: string, userCandidatesOnly?: boolean) => {
		try {
			setAnalyzing(true);
			setError(null);
			const result = await apiClient.bulkAnalyze(filename, userCandidatesOnly);
			return result;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Bulk analysis failed';
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setAnalyzing(false);
		}
	};

	return {
		analyzeCandidate,
		updateVerdict,
		bulkAnalyze,
		analyzing,
		error,
	};
}

// Feedback hooks
export function useCandidateFeedback(candidateId: string | null) {
	return useApiCall(
		() => candidateId ? apiClient.getCandidateFeedback(candidateId) : Promise.resolve([]),
		[candidateId]
	);
}

export function useMyFeedback(skip?: number, limit?: number) {
	return useApiCall(
		() => apiClient.getMyFeedback({ skip, limit }),
		[skip, limit]
	);
}

export function useFeedback() {
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const submitFeedback = async (feedback: SubmitFeedbackRequest) => {
		try {
			setSubmitting(true);
			setError(null);
			const result = await apiClient.submitFeedback(feedback);
			return result;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to submit feedback';
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setSubmitting(false);
		}
	};

	const updateFeedback = async (feedbackId: string, updates: Partial<SubmitFeedbackRequest>) => {
		try {
			setError(null);
			const result = await apiClient.updateFeedback(feedbackId, updates);
			return result;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to update feedback';
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	};

	const deleteFeedback = async (feedbackId: string) => {
		try {
			setError(null);
			await apiClient.deleteFeedback(feedbackId);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to delete feedback';
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	};

	return {
		submitFeedback,
		updateFeedback,
		deleteFeedback,
		submitting,
		error,
	};
}

// Stats hooks
export function useMyStats() {
	return useApiCall(() => apiClient.getMyStats());
}

export function useResearcherStats(researcherId: string | null) {
	return useApiCall(
		() => researcherId ? apiClient.getResearcherStats(researcherId) : Promise.resolve(null),
		[researcherId]
	);
}

export function useConsensus(candidateId: string | null) {
	return useApiCall(
		() => candidateId ? apiClient.getConsensus(candidateId) : Promise.resolve(null),
		[candidateId]
	);
}

// Utility hooks
export function useHealthCheck() {
	return useApiCall(() => apiClient.healthCheck());
}