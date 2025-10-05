import React from 'react';
import { CsvUpload } from './CsvUpload';
import { useAppStore } from '../store/useAppStore';

export function CsvUploadExample() {
	const { setLoading, setError } = useAppStore();

	const handleUploadSuccess = (candidatesCreated: number) => {
		console.log(`Successfully uploaded ${candidatesCreated} candidates`);
		// You can update your app state here, show a notification, etc.

		// Example: Refresh data after upload
		// refetchCandidates();
	};

	const handleUploadError = (error: string) => {
		console.error('Upload failed:', error);
		setError(error);
	};

	return (
		<div className="max-w-md mx-auto p-6">
			<h2 className="text-xl font-semibold mb-4">Upload Exoplanet Data</h2>

			<CsvUpload
				onUploadSuccess={handleUploadSuccess}
				onUploadError={handleUploadError}
				className="mb-4"
			/>

			<div className="text-sm text-gray-600">
				<p className="mb-2">Upload a CSV file containing exoplanet candidate data.</p>
				<p>Expected columns: kepid, koi_period, koi_prad, koi_model_snr, etc.</p>
			</div>
		</div>
	);
}