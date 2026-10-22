import React, { useEffect, useRef, useState } from 'react';
import type { UserPreferences, ThemeMode, FamiliarRoutineWindow } from '../types.js';
import { playRingChime } from '../utils/audioChime.js';
import {
	X,
	Volume2,
	VolumeX,
	Eye,
	Type,
	Zap,
	Calendar,
	Plus,
	Trash2,
	Sun,
	Moon,
	Volume1
} from 'lucide-react';

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
	const [newLabel, setNewLabel] = useState('');
	const [newStart, setNewStart] = useState(9);
	const [newEnd, setNewEnd] = useState(11);

	const isLight = preferences.theme === 'light';
	const isContrast = preferences.theme === 'contrast';

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

	const handleAddRoutine = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newLabel.trim()) return;
		const newWindow: FamiliarRoutineWindow = {
			id: `routine-${Date.now()}`,
			label: newLabel.trim(),
			startHour: Number(newStart),
			endHour: Number(newEnd),
			days: 'Mon-Fri',
		};
		const updated = [...(preferences.routineWindows || []), newWindow];
		onUpdatePreferences({ routineWindows: updated });
		setNewLabel('');
	};

	const handleRemoveRoutine = (id: string) => {
		const updated = (preferences.routineWindows || []).filter((r) => r.id !== id);
		onUpdatePreferences({ routineWindows: updated });
	};

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="settings-title"
			className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
		>
			<div
				className={`w-full max-w-xl rounded-2xl p-6 shadow-2xl border my-8 transition-all ${
					isContrast
						? 'bg-black border-4 border-yellow-400 text-white'
						: isLight
						? 'bg-white border-slate-200 text-slate-900 shadow-2xl'
						: 'bg-slate-900 border-slate-700 text-slate-100'
				}`}
			>
				{/* Modal Header */}
				<div
					className={`flex items-center justify-between pb-4 border-b ${
						isLight ? 'border-slate-100' : 'border-slate-800'
					}`}
				>
					<div>
						<h2 id="settings-title" className="text-xl font-bold tracking-tight">
							Accessibility & Routine Settings
						</h2>
						<p className="text-xs text-slate-500">
							Personalize visual alerts, contrast themes, and familiar arrival schedules
						</p>
					</div>
					<button
						ref={closeButtonRef}
						type="button"
						onClick={onClose}
						className={`p-2 rounded-lg transition-colors focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none ${
							isLight ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
						}`}
						aria-label="Close settings dialog"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-1">
					{/* Theme Mode Selector */}
					<div>
						<label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
							Visual Theme & Contrast
						</label>
						<div className="grid grid-cols-3 gap-2">
							{(['light', 'dark', 'contrast'] as ThemeMode[]).map((mode) => (
								<button
									key={mode}
									type="button"
									onClick={() => onUpdatePreferences({ theme: mode })}
									className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none ${
										preferences.theme === mode
											? isLight
												? 'bg-sky-600 text-white border-sky-600 shadow-xs'
												: 'bg-sky-500 text-white border-sky-500 shadow-xs'
											: isLight
											? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
											: 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
									}`}
								>
									{mode === 'light' && <Sun className="w-3.5 h-3.5" />}
									{mode === 'dark' && <Moon className="w-3.5 h-3.5" />}
									{mode === 'contrast' && <Eye className="w-3.5 h-3.5" />}
									<span className="capitalize">{mode}</span>
								</button>
							))}
						</div>
					</div>

					{/* Perimeter Visual Strobe Flash */}
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<span className="text-sm font-semibold flex items-center gap-2">
								<Zap className="w-4 h-4 text-amber-500" />
								Perimeter Screen Flash
							</span>
							<p className="text-xs text-slate-500">
								Flashes a soft border around the screen when an alert arrives (essential for deaf residents).
							</p>
						</div>
						<input
							type="checkbox"
							checked={preferences.visualStrobe}
							onChange={(e) => onUpdatePreferences({ visualStrobe: e.target.checked })}
							className="w-5 h-5 accent-sky-600 cursor-pointer focus-visible:ring-4 focus-visible:ring-sky-500"
							aria-label="Toggle perimeter screen flash alert"
						/>
					</div>

					{/* Text Scaling */}
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<span className="text-sm font-semibold flex items-center gap-2">
								<Type className="w-4 h-4 text-emerald-500" />
								Enlarged Text Scaling
							</span>
							<p className="text-xs text-slate-500">
								Increases typography scale for enhanced legibility from a distance.
							</p>
						</div>
						<input
							type="checkbox"
							checked={preferences.largeFont}
							onChange={(e) => onUpdatePreferences({ largeFont: e.target.checked })}
							className="w-5 h-5 accent-emerald-600 cursor-pointer focus-visible:ring-4 focus-visible:ring-sky-500"
							aria-label="Toggle enlarged text scaling"
						/>
					</div>

					{/* Audio Chime Options */}
					<div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700'}`}>
						<div className="flex items-center justify-between mb-3">
							<div className="space-y-0.5">
								<span className="text-sm font-semibold flex items-center gap-2">
									{preferences.soundEnabled ? (
										<Volume2 className="w-4 h-4 text-sky-500" />
									) : (
										<VolumeX className="w-4 h-4 text-slate-400" />
									)}
									Optional Doorbell Chime
								</span>
								<p className="text-xs text-slate-500">
									Synthesized Ding-Dong tone (Disabled by default for visual-first mode).
								</p>
							</div>
							<input
								type="checkbox"
								checked={preferences.soundEnabled}
								onChange={(e) => onUpdatePreferences({ soundEnabled: e.target.checked })}
								className="w-5 h-5 accent-sky-600 cursor-pointer focus-visible:ring-4 focus-visible:ring-sky-500"
								aria-label="Toggle optional audio chime"
							/>
						</div>

						{preferences.soundEnabled && (
							<div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
								<div className="flex items-center justify-between gap-4">
									<label htmlFor="volume-slider" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
										Chime Volume: {preferences.chimeVolume}%
									</label>
									<button
										type="button"
										onClick={() => playRingChime(preferences.chimeVolume)}
										className={`px-3 py-1 rounded-md text-xs font-bold border transition-colors ${
											isLight ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800' : 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700'
										}`}
									>
										Test Chime
									</button>
								</div>
								<input
									id="volume-slider"
									type="range"
									min="10"
									max="100"
									value={preferences.chimeVolume}
									onChange={(e) => onUpdatePreferences({ chimeVolume: Number(e.target.value) })}
									className="w-full accent-sky-600"
								/>
							</div>
						)}
					</div>

					{/* Familiar Context / Caregiver Arrival Windows */}
					<div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700'}`}>
						<div className="flex items-center gap-2 mb-2">
							<Calendar className="w-4 h-4 text-emerald-500" />
							<h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
								Familiar Routine Windows
							</h3>
						</div>
						<p className="text-xs text-slate-500 mb-3">
							Configures expected arrival hours (e.g. Caregivers, Postal carriers). Matches generate conservative "Possible familiar-context match" guidance.
						</p>

						<div className="space-y-2 mb-3">
							{(preferences.routineWindows || []).map((win) => (
								<div
									key={win.id}
									className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
										isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'
									}`}
								>
									<div>
										<span className="font-bold block">{win.label}</span>
										<span className="text-slate-500 font-mono">
											{win.startHour}:00 - {win.endHour}:00 ({win.days})
										</span>
									</div>
									<button
										type="button"
										onClick={() => handleRemoveRoutine(win.id)}
										className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
										aria-label={`Remove routine ${win.label}`}
									>
										<Trash2 className="w-3.5 h-3.5" />
									</button>
								</div>
							))}
						</div>

						{/* Add routine form */}
						<form onSubmit={handleAddRoutine} className="flex gap-2">
							<input
								type="text"
								value={newLabel}
								onChange={(e) => setNewLabel(e.target.value)}
								placeholder="e.g. Physical Therapist"
								className={`flex-1 px-3 py-1.5 rounded-lg text-xs border ${
									isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
								}`}
							/>
							<button
								type="submit"
								disabled={!newLabel.trim()}
								className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-40 flex items-center gap-1"
							>
								<Plus className="w-3.5 h-3.5" />
								Add
							</button>
						</form>
					</div>
				</div>

				{/* Modal Footer */}
				<div
					className={`pt-4 border-t flex justify-end ${
						isLight ? 'border-slate-100' : 'border-slate-800'
					}`}
				>
					<button
						type="button"
						onClick={onClose}
						className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none ${
							isContrast
								? 'bg-yellow-400 text-black hover:bg-yellow-300'
								: 'bg-sky-600 text-white hover:bg-sky-700 shadow-sm'
						}`}
					>
						Save & Close
					</button>
				</div>
			</div>
		</div>
	);
};
