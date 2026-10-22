import React from 'react';
import type { InterpretedEvent, ThemeMode } from '../types.js';
import { Package, Users, UserX, Activity, HelpCircle, ChevronRight, MapPin, Clock } from 'lucide-react';

interface EventCardProps {
	event: InterpretedEvent;
	isSelected?: boolean;
	onClick?: () => void;
	theme: ThemeMode;
}

export const EventCard: React.FC<EventCardProps> = ({
	event,
	isSelected = false,
	onClick,
	theme,
}) => {
	const isLight = theme === 'light';
	const isContrast = theme === 'contrast';

	const getIcon = () => {
		const iconClass = 'w-5 h-5 flex-shrink-0';
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
				return <HelpCircle className={`${iconClass} text-slate-400`} aria-hidden="true" />;
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
			className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-4 focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none ${
				isContrast
					? isSelected
						? 'bg-yellow-400 text-black border-2 border-white'
						: 'bg-black text-white border-2 border-white hover:bg-neutral-900'
					: isLight
					? isSelected
						? 'bg-sky-50/80 border-sky-400 text-slate-900 shadow-sm ring-1 ring-sky-400'
						: 'bg-white border-slate-200/90 hover:bg-slate-50/90 text-slate-800 shadow-xs'
					: isSelected
					? 'bg-slate-800/90 border-sky-500 shadow-md ring-1 ring-sky-500 text-slate-100'
					: 'bg-slate-900/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-200'
			}`}
			aria-label={`${event.category} at ${event.location}, ${formattedTime}. ${event.explanation}`}
		>
			<div className="flex items-center gap-3.5">
				<div
					className={`p-2.5 rounded-xl border ${
						isContrast
							? 'border-current bg-black'
							: isLight
							? 'border-slate-200/80 bg-slate-50 shadow-xs'
							: 'border-slate-700 bg-slate-800/60'
					}`}
				>
					{getIcon()}
				</div>
				<div>
					<div className="flex items-center gap-2">
						<span
							className={`font-bold text-sm ${
								isContrast ? 'text-inherit' : isLight ? 'text-slate-900' : 'text-slate-100'
							}`}
						>
							{event.category}
						</span>
						{event.groupCount > 1 && (
							<span
								className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
									isContrast
										? 'bg-white text-black'
										: isLight
										? 'bg-rose-100 text-rose-800 border border-rose-300'
										: 'bg-rose-950 text-rose-300 border border-rose-700'
								}`}
							>
								×{event.groupCount}
							</span>
						)}
					</div>
					<p
						className={`text-xs mt-0.5 font-mono flex items-center gap-1.5 ${
							isLight ? 'text-slate-500' : 'text-slate-400'
						}`}
					>
						<span>{event.location}</span>
						<span>•</span>
						<span>{formattedTime}</span>
					</p>
				</div>
			</div>

			<ChevronRight
				className={`w-4 h-4 flex-shrink-0 ${
					isLight ? 'text-slate-400' : 'text-slate-500'
				}`}
			/>
		</button>
	);
};
