import { apiClient } from './api-client';

export interface CsvUploadResult {
	message: string;
	candidates_created: number;
}

export interface CsvUploadError {
	message: string;
	details?: string;
}

// Simple CSV upload function
export async function uploadCsvFile(file: File): Promise<CsvUploadResult> {
	// Validate file
	if (!file) {
		throw new Error('No file provided');
	}

	if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
		throw new Error('File must be a CSV file');
	}

	if (file.size > 10 * 1024 * 1024) { // 10MB limit
		throw new Error('File size must be less than 10MB');
	}

	try {
		const result = await apiClient.uploadCsv(file);
		return result;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Upload failed: ${error.message}`);
		}
		throw new Error('Upload failed: Unknown error');
	}
}

// Check if user is authenticated before upload
export function canUploadCsv(): boolean {
	return apiClient.isAuthenticated();
}

// Validate CSV file before upload
export function validateCsvFile(file: File): { valid: boolean; error?: string } {
	if (!file) {
		return { valid: false, error: 'No file selected' };
	}

	if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
		return { valid: false, error: 'Please select a CSV file' };
	}

	if (file.size === 0) {
		return { valid: false, error: 'File is empty' };
	}

	if (file.size > 10 * 1024 * 1024) {
		return { valid: false, error: 'File is too large (max 10MB)' };
	}

	return { valid: true };
}