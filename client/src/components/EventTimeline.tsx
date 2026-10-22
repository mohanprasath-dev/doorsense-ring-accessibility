import React, { useState, useMemo } from 'react';
import type { InterpretedEvent, ThemeMode, InterpretationCategory } from '../types.js';
import { EventCard } from './EventCard.js';
import {
	History,
	ShieldCheck,
	Search,
	Trash2,
	Download,
	Filter,
	X
} from 'lucide-react';

interface EventTimelineProps {
	events: InterpretedEvent[];
	selectedEventId?: string;
	onSelectEvent: (event: InterpretedEvent) => void;
	onClearHistory: () => Promise<void>;
	theme: ThemeMode;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({
	events,
	selectedEventId,
	onSelectEvent,
	onClearHistory,
	theme,
}) => {
	const isLight = theme === 'light';
	const isContrast = theme === 'contrast';

	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<string>('all');
	const [confirmClear, setConfirmClear] = useState(false);

	// Filtering logic
	const filteredEvents = useMemo(() => {
		return events.filter((ev) => {
			const matchesCategory =
				selectedCategory === 'all' ||
				ev.category.toLowerCase().includes(selectedCategory.toLowerCase());

			const query = searchTerm.toLowerCase().trim();
			const matchesSearch =
				!query ||
				ev.category.toLowerCase().includes(query) ||
				ev.explanation.toLowerCase().includes(query) ||
				ev.location.toLowerCase().includes(query);

			return matchesCategory && matchesSearch;
		});
	}, [events, selectedCategory, searchTerm]);

	// Export log to clean JSON file
	const handleExport = () => {
		const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
		const downloadAnchor = document.createElement('a');
		downloadAnchor.setAttribute('href', dataStr);
		downloadAnchor.setAttribute('download', `doorsense-events-${new Date().toISOString().slice(0, 10)}.json`);
		document.body.appendChild(downloadAnchor);
		downloadAnchor.click();
		downloadAnchor.remove();
	};

	const categories = [
		{ id: 'all', label: 'All Events' },
		{ id: 'delivery', label: 'Deliveries' },
		{ id: 'familiar', label: 'Familiar Context' },
		{ id: 'person', label: 'Person' },
		{ id: 'motion', label: 'Motion' },
	];

	return (
		<section
			aria-labelledby="timeline-heading"
			className={`rounded-2xl p-6 border transition-all ${
				isContrast
					? 'bg-black border-2 border-white text-white'
					: isLight
					? 'bg-white border-slate-200/90 text-slate-900 shadow-sm'
					: 'bg-slate-900/60 border-slate-800 text-slate-100'
			}`}
		>
			{/* Top Header */}
			<div
				className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
					isLight ? 'border-slate-100' : 'border-slate-800'
				}`}
			>
				<div className="flex items-center gap-2.5">
					<div
						className={`p-2 rounded-lg ${
							isLight ? 'bg-sky-100 text-sky-700' : 'bg-slate-800 text-sky-400'
						}`}
					>
						<History className="w-5 h-5" aria-hidden="true" />
					</div>
					<div>
						<h2 id="timeline-heading" className="text-lg font-bold">
							Doorbell Activity History
						</h2>
						<p className="text-xs text-slate-500">
							{filteredEvents.length} of {events.length} event records shown
						</p>
					</div>
				</div>

				{/* History Action Buttons */}
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={handleExport}
						disabled={events.length === 0}
						className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none ${
							isLight
								? 'border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-40'
								: 'border-slate-700 hover:bg-slate-800 text-slate-300 disabled:opacity-40'
						}`}
						title="Export Event Telemetry to JSON"
					>
						<Download className="w-3.5 h-3.5" />
						<span>Export JSON</span>
					</button>

					{confirmClear ? (
						<div className="flex items-center gap-1">
							<button
								type="button"
								onClick={async () => {
									await onClearHistory();
									setConfirmClear(false);
								}}
								className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
							>
								Confirm Clear
							</button>
							<button
								type="button"
								onClick={() => setConfirmClear(false)}
								className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					) : (
						<button
							type="button"
							onClick={() => setConfirmClear(true)}
							disabled={events.length === 0}
							className={`p-2 rounded-lg border text-xs font-semibold transition-colors focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none ${
								isLight
									? 'border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-40'
									: 'border-slate-700 text-slate-400 hover:text-rose-400 hover:bg-slate-800 disabled:opacity-40'
							}`}
							aria-label="Clear all recorded history"
							title="Clear all events"
						>
							<Trash2 className="w-4 h-4" />
						</button>
					)}
				</div>
			</div>

			{/* Search & Filter Toolbar */}
			<div className="my-4 flex flex-col md:flex-row gap-3">
				<div className="relative flex-1">
					<Search
						className={`w-4 h-4 absolute left-3 top-3 ${
							isLight ? 'text-slate-400' : 'text-slate-500'
						}`}
						aria-hidden="true"
					/>
					<input
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Search by location, keyword, or note..."
						className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border transition-all focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none ${
							isContrast
								? 'bg-black text-white border-white placeholder:text-neutral-500'
								: isLight
								? 'bg-slate-50 text-slate-900 border-slate-200 placeholder:text-slate-400 focus:bg-white'
								: 'bg-slate-900 text-slate-100 border-slate-800 placeholder:text-slate-500 focus:bg-slate-850'
						}`}
						aria-label="Search events"
					/>
					{searchTerm && (
						<button
							type="button"
							onClick={() => setSearchTerm('')}
							className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
							aria-label="Clear search text"
						>
							<X className="w-3.5 h-3.5" />
						</button>
					)}
				</div>

				{/* Category filter pills */}
				<div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter events by category">
					{categories.map((cat) => {
						const isActive = selectedCategory === cat.id;
						return (
							<button
								key={cat.id}
								type="button"
								role="tab"
								aria-selected={isActive}
								onClick={() => setSelectedCategory(cat.id)}
								className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none ${
									isContrast
										? isActive
											? 'bg-yellow-400 text-black border border-white'
											: 'bg-black text-white border border-white hover:bg-neutral-900'
										: isLight
										? isActive
											? 'bg-sky-600 text-white shadow-xs'
											: 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
										: isActive
										? 'bg-sky-500 text-white shadow-xs'
										: 'bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-slate-200'
								}`}
							>
								{cat.label}
							</button>
						);
					})}
				</div>
			</div>

			{/* Event List */}
			{filteredEvents.length === 0 ? (
				<div className="text-center py-12 space-y-2">
					<ShieldCheck
						className={`w-8 h-8 mx-auto ${
							isLight ? 'text-slate-300' : 'text-slate-600'
						}`}
						aria-hidden="true"
					/>
					<p className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
						No matching events found.
					</p>
					<p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
						{searchTerm || selectedCategory !== 'all'
							? 'Try clearing the search filter or choosing another category.'
							: 'Trigger an event from the Ring Simulator controls below.'}
					</p>
				</div>
			) : (
				<div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
					{filteredEvents.map((ev) => (
						<EventCard
							key={ev.id}
							event={ev}
							isSelected={ev.id === selectedEventId}
							onClick={() => onSelectEvent(ev)}
							theme={theme}
						/>
					))}
				</div>
			)}
		</section>
	);
};
