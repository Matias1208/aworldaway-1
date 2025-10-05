import React, { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import {
	useCandidates,
	useFileUpload,
	useAnalysis,
	useFeedback
} from '../lib/api-hooks';
import { candidatesToRows, validateCsvFile } from '../lib/api-utils';
import type { FinalVerdict, SubmitFeedbackRequest } from '../lib/api-types';

// Example: Login Form Component
export function LoginForm() {
	const { login, loading, error } = useAuthContext();
	const [credentials, setCredentials] = useState({
		username: '',
		password: '',
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await login(credentials);
			// Redirect or update UI on success
		} catch (err) {
			// Error is handled by the auth context
			console.error('Login failed:', err);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label className="block text-sm font-medium text-gray-700">
					Username
				</label>
				<input
					type="text"
					value={credentials.username}
					onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
					required
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700">
					Password
				</label>
				<input
					type="password"
					value={credentials.password}
					onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
					required
				/>
			</div>

			{error && (
				<div className="text-red-600 text-sm">{error}</div>
			)}

			<button
				type="submit"
				disabled={loading}
				className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
			>
				{loading ? 'Logging in...' : 'Login'}
			</button>
		</form>
	);
}

// Example: File Upload Component
export function CsvUploadComponent() {
	const { uploadCsv, uploading, error } = useFileUpload();
	const [file, setFile] = useState<File | null>(null);
	const [uploadResult, setUploadResult] = useState<string | null>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			const validation = validateCsvFile(selectedFile);
			if (validation.isValid) {
				setFile(selectedFile);
			} else {
				alert(validation.error);
			}
		}
	};

	const handleUpload = async () => {
		if (!file) return;

		try {
			const result = await uploadCsv(file);
			setUploadResult(`Successfully uploaded ${result.candidates_created} candidates`);
			setFile(null);
		} catch (err) {
			// Error is handled by the hook
			console.error('Upload failed:', err);
		}
	};

	return (
		<div className="space-y-4">
			<div>
				<label className="block text-sm font-medium text-gray-700">
					Upload CSV File
				</label>
				<input
					type="file"
					accept=".csv"
					onChange={handleFileChange}
					className="mt-1 block w-full"
				/>
			</div>

			{file && (
				<div className="text-sm text-gray-600">
					Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
				</div>
			)}

			{error && (
				<div className="text-red-600 text-sm">{error}</div>
			)}

			{uploadResult && (
				<div className="text-green-600 text-sm">{uploadResult}</div>
			)}

			<button
				onClick={handleUpload}
				disabled={!file || uploading}
				className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
			>
				{uploading ? 'Uploading...' : 'Upload'}
			</button>
		</div>
	);
}

