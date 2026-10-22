import React, { useState, useEffect, lazy, Suspense } from 'react';
import type { InterpretedEvent, UserPreferences } from './types.js';
import { LiveAlertBanner } from './components/LiveAlertBanner.js';
import { EventTimeline } from './components/EventTimeline.js';
import { SimulatorControls } from './components/SimulatorControls.js';
import { SettingsModal } from './components/SettingsModal.js';
import { SkeletonAlertBanner } from './components/SkeletonAlertBanner.js';
import { SkeletonTimeline } from './components/SkeletonTimeline.js';
import { SkeletonRing3D } from './components/SkeletonRing3D.js';
import {
	Bell,
	SlidersHorizontal,
	Sun,
	Moon,
	Wifi,
	AlertTriangle,
	Sparkles,
	Box,
	LayoutList
} from 'lucide-react';

// Lazy loaded 3D interactive Three.js scene for zero initial bundle penalty
const Ring3DScene = lazy(() => import('./components/Ring3DScene.js'));

export const App: React.FC = () => {
	const [events, setEvents] = useState<InterpretedEvent[]>([]);
	const [activeEvent, setActiveEvent] = useState<InterpretedEvent | null>(null);
	const [isDegraded, setIsDegraded] = useState<boolean>(false);
	const [providerMessage, setProviderMessage] = useState<string>('Connecting to Ring runtime...');
	const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [show3DView, setShow3DView] = useState<boolean>(true);

	const [preferences, setPreferences] = useState<UserPreferences>(() => {
		const saved = localStorage.getItem('doorsense_preferences');
		if (saved) {
			try {
				return JSON.parse(saved);
			} catch {
				// Fallback to default preferences
			}
		}
		return {
			highContrast: false,
			soundEnabled: false, // Strictly OFF by default
			largeFont: false,
			autoDismissSeconds: 0,
		};
	});

	useEffect(() => {
		localStorage.setItem('doorsense_preferences', JSON.stringify(preferences));
	}, [preferences]);

	// Initial data hydration
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
					setProviderMessage(health.ringProvider || 'Ring runtime online');
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
			} finally {
				setIsLoading(false);
			}
		};

		fetchInitialData();

		// Real-time SSE event stream
		const eventSource = new EventSource('/api/events/stream');

		eventSource.onmessage = (e) => {
			try {
				const newEvent: InterpretedEvent = JSON.parse(e.data);
				setActiveEvent(newEvent);
				setEvents((prev) => {
					const existingIndex = prev.findIndex((item) => item.id === newEvent.id);
					if (existingIndex >= 0) {
						const updated = [...prev];
						updated[existingIndex] = newEvent;
						return updated;
					}
					return [newEvent, ...prev];
				});

				// Optional voice announcement (strictly opt-in)
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
			{/* Top Navigation Bar */}
			<header
				className={`w-full border-b sticky top-0 z-40 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors ${
					preferences.highContrast
						? 'bg-black border-white'
						: 'bg-slate-950/85 border-slate-800/90'
				}`}
			>
				<div className="flex items-center gap-3">
					<div
						className={`p-2 rounded-xl border flex items-center justify-center transition-transform hover:scale-105 ${
							preferences.highContrast
								? 'bg-yellow-400 text-black border-white'
								: 'bg-gradient-to-br from-sky-400 to-blue-600 text-slate-950 shadow-lg shadow-sky-500/20 border-sky-300/40'
						}`}
					>
						<Bell className="w-5 h-5 font-bold" aria-hidden="true" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h1 className="text-xl font-bold tracking-tight">DoorSense</h1>
							<span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
								<Sparkles className="w-3 h-3 text-amber-400" />
								Ring Accessibility Track
							</span>
						</div>
						<p className="text-xs text-slate-400">
							Accessible Ring Companion for Silent Comprehension
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2.5">
					{/* 3D Visualizer Toggle */}
					<button
						type="button"
						onClick={() => setShow3DView((v) => !v)}
						className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all focus-visible:ring-4 focus-visible:ring-sky-400 focus-visible:outline-none ${
							show3DView
								? 'bg-sky-500/15 border-sky-500/50 text-sky-300'
								: 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
						}`}
						aria-label={show3DView ? 'Hide 3D telemetry device' : 'Show 3D telemetry device'}
					>
						<Box className="w-3.5 h-3.5" />
						<span>{show3DView ? '3D Active' : '3D Paused'}</span>
					</button>

					{/* Live Online / Degraded Badge */}
					<div
						className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
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
						<span className="hidden sm:inline">
							{isDegraded ? 'Ring Degraded' : 'Ring Online'}
						</span>
					</div>

					{/* High Contrast Mode Quick Toggle */}
					<button
						type="button"
						onClick={() =>
							setPreferences((p) => ({ ...p, highContrast: !p.highContrast }))
						}
						className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 focus-visible:ring-4 focus-visible:ring-sky-400 focus-visible:outline-none transition-colors"
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

					{/* Settings Modal Button */}
					<button
						type="button"
						onClick={() => setIsSettingsOpen(true)}
						className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 focus-visible:ring-4 focus-visible:ring-sky-400 focus-visible:outline-none transition-colors"
						aria-label="Open accessibility settings"
					>
						<SlidersHorizontal className="w-5 h-5" />
					</button>
				</div>
			</header>

			{/* Main Content Area */}
			<main className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
				{/* Degraded State Notification */}
				{isDegraded && (
					<div
						role="alert"
						className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
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

				{/* 3D Telemetry Device (Interactive WebGL Scene) */}
				{show3DView && (
					<Suspense fallback={<SkeletonRing3D />}>
						<Ring3DScene
							activeCategory={activeEvent?.category}
							isDegraded={isDegraded}
							highContrast={preferences.highContrast}
						/>
					</Suspense>
				)}

				{/* Active Live Alert Banner or Skeleton */}
				{isLoading ? (
					<SkeletonAlertBanner highContrast={preferences.highContrast} />
				) : (
					<LiveAlertBanner
						event={activeEvent}
						onDismiss={() => setActiveEvent(null)}
						highContrast={preferences.highContrast}
					/>
				)}

				{/* Event Timeline History or Skeleton */}
				{isLoading ? (
					<SkeletonTimeline highContrast={preferences.highContrast} />
				) : (
					<EventTimeline
						events={events}
						selectedEventId={activeEvent?.id}
						onSelectEvent={(ev) => setActiveEvent(ev)}
						highContrast={preferences.highContrast}
					/>
				)}

				{/* Ring Runtime Simulator Drawer */}
				<SimulatorControls
					onSimulate={handleSimulate}
					onToggleDegraded={handleToggleDegraded}
					isDegraded={isDegraded}
					highContrast={preferences.highContrast}
				/>
			</main>

			{/* Settings Modal */}
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
