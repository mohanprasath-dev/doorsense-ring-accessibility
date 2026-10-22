import React from 'react';
import type { InterpretedEvent, ThemeMode } from '../types.js';
import {
	Package,
	Users,
	UserX,
	Activity,
	HelpCircle,
	X,
	CheckCircle2,
	Clock,
	MapPin,
	ShieldCheck
} from 'lucide-react';

interface LiveAlertBannerProps {
	event: InterpretedEvent | null;
	onDismiss: () => void;
	theme: ThemeMode;
}

export const LiveAlertBanner: React.FC<LiveAlertBannerProps> = ({
	event,
	onDismiss,
	theme,
}) => {
	if (!event) return null;

	const isLight = theme === 'light';
	const isContrast = theme === 'contrast';

	const getIcon = () => {
		const iconClass = 'w-7 h-7 flex-shrink-0';
		switch (event.category) {
			case 'Possible delivery':
				return <Package className={`${iconClass} text-amber-500`} aria-hidden="true" />;
			case 'Possible familiar-context match':
				return <Users className={`${iconClass} text-emerald-500`} aria-hidden="true" />;
			case 'Person detected, identity unknown':
				return <UserX className={`${iconClass} text-sky-500`} aria-hidden="true" />;
			case 'Motion detected, person not confirmed':
				return <Activity className={`${iconClass} text-indigo-500`} aria-hidden="true" />;
			case 'Unclassified event':
			default:
				return <HelpCircle className={`${iconClass} text-slate-500`} aria-hidden="true" />;
		}
	};

	const getBadgeClasses = () => {
		if (isContrast) {
			return 'bg-yellow-400 text-black border-2 border-white font-bold';
		}
		if (isLight) {
			switch (event.category) {
				case 'Possible delivery':
					return 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold';
				case 'Possible familiar-context match':
					return 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold';
				case 'Person detected, identity unknown':
					return 'bg-sky-100 text-sky-900 border border-sky-300 font-semibold';
				case 'Motion detected, person not confirmed':
					return 'bg-indigo-100 text-indigo-900 border border-indigo-300 font-semibold';
				default:
					return 'bg-slate-100 text-slate-800 border border-slate-300 font-semibold';
			}
		}
		// Dark mode
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
			aria-label="Live doorbell event alert banner"
			className={`w-full rounded-2xl p-6 transition-all shadow-md relative border ${
				isContrast
					? 'bg-black border-4 border-yellow-400 text-white'
					: isLight
					? 'bg-white border-slate-200/90 text-slate-900 shadow-xl shadow-slate-200/50'
					: 'bg-slate-900/90 border-slate-700/80 text-slate-100 backdrop-blur-md'
			}`}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-start gap-4">
					<div
						className={`p-3 rounded-xl border flex items-center justify-center ${
							isContrast
								? 'border-yellow-400 bg-black'
								: isLight
								? 'border-slate-200 bg-slate-50 shadow-xs'
								: 'border-slate-700 bg-slate-800/80'
						}`}
					>
						{getIcon()}
					</div>

					<div className="space-y-1">
						<div className="flex flex-wrap items-center gap-2">
							<span
								className={`px-3 py-1 rounded-md text-xs tracking-wider uppercase ${getBadgeClasses()}`}
							>
								{event.category}
							</span>

							{event.groupCount > 1 && (
								<span
									className={`px-2.5 py-1 rounded-md text-xs font-bold ${
										isContrast
											? 'bg-white text-black border border-white'
											: isLight
											? 'bg-rose-100 text-rose-800 border border-rose-300'
											: 'bg-rose-950/90 text-rose-300 border border-rose-600/50'
									}`}
								>
									Grouped: {event.groupCount} rings in last 60s
								</span>
							)}

							<span
								className={`text-xs font-mono flex items-center gap-1 ${
									isLight ? 'text-slate-500' : 'text-slate-400'
								}`}
							>
								<MapPin className="w-3 h-3" />
								{event.location} • <Clock className="w-3 h-3" /> {formattedTime}
							</span>
						</div>

						<h2
							className={`text-2xl font-extrabold tracking-tight mt-1 ${
								isContrast ? 'text-white' : isLight ? 'text-slate-900' : 'text-white'
							}`}
						>
							{event.explanation}
						</h2>
					</div>
				</div>

				<button
					type="button"
					onClick={onDismiss}
					className={`p-2 rounded-lg transition-colors focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none ${
						isLight
							? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
							: 'text-slate-400 hover:text-white hover:bg-slate-800'
					}`}
					aria-label="Dismiss alert"
				>
					<X className="w-6 h-6" />
				</button>
			</div>

			<div
				className={`mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t ${
					isLight ? 'border-slate-100' : 'border-slate-800'
				}`}
			>
				<div>
					<h3
						className={`text-xs uppercase font-bold tracking-wider mb-2 ${
							isLight ? 'text-slate-500' : 'text-slate-400'
						}`}
					>
						Observed Telemetry Evidence
					</h3>
					<ul className="space-y-1.5">
						{event.evidence.map((item, idx) => (
							<li
								key={idx}
								className={`text-sm flex items-center gap-2 ${
									isLight ? 'text-slate-700 font-medium' : 'text-slate-300'
								}`}
							>
								<CheckCircle2
									className={`w-4 h-4 flex-shrink-0 ${
										isLight ? 'text-emerald-600' : 'text-emerald-400'
									}`}
								/>
								<span>{item}</span>
							</li>
						))}
					</ul>
				</div>

				<div>
					<h3
						className={`text-xs uppercase font-bold tracking-wider mb-2 ${
							isLight ? 'text-slate-500' : 'text-slate-400'
						}`}
					>
						Recommended Low-Risk Action
					</h3>
					<div
						className={`p-3 rounded-xl border flex items-start gap-2.5 ${
							isContrast
								? 'bg-black border-2 border-white text-white'
								: isLight
								? 'bg-amber-50/80 border-amber-200/90 text-amber-950 font-medium'
								: 'bg-amber-950/40 border-amber-900/50 text-amber-200 font-medium'
						}`}
					>
						<ShieldCheck className="w-5 h-5 flex-shrink-0 text-amber-500" />
						<p className="text-sm">{event.nextAction}</p>
					</div>
				</div>
			</div>
		</section>
	);
};
