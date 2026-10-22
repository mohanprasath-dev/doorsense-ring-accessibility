import React from 'react';
import type { RingDeviceStatus, ThemeMode } from '../types.js';
import { BatteryCharging, Wifi, Video, BellRing, CheckCircle2 } from 'lucide-react';

interface DeviceStatusBarProps {
	devices: RingDeviceStatus[];
	theme: ThemeMode;
}

export const DeviceStatusBar: React.FC<DeviceStatusBarProps> = ({ devices, theme }) => {
	const isLight = theme === 'light';
	const isContrast = theme === 'contrast';

	return (
		<div
			className={`w-full rounded-xl p-4 border transition-colors ${
				isContrast
					? 'bg-black border-2 border-white text-white'
					: isLight
					? 'bg-white border-slate-200/90 text-slate-800 shadow-xs'
					: 'bg-slate-900/60 border-slate-800 text-slate-100'
			}`}
		>
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
				<div className="flex items-center gap-2">
					<CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
					<h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
						Connected Ring Hardware ({devices.length} Devices Active)
					</h3>
				</div>
				<span className="text-[11px] font-mono text-slate-400">
					Protocol: Ring Telemetry v3.2 (Local Stream)
				</span>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
				{devices.map((device) => (
					<div
						key={device.id}
						className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
							isContrast
								? 'border-white bg-black'
								: isLight
								? 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/60'
								: 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800/80'
						}`}
					>
						<div className="flex items-center gap-2.5">
							<div
								className={`p-1.5 rounded-md ${
									isLight ? 'bg-white text-sky-600 shadow-xs' : 'bg-slate-800 text-sky-400'
								}`}
							>
								{device.kind === 'doorbell' ? (
									<BellRing className="w-4 h-4" />
								) : (
									<Video className="w-4 h-4" />
								)}
							</div>
							<div>
								<span className="text-xs font-semibold block leading-tight">
									{device.name}
								</span>
								<span className="text-[10px] text-slate-400 block font-mono">
									{device.firmware}
								</span>
							</div>
						</div>

						<div className="flex items-center gap-2 text-right">
							<span
								className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
									device.battery > 50
										? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
										: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
								}`}
								title="Battery percentage"
							>
								{device.battery}%
							</span>
							<Wifi className="w-3.5 h-3.5 text-emerald-500" title={device.wifiSignal} />
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
