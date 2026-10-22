import React, { useEffect, useRef } from 'react';
import type { UserPreferences } from '../types.js';
import { X, Volume2, VolumeX, Eye, Type } from 'lucide-react';

interface SettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	preferences: UserPreferences;
	onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
	isOpen,
	onClose,
	preferences,
	onUpdatePreferences,
}) => {
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (isOpen) {
			closeButtonRef.current?.focus();
			const handleKeyDown = (e: KeyboardEvent) => {
				if (e.key === 'Escape') onClose();
			};
			window.addEventListener('keydown', handleKeyDown);
			return () => window.removeEventListener('keydown', handleKeyDown);
		}
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="settings-title"
			className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
		>
			<div
				className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl border ${
					preferences.highContrast
						? 'bg-black border-4 border-yellow-400 text-white'
						: 'bg-slate-900 border-2 border-slate-700 text-slate-100'
				}`}
			>
				<div className="flex items-center justify-between pb-4 border-b border-slate-800">
					<h2 id="settings-title" className="text-xl font-bold">
						Accessibility & Alerts Settings
					</h2>
					<button
						ref={closeButtonRef}
						type="button"
						onClick={onClose}
						className="p-2 text-slate-400 hover:text-white rounded-lg focus-visible:ring-4 focus-visible:ring-sky-400 focus-visible:outline-none"
						aria-label="Close settings dialog"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="py-4 space-y-5">
					{/* High contrast */}
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<span className="text-sm font-semibold flex items-center gap-2">
								<Eye className="w-4 h-4 text-sky-400" />
								High Contrast Display
							</span>
							<p className="text-xs text-slate-400">
								Maximizes contrast borders and switches to pure black background.
							</p>
						</div>
						<input
							type="checkbox"
							checked={preferences.highContrast}
							onChange={(e) => onUpdatePreferences({ highContrast: e.target.checked })}
							className="w-5 h-5 accent-yellow-400 cursor-pointer focus-visible:ring-4 focus-visible:ring-sky-400"
							aria-label="Toggle high contrast display"
						/>
					</div>

					{/* Large typography */}
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<span className="text-sm font-semibold flex items-center gap-2">
								<Type className="w-4 h-4 text-emerald-400" />
								Enlarged Text Mode
							</span>
							<p className="text-xs text-slate-400">
								Increases font scaling for enhanced legibility across all cards.
							</p>
						</div>
						<input
							type="checkbox"
							checked={preferences.largeFont}
							onChange={(e) => onUpdatePreferences({ largeFont: e.target.checked })}
							className="w-5 h-5 accent-emerald-400 cursor-pointer focus-visible:ring-4 focus-visible:ring-sky-400"
							aria-label="Toggle enlarged text mode"
						/>
					</div>

					{/* Spoken announcements */}
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<span className="text-sm font-semibold flex items-center gap-2">
								{preferences.soundEnabled ? (
									<Volume2 className="w-4 h-4 text-amber-400" />
								) : (
									<VolumeX className="w-4 h-4 text-slate-400" />
								)}
								Optional Spoken Announcements
							</span>
							<p className="text-xs text-slate-400">
								Speaks event summary aloud. Defaults to OFF for visual-only accessibility.
							</p>
						</div>
						<input
							type="checkbox"
							checked={preferences.soundEnabled}
							onChange={(e) => onUpdatePreferences({ soundEnabled: e.target.checked })}
							className="w-5 h-5 accent-amber-400 cursor-pointer focus-visible:ring-4 focus-visible:ring-sky-400"
							aria-label="Toggle optional spoken announcements"
						/>
					</div>
				</div>

				<div className="pt-4 border-t border-slate-800 flex justify-end">
					<button
						type="button"
						onClick={onClose}
						className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all focus-visible:ring-4 focus-visible:ring-sky-400 focus-visible:outline-none ${
							preferences.highContrast
								? 'bg-yellow-400 text-black hover:bg-yellow-300'
								: 'bg-sky-500 text-white hover:bg-sky-450'
						}`}
					>
						Done
					</button>
				</div>
			</div>
		</div>
	);
};
