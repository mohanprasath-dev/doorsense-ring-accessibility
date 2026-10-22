import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import type {
	InterpretedEvent,
	UserPreferences,
	ThemeMode,
	RingDeviceStatus
} from './types.js';
import { DeviceStatusBar } from './components/DeviceStatusBar.js';
import { LiveAlertBanner } from './components/LiveAlertBanner.js';
import { EventTimeline } from './components/EventTimeline.js';
import { SimulatorControls } from './components/SimulatorControls.js';
import { SettingsModal } from './components/SettingsModal.js';
import { SkeletonAlertBanner } from './components/SkeletonAlertBanner.js';
import { SkeletonTimeline } from './components/SkeletonTimeline.js';
import { SkeletonRing3D } from './components/SkeletonRing3D.js';
import { playRingChime } from './utils/audioChime.js';
import {
	Bell,
	SlidersHorizontal,
	Sun,
	Moon,
	Eye,
	Wifi,
	AlertTriangle,
	Sparkles,
	Box
} from 'lucide-react';

const Ring3DScene = lazy(() => import('./components/Ring3DScene.js'));

export const App: React.FC = () => {
	const [events, setEvents] = useState<InterpretedEvent[]>([]);
	const [activeEvent, setActiveEvent] = useState<InterpretedEvent | null>(null);
	const [isDegraded, setIsDegraded] = useState<boolean>(false);
	const [providerMessage, setProviderMessage] = useState<string>('Connecting to Ring runtime...');
	const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [show3DView, setShow3DView] = useState<boolean>(true);
	const [strobeActive, setStrobeActive] = useState<boolean>(false);

	const [devices, setDevices] = useState<RingDeviceStatus[]>([
		{
			id: 'ring-device-01',
			name: 'Front Doorbell Pro',
			kind: 'doorbell',
			battery: 94,
			wifiSignal: 'Excellent (-54 dBm)',
			status: 'online',
			firmware: 'v3.2.14-prod',
			lastHealthCheck: new Date().toISOString(),
		},
		{
			id: 'ring-device-02',
			name: 'Driveway Floodlight Cam',
			kind: 'camera',
			battery: 100,
			wifiSignal: 'Good (-62 dBm)',
			status: 'online',
			firmware: 'v2.8.9-prod',
			lastHealthCheck: new Date().toISOString(),
		},
		{
			id: 'ring-device-03',
			name: 'Side Yard Stick Up Cam',
			kind: 'camera',
			battery: 81,
			wifiSignal: 'Fair (-68 dBm)',
			status: 'online',
			firmware: 'v2.8.9-prod',
			lastHealthCheck: new Date().toISOString(),
		},
	]);

	const [preferences, setPreferences] = useState<UserPreferences>(() => {
		const saved = localStorage.getItem('doorsense_preferences');
		if (saved) {
			try {
				return JSON.parse(saved);
			} catch {
				// Use defaults
			}
		}
		return {
			theme: 'light', // Light and clear UI by default
			soundEnabled: false, // Strictly OFF by default
			chimeVolume: 80,
			visualStrobe: true, // Screen flash enabled for visual alert
			largeFont: false,
			autoDismissSeconds: 0,
			routineWindows: [
				{
					id: 'routine-01',
					label: 'Caregiver / Nurse Arrival Window',
					startHour: 8,
					endHour: 11,
					days: 'Mon-Fri',
				},
				{
					id: 'routine-02',
					label: 'Postal & Package Delivery Window',
					startHour: 13,
					endHour: 16,
					days: 'Daily',
				},
			],
		};
	});

	useEffect(() => {
		localStorage.setItem('doorsense_preferences', JSON.stringify(preferences));
	}, [preferences]);

	// Trigger visual flash strobe
	const triggerStrobe = useCallback(() => {
		if (!preferences.visualStrobe) return;
		setStrobeActive(true);
		const timer = setTimeout(() => setStrobeActive(false), 1400);
		return () => clearTimeout(timer);
	}, [preferences.visualStrobe]);

	// Initial data fetch
	useEffect(() => {
		const fetchInitialData = async () => {
			try {
				const [healthRes, eventsRes, devicesRes] = await Promise.all([
					fetch('/api/health'),
					fetch('/api/events'),
					fetch('/api/devices'),
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

				if (devicesRes.ok) {
					const devData = await devicesRes.json();
					if (Array.isArray(devData.devices)) {
						setDevices(devData.devices);
					}
				}
			} catch (err) {
				console.warn('Backend server running in local client-mode fallback:', err);
				setIsDegraded(false);
				setProviderMessage('Operating with client-mode telemetry fallback');
			} finally {
				setIsLoading(false);
			}
		};

		fetchInitialData();

		// Live SSE stream
		let eventSource: EventSource | null = null;
		try {
			eventSource = new EventSource('/api/events/stream');
			eventSource.onmessage = (e) => {
				try {
					const newEvent: InterpretedEvent = JSON.parse(e.data);
					setActiveEvent(newEvent);
					triggerStrobe();

					setEvents((prev) => {
						const existingIndex = prev.findIndex((item) => item.id === newEvent.id);
						if (existingIndex >= 0) {
							const updated = [...prev];
							updated[existingIndex] = newEvent;
							return updated;
						}
						return [newEvent, ...prev];
					});

					// Play optional synthesized audio chime if enabled
					if (preferences.soundEnabled) {
						playRingChime(preferences.chimeVolume);
					}
				} catch (parseErr) {
					console.error('Error parsing SSE event:', parseErr);
				}
			};
		} catch (sseErr) {
			console.warn('SSE stream not available, using polling/direct updates:', sseErr);
		}

		return () => {
			if (eventSource) eventSource.close();
		};
	}, [preferences.soundEnabled, preferences.chimeVolume, triggerStrobe]);

	// Simulate event
	const handleSimulate = async (scenario: string, count: number = 1) => {
		try {
			const res = await fetch('/api/ring/simulate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ scenario, count }),
			});

			if (res.ok) {
				const data = await res.json();
				if (data.latestEvent) {
					setActiveEvent(data.latestEvent);
					triggerStrobe();
					if (preferences.soundEnabled) playRingChime(preferences.chimeVolume);
				}
			} else {
				throw new Error('Server returned non-200');
			}
		} catch (err) {
			// Client-side fallback simulation to ensure 100% functionality even if offline
			const fallbackTime = new Date().toISOString();
			let fallbackEvent: InterpretedEvent;

			if (scenario === 'delivery') {
				fallbackEvent = {
					id: `client-sim-${Date.now()}`,
					normalizedEventId: `norm-${Date.now()}`,
					category: 'Possible delivery',
					confidence: 'higher',
					explanation: 'Package or carrier activity was flagged near the doorway.',
					evidence: ['Ring package flag detected', 'Doorbell chime accompanied activity'],
					nextAction: 'Check doorstep or entryway when convenient. No rush.',
					occurredAt: fallbackTime,
					groupCount: count,
					location: 'Front Door',
					eventType: 'package',
				};
			} else if (scenario === 'familiar') {
				fallbackEvent = {
					id: `client-sim-${Date.now()}`,
					normalizedEventId: `norm-${Date.now()}`,
					category: 'Possible familiar-context match',
					confidence: 'limited',
					explanation: 'Event corresponds with a scheduled visit window. Identity is not guaranteed.',
					evidence: ['Context matched local routine pattern: caregiver arrival window', 'Doorbell pressed'],
					nextAction: 'Glance through window or check screen if you are expecting someone.',
					occurredAt: fallbackTime,
					groupCount: count,
					location: 'Front Door',
					eventType: 'doorbell',
				};
			} else if (scenario === 'person') {
				fallbackEvent = {
					id: `client-sim-${Date.now()}`,
					normalizedEventId: `norm-${Date.now()}`,
					category: 'Person detected, identity unknown',
					confidence: 'limited',
					explanation: 'A person was detected at your door. Identity and intent are unverified.',
					evidence: ['Ring sensor flagged person shape or movement'],
					nextAction: 'Check door or visual display at your convenience.',
					occurredAt: fallbackTime,
					groupCount: count,
					location: 'Front Door',
					eventType: 'person',
				};
			} else {
				fallbackEvent = {
					id: `client-sim-${Date.now()}`,
					normalizedEventId: `norm-${Date.now()}`,
					category: 'Motion detected, person not confirmed',
					confidence: 'limited',
					explanation: 'Motion was observed nearby (could be shadows, pets, or foliage).',
					evidence: ['Camera triggered by movement', 'No person or package confirmed'],
					nextAction: 'No immediate action required.',
					occurredAt: fallbackTime,
					groupCount: count,
					location: 'Side Yard Camera',
					eventType: 'motion',
				};
			}

			setActiveEvent(fallbackEvent);
			triggerStrobe();
			if (preferences.soundEnabled) playRingChime(preferences.chimeVolume);
			setEvents((prev) => [fallbackEvent, ...prev]);
		}
	};

	// Toggle degraded mode
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
			} else {
				setIsDegraded(degraded);
				setProviderMessage(degraded ? 'Simulated degraded offline mode' : 'Ring runtime online');
			}
		} catch {
			setIsDegraded(degraded);
			setProviderMessage(degraded ? 'Simulated degraded offline mode' : 'Ring runtime online');
		}
	};

	// Clear history
	const handleClearHistory = async () => {
		try {
			await fetch('/api/events', { method: 'DELETE' });
		} catch {
			// ignore
		}
		setEvents([]);
		setActiveEvent(null);
	};

	// Cycle theme: light -> dark -> contrast -> light
	const cycleTheme = () => {
		setPreferences((prev) => {
			if (prev.theme === 'light') return { ...prev, theme: 'dark' };
			if (prev.theme === 'dark') return { ...prev, theme: 'contrast' };
			return { ...prev, theme: 'light' };
		});
	};

	const isLight = preferences.theme === 'light';
	const isContrast = preferences.theme === 'contrast';

	return (
		<div
			className={`min-h-screen transition-colors duration-200 ${
				isContrast
					? 'bg-black text-white high-contrast'
					: isLight
					? 'bg-slate-50 text-slate-900'
					: 'bg-slate-950 text-slate-100'
			} ${preferences.largeFont ? 'text-lg' : 'text-base'} ${
				strobeActive ? 'strobe-alert' : ''
			}`}
		>
			{/* Top Header Navigation */}
			<header
				className={`w-full border-b sticky top-0 z-40 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors ${
					isContrast
						? 'bg-black border-white'
						: isLight
						? 'bg-white/90 border-slate-200/90 shadow-xs'
						: 'bg-slate-950/85 border-slate-800/90'
				}`}
			>
				<div className="flex items-center gap-3">
					<div
						className={`p-2 rounded-xl border flex items-center justify-center transition-transform hover:scale-105 ${
							isContrast
								? 'bg-yellow-400 text-black border-white'
								: isLight
								? 'bg-sky-600 text-white border-sky-500 shadow-sm'
								: 'bg-gradient-to-br from-sky-400 to-blue-600 text-slate-950 border-sky-300/40'
						}`}
					>
						<Bell className="w-5 h-5 font-bold" aria-hidden="true" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h1 className="text-xl font-extrabold tracking-tight">DoorSense</h1>
							<span
								className={`hidden md:inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
									isLight
										? 'bg-sky-50 text-sky-800 border-sky-200'
										: 'bg-slate-800 text-slate-300 border-slate-700'
								}`}
							>
								<Sparkles className="w-3 h-3 text-amber-500" />
								Ring Accessibility Track
							</span>
						</div>
						<p className="text-xs text-slate-500 dark:text-slate-400">
							Calm, visual-first Ring guidance for deaf & older residents
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2 sm:gap-3">
					{/* 3D Telemetry Toggle */}
					<button
						type="button"
						onClick={() => setShow3DView((v) => !v)}
						className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none ${
							show3DView
								? isLight
									? 'bg-sky-50 border-sky-300 text-sky-800'
									: 'bg-sky-500/15 border-sky-500/50 text-sky-300'
								: isLight
								? 'bg-slate-100 border-slate-200 text-slate-600'
								: 'bg-slate-900 border-slate-700 text-slate-400'
						}`}
						aria-label={show3DView ? 'Hide 3D telemetry view' : 'Show 3D telemetry view'}
					>
						<Box className="w-3.5 h-3.5" />
						<span>{show3DView ? '3D Active' : '3D Paused'}</span>
					</button>

					{/* Live Provider Status */}
					<div
						className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
							isDegraded
								? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-600/50'
								: isContrast
								? 'bg-black text-yellow-400 border-yellow-400'
								: isLight
								? 'bg-emerald-50 text-emerald-800 border-emerald-300'
								: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40'
						}`}
					>
						{isDegraded ? (
							<AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
						) : (
							<Wifi className="w-3.5 h-3.5 text-emerald-500" />
						)}
						<span className="hidden sm:inline">
							{isDegraded ? 'Ring Degraded' : 'Ring Online'}
						</span>
					</div>

					{/* 3-State Theme Cycle Button */}
					<button
						type="button"
						onClick={cycleTheme}
						className={`p-2 rounded-lg border text-xs font-bold transition-all focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none flex items-center gap-1.5 ${
							isLight
								? 'border-slate-200 bg-slate-100/80 hover:bg-slate-200 text-slate-700'
								: isContrast
								? 'border-white bg-black text-yellow-400'
								: 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300'
						}`}
						aria-label={`Current theme: ${preferences.theme}. Click to switch theme.`}
						title={`Theme: ${preferences.theme.toUpperCase()}`}
					>
						{preferences.theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
						{preferences.theme === 'dark' && <Moon className="w-4 h-4 text-sky-400" />}
						{preferences.theme === 'contrast' && <Eye className="w-4 h-4 text-yellow-400" />}
						<span className="hidden md:inline capitalize text-[11px]">{preferences.theme}</span>
					</button>

					{/* Settings Modal Button */}
					<button
						type="button"
						onClick={() => setIsSettingsOpen(true)}
						className={`p-2 rounded-lg border transition-colors focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:outline-none ${
							isLight
								? 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-xs'
								: 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300'
						}`}
						aria-label="Open DoorSense settings"
					>
						<SlidersHorizontal className="w-4 h-4" />
					</button>
				</div>
			</header>

			{/* Main Content Dashboard */}
			<main className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
				{/* Degraded State Notice */}
				{isDegraded && (
					<div
						role="alert"
						className={`p-4 rounded-xl border flex items-center gap-3 ${
							isContrast
								? 'bg-black border-2 border-yellow-400 text-yellow-400'
								: isLight
								? 'bg-rose-50 border-rose-300 text-rose-900 font-medium'
								: 'bg-rose-950/70 border-rose-800 text-rose-200'
						}`}
					>
						<AlertTriangle className="w-6 h-6 flex-shrink-0 text-rose-500" />
						<div>
							<h2 className="text-sm font-bold">Ring Provider Notice</h2>
							<p className="text-xs opacity-90">{providerMessage}</p>
						</div>
					</div>
				)}

				{/* Real-World Connected Ring Devices Bar */}
				<DeviceStatusBar devices={devices} theme={preferences.theme} />

				{/* Interactive 3D Ring Telemetry Device */}
				{show3DView && (
					<Suspense fallback={<SkeletonRing3D />}>
						<Ring3DScene
							activeCategory={activeEvent?.category}
							isDegraded={isDegraded}
							theme={preferences.theme}
						/>
					</Suspense>
				)}

				{/* Live Alert Banner */}
				{isLoading ? (
					<SkeletonAlertBanner highContrast={isContrast} />
				) : (
					<LiveAlertBanner
						event={activeEvent}
						onDismiss={() => setActiveEvent(null)}
						theme={preferences.theme}
					/>
				)}

				{/* Event Activity Timeline */}
				{isLoading ? (
					<SkeletonTimeline highContrast={isContrast} />
				) : (
					<EventTimeline
						events={events}
						selectedEventId={activeEvent?.id}
						onSelectEvent={(ev) => setActiveEvent(ev)}
						onClearHistory={handleClearHistory}
						theme={preferences.theme}
					/>
				)}

				{/* Ring Runtime Live Simulator Drawer */}
				<SimulatorControls
					onSimulate={handleSimulate}
					onToggleDegraded={handleToggleDegraded}
					isDegraded={isDegraded}
					theme={preferences.theme}
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