// Example: Candidates List Component
export function CandidatesList() {
	const [filters, setFilters] = useState({
		skip: 0,
		limit: 20,
		status_filter: undefined as string | undefined,
		verdict_filter: undefined as string | undefined,
	});

	const { data, loading, error, refetch } = useCandidates(filters);
	const { analyzeCandidate, analyzing } = useAnalysis();

	const handleAnalyze = async (candidateId: string) => {
		try {
			await analyzeCandidate(candidateId);
			refetch(); // Refresh the list
		} catch (err) {
			console.error('Analysis failed:', err);
		}
	};

	if (loading) {
		return <div>Loading candidates...</div>;
	}

	if (error) {
		return <div className="text-red-600">Error: {error}</div>;
	}

	if (!data) {
		return <div>No data available</div>;
	}

	// Convert to legacy format for existing components
	const legacyRows = candidatesToRows(data.items);

	return (
		<div className="space-y-4">
			<div className="flex space-x-4">
				<select
					value={filters.status_filter || ''}
					onChange={(e) => setFilters(prev => ({
						...prev,
						status_filter: e.target.value || undefined
					}))}
					className="rounded-md border-gray-300"
				>
					<option value="">All Statuses</option>
					<option value="pending">Pending</option>
					<option value="processing">Processing</option>
					<option value="completed">Completed</option>
					<option value="error">Error</option>
				</select>

				<select
					value={filters.verdict_filter || ''}
					onChange={(e) => setFilters(prev => ({
						...prev,
						verdict_filter: e.target.value || undefined
					}))}
					className="rounded-md border-gray-300"
				>
					<option value="">All Verdicts</option>
					<option value="confirmed">Confirmed</option>
					<option value="candidate">Candidate</option>
					<option value="false_positive">False Positive</option>
					<option value="pending">Pending</option>
				</select>
			</div>

			<div className="grid gap-4">
				{data.items.map((candidate) => (
					<div key={candidate.id} className="border rounded-lg p-4">
						<div className="flex justify-between items-start">
							<div>
								<h3 className="font-semibold">
									{candidate.kepoi_name || `KepID: ${candidate.kepid}`}
								</h3>
								<p className="text-sm text-gray-600">
									Status: {candidate.analysis_status} |
									Verdict: {candidate.final_verdict}
								</p>
								{candidate.ai_prediction && (
									<p className="text-sm">
										AI Prediction: {(candidate.ai_prediction * 100).toFixed(1)}%
									</p>
								)}
							</div>

							<button
								onClick={() => handleAnalyze(candidate.id)}
								disabled={analyzing || candidate.analysis_status === 'processing'}
								className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
							>
								{analyzing ? 'Analyzing...' : 'Analyze'}
							</button>
						</div>
					</div>
				))}
			</div>

			<div className="flex justify-between items-center">
				<div className="text-sm text-gray-600">
					Showing {data.skip + 1} to {Math.min(data.skip + data.limit, data.total)} of {data.total}
				</div>

				<div className="flex space-x-2">
					<button
						onClick={() => setFilters(prev => ({
							...prev,
							skip: Math.max(0, prev.skip - prev.limit)
						}))}
						disabled={filters.skip === 0}
						className="px-3 py-1 border rounded disabled:opacity-50"
					>
						Previous
					</button>

					<button
						onClick={() => setFilters(prev => ({
							...prev,
							skip: prev.skip + prev.limit
						}))}
						disabled={filters.skip + filters.limit >= data.total}
						className="px-3 py-1 border rounded disabled:opacity-50"
					>
						Next
					</button>
				</div>
			</div>
		</div>
	);
}

// Example: Feedback Form Component
export function FeedbackForm({ candidateId }: { candidateId: string }) {
	const { submitFeedback, submitting, error } = useFeedback();
	const [feedback, setFeedback] = useState<Omit<SubmitFeedbackRequest, 'candidate_id'>>({
		expert_classification: 'pending' as FinalVerdict,
		detailed_reasoning: '',
		confidence_score: 0.5,
		agrees_with_ai: undefined,
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await submitFeedback({
				...feedback,
				candidate_id: candidateId,
			});
			// Reset form or show success message
			setFeedback({
				expert_classification: 'pending',
				detailed_reasoning: '',
				confidence_score: 0.5,
				agrees_with_ai: undefined,
			});
		} catch (err) {
			console.error('Failed to submit feedback:', err);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label className="block text-sm font-medium text-gray-700">
					Classification
				</label>
				<select
					value={feedback.expert_classification}
					onChange={(e) => setFeedback(prev => ({
						...prev,
						expert_classification: e.target.value as FinalVerdict
					}))}
					className="mt-1 block w-full rounded-md border-gray-300"
					required
				>
					<option value="pending">Pending</option>
					<option value="confirmed">Confirmed</option>
					<option value="candidate">Candidate</option>
					<option value="false_positive">False Positive</option>
				</select>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700">
					Detailed Reasoning
				</label>
				<textarea
					value={feedback.detailed_reasoning}
					onChange={(e) => setFeedback(prev => ({
						...prev,
						detailed_reasoning: e.target.value
					}))}
					className="mt-1 block w-full rounded-md border-gray-300"
					rows={4}
					required
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700">
					Confidence Score: {(feedback.confidence_score * 100).toFixed(0)}%
				</label>
				<input
					type="range"
					min="0"
					max="1"
					step="0.01"
					value={feedback.confidence_score}
					onChange={(e) => setFeedback(prev => ({
						...prev,
						confidence_score: parseFloat(e.target.value)
					}))}
					className="mt-1 block w-full"
				/>
			</div>

			{error && (
				<div className="text-red-600 text-sm">{error}</div>
			)}

			<button
				type="submit"
				disabled={submitting}
				className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
			>
				{submitting ? 'Submitting...' : 'Submit Feedback'}
			</button>
		</form>
	);
}