import type { ExoplanetCandidate, ExoplanetRow, FinalVerdict, Label } from './types';

// Transform API candidate to legacy ExoplanetRow format
export function candidateToRow(candidate: ExoplanetCandidate): ExoplanetRow {
	// Map API verdict to legacy classification
	const verdictToLabel = (verdict: FinalVerdict): Label => {
		switch (verdict) {
			case 'confirmed':
				return 'Confirmado';
			case 'candidate':
				return 'Candidato';
			case 'false_positive':
				return 'Falso positivo';
			case 'pending':
			default:
				return 'Candidato';
		}
	};

	return {
		id: candidate.id,
		classification: verdictToLabel(candidate.final_verdict),
		score: candidate.ai_prediction,
		period: candidate.koi_period,
		radius: candidate.koi_prad,
		koi_period: candidate.koi_period,
		koi_prad: candidate.koi_prad,
		koi_model_snr: candidate.koi_model_snr,
		koi_kepmag: candidate.koi_kepmag,
		koi_teq: candidate.koi_teq,
		koi_score: candidate.koi_score,
	};
}

// Transform legacy ExoplanetRow to API format (for uploads)
export function rowToCandidate(row: ExoplanetRow): Partial<ExoplanetCandidate> {
	// Map legacy classification to API verdict
	const labelToVerdict = (label: Label): FinalVerdict => {
		switch (label) {
			case 'Confirmado':
				return 'confirmed';
			case 'Candidato':
				return 'candidate';
			case 'Falso positivo':
				return 'false_positive';
			default:
				return 'pending';
		}
	};

	return {
		id: row.id,
		final_verdict: labelToVerdict(row.classification),
		ai_prediction: row.score,
		koi_period: row.koi_period || row.period,
		koi_prad: row.koi_prad || row.radius,
		koi_model_snr: row.koi_model_snr,
		koi_kepmag: row.koi_kepmag,
		koi_teq: row.koi_teq,
		koi_score: row.koi_score,
	};
}

// Transform array of candidates to legacy format
export function candidatesToRows(candidates: ExoplanetCandidate[]): ExoplanetRow[] {
	return candidates.map(candidateToRow);
}

// Error handling utilities
export class ApiError extends Error {
	constructor(
		message: string,
		public statusCode?: number,
		public originalError?: unknown
	) {
		super(message);
		this.name = 'ApiError';
	}
}

export function handleApiError(error: unknown): ApiError {
	if (error instanceof ApiError) {
		return error;
	}

	if (error instanceof Error) {
		return new ApiError(error.message, undefined, error);
	}

	return new ApiError('An unknown error occurred', undefined, error);
}

// Validation utilities
export function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

export function validatePassword(password: string): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (password.length < 8) {
		errors.push('Password must be at least 8 characters long');
	}

	if (!/[A-Z]/.test(password)) {
		errors.push('Password must contain at least one uppercase letter');
	}

	if (!/[a-z]/.test(password)) {
		errors.push('Password must contain at least one lowercase letter');
	}

	if (!/\d/.test(password)) {
		errors.push('Password must contain at least one number');
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}

// Format utilities
export function formatConfidenceScore(score: number): string {
	return `${(score * 100).toFixed(1)}%`;
}

export function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString();
}

export function formatDateTime(dateString: string): string {
	return new Date(dateString).toLocaleString();
}

// Pagination utilities
export function calculateTotalPages(total: number, limit: number): number {
	return Math.ceil(total / limit);
}

export function getPageNumbers(currentPage: number, totalPages: number, maxVisible: number = 5): number[] {
	const pages: number[] = [];
	const half = Math.floor(maxVisible / 2);

	let start = Math.max(1, currentPage - half);
	let end = Math.min(totalPages, start + maxVisible - 1);

	if (end - start + 1 < maxVisible) {
		start = Math.max(1, end - maxVisible + 1);
	}

	for (let i = start; i <= end; i++) {
		pages.push(i);
	}

	return pages;
}

// File utilities
export function validateCsvFile(file: File): { isValid: boolean; error?: string } {
	if (!file) {
		return { isValid: false, error: 'No file selected' };
	}

	if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
		return { isValid: false, error: 'File must be a CSV file' };
	}

	if (file.size > 10 * 1024 * 1024) { // 10MB limit
		return { isValid: false, error: 'File size must be less than 10MB' };
	}

	return { isValid: true };
}

// Debounce utility for search inputs
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;

	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

// Local storage utilities with error handling
export function safeLocalStorage() {
	const isAvailable = (() => {
		try {
			const test = '__localStorage_test__';
			localStorage.setItem(test, test);
			localStorage.removeItem(test);
			return true;
		} catch {
			return false;
		}
	})();

	return {
		getItem: (key: string): string | null => {
			if (!isAvailable) return null;
			try {
				return localStorage.getItem(key);
			} catch {
				return null;
			}
		},

		setItem: (key: string, value: string): boolean => {
			if (!isAvailable) return false;
			try {
				localStorage.setItem(key, value);
				return true;
			} catch {
				return false;
			}
		},

		removeItem: (key: string): boolean => {
			if (!isAvailable) return false;
			try {
				localStorage.removeItem(key);
				return true;
			} catch {
				return false;
			}
		},

		isAvailable,
	};
}