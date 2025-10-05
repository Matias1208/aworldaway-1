import React, { useState, useRef } from 'react';
import { useCsvUpload } from '../hooks/useCsvUpload';

interface CsvUploadProps {
	onUploadSuccess?: (candidatesCreated: number) => void;
	onUploadError?: (error: string) => void;
	className?: string;
}

export function CsvUpload({ onUploadSuccess, onUploadError, className = '' }: CsvUploadProps) {
	const { upload, uploading, error, result, reset, canUpload } = useCsvUpload();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			reset(); // Clear previous results
		}
	};

	const handleUpload = async () => {
		if (!selectedFile) return;

		try {
			const result = await upload(selectedFile);
			if (result && onUploadSuccess) {
				onUploadSuccess(result.candidates_created);
			}
			// Clear the file input after successful upload
			setSelectedFile(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		} catch (err) {
			if (onUploadError) {
				onUploadError(err instanceof Error ? err.message : 'Upload failed');
			}
		}
	};

	const handleDragOver = (event: React.DragEvent) => {
		event.preventDefault();
		event.stopPropagation();
	};

	const handleDrop = (event: React.DragEvent) => {
		event.preventDefault();
		event.stopPropagation();

		const files = event.dataTransfer.files;
		if (files.length > 0) {
			const file = files[0];
			if (file.name.endsWith('.csv') || file.type === 'text/csv') {
				setSelectedFile(file);
				reset();
			}
		}
	};

	if (!canUpload) {
		return (
			<div className={`p-4 border border-gray-300 rounded-lg bg-gray-50 ${className}`}>
				<p className="text-gray-600 text-center">
					Please log in to upload CSV files
				</p>
			</div>
		);
	}

	return (
		<div className={`space-y-4 ${className}`}>
			{/* File Drop Zone */}
			<div
				className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				<div className="space-y-2">
					<svg
						className="mx-auto h-12 w-12 text-gray-400"
						stroke="currentColor"
						fill="none"
						viewBox="0 0 48 48"
					>
						<path
							d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
							strokeWidth={2}
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					<div className="text-sm text-gray-600">
						<label htmlFor="csv-upload" className="cursor-pointer">
							<span className="text-blue-600 hover:text-blue-500">
								Click to upload
							</span>
							<span> or drag and drop</span>
						</label>
						<input
							ref={fileInputRef}
							id="csv-upload"
							type="file"
							accept=".csv"
							onChange={handleFileSelect}
							className="sr-only"
						/>
					</div>
					<p className="text-xs text-gray-500">CSV files up to 10MB</p>
				</div>
			</div>

			{/* Selected File Info */}
			{selectedFile && (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
							</svg>
							<div>
								<p className="text-sm font-medium text-blue-900">{selectedFile.name}</p>
								<p className="text-xs text-blue-700">
									{(selectedFile.size / 1024).toFixed(1)} KB
								</p>
							</div>
						</div>
						<button
							onClick={() => {
								setSelectedFile(null);
								if (fileInputRef.current) {
									fileInputRef.current.value = '';
								}
							}}
							className="text-blue-400 hover:text-blue-600"
						>
							<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
							</svg>
						</button>
					</div>
				</div>
			)}

			{/* Upload Button */}
			{selectedFile && (
				<button
					onClick={handleUpload}
					disabled={uploading}
					className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{uploading ? (
						<div className="flex items-center justify-center space-x-2">
							<svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
							</svg>
							<span>Uploading...</span>
						</div>
					) : (
						'Upload CSV'
					)}
				</button>
			)}

			{/* Error Message */}
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-3">
					<div className="flex items-center space-x-2">
						<svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
						</svg>
						<p className="text-sm text-red-700">{error}</p>
					</div>
				</div>
			)}

			{/* Success Message */}
			{result && (
				<div className="bg-green-50 border border-green-200 rounded-lg p-3">
					<div className="flex items-center space-x-2">
						<svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
						</svg>
						<p className="text-sm text-green-700">
							Successfully uploaded! Created {result.candidates_created} candidates.
						</p>
					</div>
				</div>
			)}
		</div>
	);
}