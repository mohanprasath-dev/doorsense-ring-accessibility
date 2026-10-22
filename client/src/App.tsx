import React, { useState, useEffect } from 'react';
import type { InterpretedEvent, UserPreferences } from './types.js';
import { LiveAlertBanner } from './components/LiveAlertBanner.js';
import { EventTimeline } from './components/EventTimeline.js';
import { SimulatorControls } from './components/SimulatorControls.js';
import { SettingsModal } from './components/SettingsModal.js';
import { Bell, SlidersHorizontal, Sun, Moon, Wifi, AlertTriangle } from 'lucide-react';

export const App: React.FC = () => {
	const [events, setEvents] = useState<InterpretedEvent[]>([]);
	const [activeEvent, setActiveEvent] = useState<InterpretedEvent | null>(null);
	const [isDegraded, setIsDegraded] = useState<boolean>(false);
	const [providerMessage, setProviderMessage] = useState<string>('Connecting to Ring runtime...');
	const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

	const [preferences, setPreferences] = useState<UserPreferences>(() => {
		const saved = localStorage.getItem('doorsense_preferences');
		if (saved) {
			try {
				return JSON.parse(saved);
			} catch {
				// Fallback to defaults
			}
		}
		return {
			highContrast: false,
			soundEnabled: false, // OFF by default
			largeFont: false,
			autoDismissSeconds: 0,
		};
	});

	useEffect(() => {
		localStorage.setItem('doorsense_preferences', JSON.stringify(preferences));
	}, [preferences]);

	// Fetch initial health and event history
	useEffect(() => {
		const fetchInitialData = async () => {
			try {
				const [healthRes, eventsRes] = await Promise.all([
					fetch('/api/health'),
					fetch('/api/events'),
				]);

				if (healthRes.ok) {
					const health = await healthRes.json();
					setIsDegraded(health.status === 'degraded');
					setProviderMessage(health.ringProvider || 'Ring connected');
				}

				if (eventsRes.ok) {
					const data = await eventsRes.json();
					if (Array.isArray(data.events)) {
						setEvents(data.events);
						if (data.events.length > 0) {
							setActiveEvent(data.events[0]);
						}
					}
				}
			} catch (err) {
				console.error('Error initializing DoorSense client:', err);
				setIsDegraded(true);
				setProviderMessage('Offline / unable to reach server');
			}
		};

		fetchInitialData();

		// Real-time SSE event listener
		const eventSource = new EventSource('/api/events/stream');

		eventSource.onmessage = (e) => {
			try {
				const newEvent: InterpretedEvent = JSON.parse(e.data);
				setActiveEvent(newEvent);
				setEvents((prev) => {
					// Check if item already exists (updated group count)
					const existingIndex = prev.findIndex((item) => item.id === newEvent.id);
					if (existingIndex >= 0) {
						const updated = [...prev];
						updated[existingIndex] = newEvent;
						return updated;
					}
					return [newEvent, ...prev];
				});

				// Optional voice announcement (only if explicitly enabled by user)
				if (preferences.soundEnabled && 'speechSynthesis' in window) {
					const utterance = new SpeechSynthesisUtterance(
						`${newEvent.category} at ${newEvent.location}. ${newEvent.explanation}`
					);
					window.speechSynthesis.speak(utterance);
				}
			} catch (parseErr) {
				console.error('Error parsing SSE event:', parseErr);
			}
		};

		eventSource.onerror = () => {
			// Browser will automatically retry SSE connection
		};

		return () => {
			eventSource.close();
		};
	}, [preferences.soundEnabled]);

	const handleSimulate = async (scenario: string, count: number = 1) => {
		try {
			await fetch('/api/ring/simulate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ scenario, count }),
			});
		} catch (err) {
			console.error('Simulation request failed:', err);
		}
	};

	const handleToggleDegraded = async (degraded: boolean) => {
		try {
			const res = await fetch('/api/ring/degraded', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ degraded }),
			});
			if (res.ok) {
				const data = await res.json();
				setIsDegraded(data.status === 'degraded');
				setProviderMessage(data.ringProvider);
			}
		} catch (err) {
			console.error('Toggle degraded request failed:', err);
		}
	};

	return (
		<div
			className={`min-h-screen transition-colors duration-200 ${
				preferences.highContrast
					? 'bg-black text-white high-contrast'
					: 'bg-slate-950 text-slate-100'
			} ${preferences.largeFont ? 'text-lg' : 'text-base'}`}
		>
			<header
				className={`w-full border-b sticky top-0 z-40 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between ${
					preferences.highContrast
						? 'bg-black border-white'
						: 'bg-slate-950/80 border-slate-800'
				}`}
			>
				<div className="flex items-center gap-3">
					<div
						className={`p-2 rounded-xl border ${
							preferences.highContrast
								? 'bg-yellow-400 text-black border-white'
								: 'bg-sky-500/10 text-sky-400 border-sky-500/30'
						}`}
					>
						<Bell className="w-6 h-6" aria-hidden="true" />
					</div>
					<div>
						<h1 className="text-xl font-bold tracking-tight">DoorSense</h1>
						<p className="text-xs text-slate-400">Accessible Ring Companion</p>
					</div>
				</div>

				<div className="flex items-center gap-3">
					{/* Status badge */}
					<div
						className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
							isDegraded
								? 'bg-rose-950/80 text-rose-300 border-rose-600/50'
								: preferences.highContrast
								? 'bg-black text-yellow-400 border-yellow-400'
								: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40'
						}`}
					>
						{isDegraded ? (
							<AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
						) : (
							<Wifi className="w-3.5 h-3.5 text-emerald-400" />
						)}
						<span>{isDegraded ? 'Ring Degraded' : 'Ring Online'}</span>
					</div>

					{/* Quick High Contrast Toggle */}
					<button
						type="button"
						onClick={() =>
							setPreferences((p) => ({ ...p, highContrast: !p.highContrast }))
						}
						className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 focus-visible:ring-4 focus-visible:ring-sky-400 focus-visible:outline-none"
						aria-label={
							preferences.highContrast
								? 'Switch to standard dark contrast'
								: 'Switch to high contrast mode'
						}
					>
						{preferences.highContrast ? (
							<Sun className="w-5 h-5 text-yellow-400" />
						) : (
							<Moon className="w-5 h-5" />
						)}
					</button>

					{/* Settings button */}
					<button
						type="button"
						onClick={() => setIsSettingsOpen(true)}
						className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 focus-visible:ring-4 focus-visible:ring-sky-400 focus-visible:outline-none"
						aria-label="Open accessibility settings"
					>
						<SlidersHorizontal className="w-5 h-5" />
					</button>
				</div>
			</header>

			<main className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
				{/* Degraded State Alert */}
				{isDegraded && (
					<div
						role="alert"
						className={`p-4 rounded-xl border flex items-center gap-3 ${
							preferences.highContrast
								? 'bg-black border-2 border-yellow-400 text-yellow-400'
								: 'bg-rose-950/70 border-rose-800 text-rose-200'
						}`}
					>
						<AlertTriangle className="w-6 h-6 flex-shrink-0 text-rose-400" />
						<div>
							<h2 className="text-sm font-bold">Ring Provider Notice</h2>
							<p className="text-xs text-rose-300/90">{providerMessage}</p>
						</div>
					</div>
				)}

				{/* Active Alert Banner */}
				<LiveAlertBanner
					event={activeEvent}
					onDismiss={() => setActiveEvent(null)}
					highContrast={preferences.highContrast}
				/>

				{/* Event Timeline & History */}
				<EventTimeline
					events={events}
					selectedEventId={activeEvent?.id}
					onSelectEvent={(ev) => setActiveEvent(ev)}
					highContrast={preferences.highContrast}
				/>

				{/* Ring Runtime Simulator Controls */}
				<SimulatorControls
					onSimulate={handleSimulate}
					onToggleDegraded={handleToggleDegraded}
					isDegraded={isDegraded}
					highContrast={preferences.highContrast}
				/>
			</main>

			<SettingsModal
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
				preferences={preferences}
				onUpdatePreferences={(newPrefs) => setPreferences((p) => ({ ...p, ...newPrefs }))}
			/>
		</div>
	);
};
export default App;
