import React from 'react';
import type { InterpretedEvent } from '../types.js';
import { Package, Users, UserX, Activity, HelpCircle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface LiveAlertBannerProps {
	event: InterpretedEvent | null;
	onDismiss: () => void;
	highContrast?: boolean;
}

export const LiveAlertBanner: React.FC<LiveAlertBannerProps> = ({
	event,
	onDismiss,
	highContrast = false,
}) => {
	if (!event) return null;

	const getIcon = () => {
		switch (event.category) {
			case 'Possible delivery':
				return <Package className="w-8 h-8 text-amber-400" aria-hidden="true" />;
			case 'Possible familiar-context match':
				return <Users className="w-8 h-8 text-emerald-400" aria-hidden="true" />;
			case 'Person detected, identity unknown':
				return <UserX className="w-8 h-8 text-sky-400" aria-hidden="true" />;
			case 'Motion detected, person not confirmed':
				return <Activity className="w-8 h-8 text-indigo-400" aria-hidden="true" />;
			case 'Unclassified event':
			default:
				return <HelpCircle className="w-8 h-8 text-slate-400" aria-hidden="true" />;
		}
	};

	const getBadgeClasses = () => {
		if (highContrast) {
			return 'bg-yellow-400 text-black border-2 border-white font-bold';
		}
		switch (event.category) {
			case 'Possible delivery':
				return 'bg-amber-950/80 text-amber-300 border border-amber-500/40';
			case 'Possible familiar-context match':
				return 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40';
			case 'Person detected, identity unknown':
				return 'bg-sky-950/80 text-sky-300 border border-sky-500/40';
			case 'Motion detected, person not confirmed':
				return 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/40';
			default:
				return 'bg-slate-800 text-slate-300 border border-slate-600';
		}
	};

	const formattedTime = new Date(event.occurredAt).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	});

	return (
		<section
			aria-live="polite"
			aria-label="Live doorbell event alert"
			className={`w-full rounded-2xl p-6 transition-all shadow-2xl relative ${
				highContrast
					? 'bg-black border-4 border-yellow-400 text-white'
					: 'bg-slate-900/90 border-2 border-slate-700/80 text-slate-100 backdrop-blur-md'
			}`}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-start gap-4">
					<div
						className={`p-3 rounded-xl border ${
							highContrast ? 'border-yellow-400 bg-black' : 'border-slate-700 bg-slate-800/80'
						}`}
					>
						{getIcon()}
					</div>

					<div className="space-y-1">
						<div className="flex flex-wrap items-center gap-2">
							<span
								className={`px-3 py-1 rounded-md text-xs tracking-wider uppercase font-semibold ${getBadgeClasses()}`}
							>
								{event.category}
							</span>

							{event.groupCount > 1 && (
								<span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-950/90 text-rose-300 border border-rose-600/50">
									Grouped: {event.groupCount} events within 60s
								</span>
							)}

							<span className="text-xs text-slate-400 font-mono">
								{event.location} • {formattedTime}
							</span>
						</div>

						<h2 className="text-2xl font-bold tracking-tight text-white mt-1">
							{event.explanation}
						</h2>
					</div>
				</div>

				<button
					type="button"
					onClick={onDismiss}
					className="p-2 text-slate-400 hover:text-white rounded-lg focus-visible:ring-4 focus-visible:ring-sky-400 focus-visible:outline-none transition-colors"
					aria-label="Dismiss alert"
				>
					<X className="w-6 h-6" />
				</button>
			</div>

			<div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
				<div>
					<h3 className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-1.5">
						Observed Evidence
					</h3>
					<ul className="space-y-1">
						{event.evidence.map((item, idx) => (
							<li key={idx} className="text-sm text-slate-300 flex items-center gap-2">
								<CheckCircle2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
								<span>{item}</span>
							</li>
						))}
					</ul>
				</div>

				<div>
					<h3 className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-1.5">
						Recommended Action
					</h3>
					<p className="text-sm font-medium text-amber-200 bg-amber-950/40 p-2.5 rounded-lg border border-amber-900/50">
						{event.nextAction}
					</p>
				</div>
			</div>
		</section>
	);
};
