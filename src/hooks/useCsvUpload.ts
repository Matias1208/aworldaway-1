import { useState } from 'react';
import { uploadCsvFile, validateCsvFile, canUploadCsv } from '../lib/csv-upload';
import type { CsvUploadResult } from '../lib/csv-upload';

export function useCsvUpload() {
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<CsvUploadResult | null>(null);

	const upload = async (file: File) => {
		// Check authentication
		if (!canUploadCsv()) {
			setError('You must be logged in to upload files');
			return;
		}

		// Validate file
		const validation = validateCsvFile(file);
		if (!validation.valid) {
			setError(validation.error || 'Invalid file');
			return;
		}

		try {
			setUploading(true);
			setError(null);
			setResult(null);

			const uploadResult = await uploadCsvFile(file);
			setResult(uploadResult);

			return uploadResult;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Upload failed';
			setError(errorMessage);
			throw err;
		} finally {
			setUploading(false);
		}
	};

	const reset = () => {
		setError(null);
		setResult(null);
	};

	return {
		upload,
		uploading,
		error,
		result,
		reset,
		canUpload: canUploadCsv(),
	};
}