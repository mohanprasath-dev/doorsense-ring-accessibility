import React, { useState } from 'react';
import type { ThemeMode } from '../types.js';
import {
	Package,
	Users,
	HelpCircle,
	UserX,
	Layers,
	Zap,
	AlertTriangle
} from 'lucide-react';

interface SimulatorControlsProps {
	onSimulate: (scenario: string, count?: number) => Promise<void>;
	onToggleDegraded: (degraded: boolean) => Promise<void>;
	isDegraded: boolean;
	theme: ThemeMode;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
	onSimulate,
	onToggleDegraded,
	isDegraded,
	theme,
}) => {
	const [activeLoading, setActiveLoading] = useState<string | null>(null);

	const isLight = theme === 'light';
	const isContrast = theme === 'contrast';

	const handleAction = async (scenario: string, count: number = 1) => {
		try {
			setActiveLoading(scenario);
			await onSimulate(scenario, count);
		} finally {
			setActiveLoading(null);
		}
	};

	return (
		<section
			aria-labelledby="simulator-heading"
			className={`rounded-2xl p-6 border transition-all ${
				isContrast
					? 'bg-black border-2 border-yellow-400 text-white'
					: isLight
					? 'bg-white border-slate-200/90 text-slate-900 shadow-sm'
					: 'bg-slate-900/80 border-slate-800 text-slate-100'
			}`}
		>
			<div
				className={`flex items-center justify-between mb-4 pb-3 border-b ${
					isLight ? 'border-slate-100' : 'border-slate-800'
				}`}
			>
				<div className="flex items-center gap-2">
					<div
						className={`p-2 rounded-lg ${
							isLight ? 'bg-amber-100 text-amber-700' : 'bg-slate-800 text-amber-400'
						}`}
					>
						<Zap className="w-5 h-5" aria-hidden="true" />
					</div>
					<div>
						<h2 id="simulator-heading" className="text-lg font-bold">
							Ring Runtime Live Simulator
						</h2>
						<p className="text-xs text-slate-500">
							Simulates authentic inbound Ring Ding & Motion payloads through the real adapter
						</p>
					</div>
				</div>
				<span
					className={`text-xs px-2.5 py-1 rounded-full font-mono font-medium ${
						isLight ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-slate-800 text-slate-300'
					}`}
				>
					Instant Demo Controls
				</span>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
				<button
					type="button"
					disabled={activeLoading !== null}
					onClick={() => handleAction('delivery')}
					className={`p-3.5 rounded-xl border flex items-center gap-3.5 transition-all text-left focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none ${
						isContrast
							? 'bg-black border-2 border-white text-white hover:bg-neutral-900'
							: isLight
							? 'bg-amber-50/50 border-amber-200 hover:bg-amber-100/60 hover:border-amber-300 text-slate-900 shadow-xs'
							: 'bg-slate-800/80 border-slate-700 hover:bg-slate-750 text-slate-100'
					}`}
				>
					<div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
						<Package className="w-5 h-5 flex-shrink-0" />
					</div>
					<div>
						<span className="block text-sm font-bold">1. Delivery</span>
						<span className="block text-xs text-slate-500 dark:text-slate-400">Package sensor flag</span>
					</div>
				</button>

				<button
					type="button"
					disabled={activeLoading !== null}
					onClick={() => handleAction('familiar')}
					className={`p-3.5 rounded-xl border flex items-center gap-3.5 transition-all text-left focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none ${
						isContrast
							? 'bg-black border-2 border-white text-white hover:bg-neutral-900'
							: isLight
							? 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-100/60 hover:border-emerald-300 text-slate-900 shadow-xs'
							: 'bg-slate-800/80 border-slate-700 hover:bg-slate-750 text-slate-100'
					}`}
				>
					<div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
						<Users className="w-5 h-5 flex-shrink-0" />
					</div>
					<div>
						<span className="block text-sm font-bold">2. Familiar Context</span>
						<span className="block text-xs text-slate-500 dark:text-slate-400">Scheduled caregiver</span>
					</div>
				</button>

				<button
					type="button"
					disabled={activeLoading !== null}
					onClick={() => handleAction('unclassified')}
					className={`p-3.5 rounded-xl border flex items-center gap-3.5 transition-all text-left focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none ${
						isContrast
							? 'bg-black border-2 border-white text-white hover:bg-neutral-900'
							: isLight
							? 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-900 shadow-xs'
							: 'bg-slate-800/80 border-slate-700 hover:bg-slate-750 text-slate-100'
					}`}
				>
					<div className="p-2 rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-400">
						<HelpCircle className="w-5 h-5 flex-shrink-0" />
					</div>
					<div>
						<span className="block text-sm font-bold">3. Ambiguous Motion</span>
						<span className="block text-xs text-slate-500 dark:text-slate-400">Safe unclassified visitor</span>
					</div>
				</button>

				<button
					type="button"
					disabled={activeLoading !== null}
					onClick={() => handleAction('person')}
					className={`p-3.5 rounded-xl border flex items-center gap-3.5 transition-all text-left focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none ${
						isContrast
							? 'bg-black border-2 border-white text-white hover:bg-neutral-900'
							: isLight
							? 'bg-sky-50/50 border-sky-200 hover:bg-sky-100/60 hover:border-sky-300 text-slate-900 shadow-xs'
							: 'bg-slate-800/80 border-slate-700 hover:bg-slate-750 text-slate-100'
					}`}
				>
					<div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
						<UserX className="w-5 h-5 flex-shrink-0" />
					</div>
					<div>
						<span className="block text-sm font-bold">4. Person Detected</span>
						<span className="block text-xs text-slate-500 dark:text-slate-400">Identity unverified</span>
					</div>
				</button>

				<button
					type="button"
					disabled={activeLoading !== null}
					onClick={() => handleAction('delivery', 3)}
					className={`p-3.5 rounded-xl border flex items-center gap-3.5 transition-all text-left focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none ${
						isContrast
							? 'bg-black border-2 border-white text-white hover:bg-neutral-900'
							: isLight
							? 'bg-rose-50/50 border-rose-200 hover:bg-rose-100/60 hover:border-rose-300 text-slate-900 shadow-xs'
							: 'bg-slate-800/80 border-slate-700 hover:bg-slate-750 text-slate-100'
					}`}
				>
					<div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
						<Layers className="w-5 h-5 flex-shrink-0" />
					</div>
					<div>
						<span className="block text-sm font-bold">5. Rapid Burst (3×)</span>
						<span className="block text-xs text-slate-500 dark:text-slate-400">Deduplication test</span>
					</div>
				</button>

				<button
					type="button"
					disabled={activeLoading !== null}
					onClick={() => onToggleDegraded(!isDegraded)}
					className={`p-3.5 rounded-xl border flex items-center gap-3.5 transition-all text-left focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none ${
						isDegraded
							? 'bg-rose-100 border-rose-400 text-rose-900 font-bold'
							: isContrast
							? 'bg-black border-2 border-white text-white hover:bg-neutral-900'
							: isLight
							? 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-900 shadow-xs'
							: 'bg-slate-800/80 border-slate-700 hover:bg-slate-750 text-slate-100'
					}`}
				>
					<div className={`p-2 rounded-lg ${isDegraded ? 'bg-rose-500 text-white' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
						<AlertTriangle className="w-5 h-5 flex-shrink-0" />
					</div>
					<div>
						<span className="block text-sm font-bold">
							{isDegraded ? 'Restore Ring Online' : '6. Test Degraded Mode'}
						</span>
						<span className="block text-xs text-slate-500 dark:text-slate-400">
							{isDegraded ? 'Provider offline' : 'Simulate offline status'}
						</span>
					</div>
				</button>
			</div>
		</section>
	);
};
