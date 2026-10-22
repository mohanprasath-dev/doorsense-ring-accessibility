import React, { useState } from 'react';
import { Package, Users, HelpCircle, UserX, Layers, Zap, AlertTriangle, Check } from 'lucide-react';

interface SimulatorControlsProps {
	onSimulate: (scenario: string, count?: number) => Promise<void>;
	onToggleDegraded: (degraded: boolean) => Promise<void>;
	isDegraded: boolean;
	highContrast?: boolean;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
	onSimulate,
	onToggleDegraded,
	isDegraded,
	highContrast = false,
}) => {
	const [activeLoading, setActiveLoading] = useState<string | null>(null);

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
			className={`rounded-2xl p-6 border ${
				highContrast
					? 'bg-black border-2 border-yellow-400 text-white'
					: 'bg-slate-900/80 border-slate-800 text-slate-100'
			}`}
		>
			<div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
				<div className="flex items-center gap-2">
					<Zap className="w-5 h-5 text-amber-400" aria-hidden="true" />
					<h2 id="simulator-heading" className="text-lg font-bold">
						Ring Runtime Simulator
					</h2>
				</div>
				<span className="text-xs bg-slate-800 px-2.5 py-1 rounded-full text-slate-400 font-mono">
					Hackathon Demo Controls
				</span>
			</div>

			<p className="text-xs text-slate-400 mb-4">
				Triggers authentic Ring event notification payloads directly through the server-side Ring adapter and classification engine.
			</p>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
				<button
					type="button"
					disabled={activeLoading !== null}
					onClick={() => handleAction('delivery')}
					className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left focus-visible:ring-4 focus-visible:ring-sky-400 focus-visible:outline-none ${
						highContrast
							? 'bg-black border-2 border-white text-white hover:bg-neutral-900'
							: 'bg-slate-800/80 border-slate-700 hover:bg-slate-750 text-slate-100'
					}`}
				>
					<Package className="w-5 h-5 text-amber-400 flex-shrink-0" />
					<div>
						<span className="block text-sm font-semibold">1. Delivery</span>
						<span className="block text-xs text-slate-400">Package sensor flag</span>
					</div>
				</button>

				<button
					type="button"
					disabled={activeLoading !== null}
					onClick={() => handleAction('familiar')}
					className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left focus-visible:ring-4 focus-visible:ring-sky-400 focus-visible:outline-none ${
						highContrast
							? 'bg-black border-2 border-white text-white hover:bg-neutral-900'
							: 'bg-slate-800/80 border-slate-700 hover:bg-slate-750 text-slate-100'
					}`}
				>
					<Users className="w-5 h-5 text-emerald-400 flex-shrink-0" />
					<div>
						<span className="block text-sm font-semibold">2. Familiar Context</span>
						<span className="block text-xs text-slate-400">Scheduled caregiver</span>
					</div>
				</button>

				<button
					type="button"
					disabled={activeLoading !== null}
					onClick={() => handleAction('unclassified')}
					className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left focus-visible:ring-4 focus-visible:ring-sky-400 focus-visible:outline-none ${
						highContrast
							? 'bg-black border-2 border-white text-white hover:bg-neutral-900'
							: 'bg-slate-800/80 border-slate-700 hover:bg-slate-750 text-slate-100'
					}`}
				>
					<HelpCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
					<div>
						<span className="block text-sm font-semibold">3. Ambiguous Motion</span>
						<span className="block text-xs text-slate-400">Safe unclassified visitor</span>
					</div>
				</button>

				<button
					type="button"
					disabled={activeLoading !== null}
					onClick={() => handleAction('person')}
					className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left focus-visible:ring-4 focus-visible:ring-sky-400 focus-visible:outline-none ${
						highContrast
							? 'bg-black border-2 border-white text-white hover:bg-neutral-900'
							: 'bg-slate-800/80 border-slate-700 hover:bg-slate-750 text-slate-100'
					}`}
				>
					<UserX className="w-5 h-5 text-sky-400 flex-shrink-0" />
					<div>
						<span className="block text-sm font-semibold">4. Person Detected</span>
						<span className="block text-xs text-slate-400">Identity unverified</span>
					</div>
				</button>

				<button
					type="button"
					disabled={activeLoading !== null}
					onClick={() => handleAction('delivery', 3)}
					className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left focus-visible:ring-4 focus-visible:ring-sky-400 focus-visible:outline-none ${
						highContrast
							? 'bg-black border-2 border-white text-white hover:bg-neutral-900'
							: 'bg-slate-800/80 border-slate-700 hover:bg-slate-750 text-slate-100'
					}`}
				>
					<Layers className="w-5 h-5 text-rose-400 flex-shrink-0" />
					<div>
						<span className="block text-sm font-semibold">5. Rapid Burst (3×)</span>
						<span className="block text-xs text-slate-400">Deduplication test</span>
					</div>
				</button>

				<button
					type="button"
					disabled={activeLoading !== null}
					onClick={() => onToggleDegraded(!isDegraded)}
					className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left focus-visible:ring-4 focus-visible:ring-sky-400 focus-visible:outline-none ${
						isDegraded
							? 'bg-rose-950/80 border-rose-600 text-rose-200'
							: highContrast
							? 'bg-black border-2 border-white text-white hover:bg-neutral-900'
							: 'bg-slate-800/80 border-slate-700 hover:bg-slate-750 text-slate-100'
					}`}
				>
					<AlertTriangle className={`w-5 h-5 flex-shrink-0 ${isDegraded ? 'text-rose-400' : 'text-amber-400'}`} />
					<div>
						<span className="block text-sm font-semibold">
							{isDegraded ? 'Restore Online' : '6. Test Degraded Mode'}
						</span>
						<span className="block text-xs text-slate-400">
							{isDegraded ? 'Provider offline' : 'Simulate offline status'}
						</span>
					</div>
				</button>
			</div>
		</section>
	);
};
