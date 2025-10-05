import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../lib/api-hooks';
import type { User, LoginRequest, RegisterRequest } from '../lib/api-types';

interface AuthContextType {
	user: User | null;
	loading: boolean;
	error: string | null;
	login: (credentials: LoginRequest) => Promise<any>;
	register: (userData: RegisterRequest) => Promise<any>;
	logout: () => void;
	isAuthenticated: boolean;
	refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const auth = useAuth();

	return (
		<AuthContext.Provider value={auth}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuthContext() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuthContext must be used within an AuthProvider');
	}
	return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
	return function AuthenticatedComponent(props: P) {
		const { isAuthenticated, loading } = useAuthContext();

		if (loading) {
			return (
				<div className="flex items-center justify-center min-h-screen">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
				</div>
			);
		}

		if (!isAuthenticated) {
			return (
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							Authentication Required
						</h2>
						<p className="text-gray-600">
							Please log in to access this page.
						</p>
					</div>
				</div>
			);
		}

		return <Component {...props} />;
	};
}