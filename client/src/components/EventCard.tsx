import React from 'react';
import type { InterpretedEvent } from '../types.js';
import { Package, Users, UserX, Activity, HelpCircle, ChevronRight } from 'lucide-react';

interface EventCardProps {
	event: InterpretedEvent;
	isSelected?: boolean;
	onClick?: () => void;
	highContrast?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
	event,
	isSelected = false,
	onClick,
	highContrast = false,
}) => {
	const getIcon = () => {
		switch (event.category) {
			case 'Possible delivery':
				return <Package className="w-5 h-5 text-amber-400" aria-hidden="true" />;
			case 'Possible familiar-context match':
				return <Users className="w-5 h-5 text-emerald-400" aria-hidden="true" />;
			case 'Person detected, identity unknown':
				return <UserX className="w-5 h-5 text-sky-400" aria-hidden="true" />;
			case 'Motion detected, person not confirmed':
				return <Activity className="w-5 h-5 text-indigo-400" aria-hidden="true" />;
			case 'Unclassified event':
			default:
				return <HelpCircle className="w-5 h-5 text-slate-400" aria-hidden="true" />;
		}
	};

	const formattedTime = new Date(event.occurredAt).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
	});

	return (
		<button
			type="button"
			onClick={onClick}
			className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-4 focus-visible:ring-4 focus-visible:ring-sky-400 focus-visible:outline-none ${
				highContrast
					? isSelected
						? 'bg-yellow-400 text-black border-2 border-white'
						: 'bg-black text-white border-2 border-white hover:bg-neutral-900'
					: isSelected
					? 'bg-slate-800/90 border-sky-500 shadow-md ring-1 ring-sky-500'
					: 'bg-slate-900/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-200'
			}`}
			aria-label={`${event.category} at ${event.location}, ${formattedTime}. ${event.explanation}`}
		>
			<div className="flex items-center gap-3">
				<div
					className={`p-2 rounded-lg border ${
						highContrast ? 'border-current' : 'border-slate-700 bg-slate-800/60'
					}`}
				>
					{getIcon()}
				</div>
				<div>
					<div className="flex items-center gap-2">
						<span className="font-semibold text-sm">{event.category}</span>
						{event.groupCount > 1 && (
							<span
								className={`text-xs px-2 py-0.5 rounded-full font-bold ${
									highContrast
										? 'bg-white text-black'
										: 'bg-slate-800 text-slate-300 border border-slate-700'
								}`}
							>
								×{event.groupCount}
							</span>
						)}
					</div>
					<p className="text-xs text-slate-400 mt-0.5 font-mono">
						{event.location} • {formattedTime}
					</p>
				</div>
			</div>

			<ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
		</button>
	);
};
