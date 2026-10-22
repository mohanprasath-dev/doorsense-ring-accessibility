import React from 'react';
import type { InterpretedEvent } from '../types.js';
import { EventCard } from './EventCard.js';
import { History, ShieldCheck } from 'lucide-react';

interface EventTimelineProps {
	events: InterpretedEvent[];
	selectedEventId?: string;
	onSelectEvent: (event: InterpretedEvent) => void;
	highContrast?: boolean;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({
	events,
	selectedEventId,
	onSelectEvent,
	highContrast = false,
}) => {
	return (
		<section
			aria-labelledby="timeline-heading"
			className={`rounded-2xl p-6 border ${
				highContrast
					? 'bg-black border-2 border-white text-white'
					: 'bg-slate-900/60 border-slate-800 text-slate-100'
			}`}
		>
			<div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
				<div className="flex items-center gap-2">
					<History className="w-5 h-5 text-sky-400" aria-hidden="true" />
					<h2 id="timeline-heading" className="text-lg font-bold">
						Event History
					</h2>
				</div>
				<span className="text-xs text-slate-400 font-mono">
					{events.length} {events.length === 1 ? 'event' : 'events'} recorded
				</span>
			</div>

			{events.length === 0 ? (
				<div className="text-center py-12 text-slate-400 space-y-2">
					<ShieldCheck className="w-8 h-8 mx-auto text-slate-500" aria-hidden="true" />
					<p className="text-sm font-medium">No recent door activity recorded.</p>
					<p className="text-xs text-slate-500">
						Use the Ring Simulator controls below to trigger a live demo event.
					</p>
				</div>
			) : (
				<div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
					{events.map((ev) => (
						<EventCard
							key={ev.id}
							event={ev}
							isSelected={ev.id === selectedEventId}
							onClick={() => onSelectEvent(ev)}
							highContrast={highContrast}
						/>
					))}
				</div>
			)}
		</section>
	);
};
