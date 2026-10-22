import React from 'react';

interface SkeletonTimelineProps {
	highContrast?: boolean;
}

export const SkeletonTimeline: React.FC<SkeletonTimelineProps> = ({ highContrast = false }) => {
	return (
		<div
			aria-hidden="true"
			className={`rounded-2xl p-6 border space-y-3 animate-pulse ${
				highContrast
					? 'bg-black border-2 border-white'
					: 'bg-slate-900/60 border-slate-800'
			}`}
		>
			<div className="flex items-center justify-between pb-3 border-b border-slate-800">
				<div
					className={`h-5 w-32 rounded ${highContrast ? 'bg-neutral-800' : 'bg-slate-800'}`}
				/>
				<div
					className={`h-4 w-20 rounded ${highContrast ? 'bg-neutral-800' : 'bg-slate-800/60'}`}
				/>
			</div>

			{[1, 2, 3].map((idx) => (
				<div
					key={idx}
					className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
						highContrast
							? 'bg-black border-neutral-800'
							: 'bg-slate-900/40 border-slate-800/80'
					}`}
				>
					<div className="flex items-center gap-3 flex-1">
						<div
							className={`w-9 h-9 rounded-lg ${
								highContrast ? 'bg-neutral-800' : 'bg-slate-800'
							}`}
						/>
						<div className="space-y-1.5 flex-1">
							<div
								className={`h-4 w-36 rounded ${
									highContrast ? 'bg-neutral-800' : 'bg-slate-800'
								}`}
							/>
							<div
								className={`h-3 w-28 rounded ${
									highContrast ? 'bg-neutral-800' : 'bg-slate-800/60'
								}`}
							/>
						</div>
					</div>
					<div
						className={`w-4 h-4 rounded ${
							highContrast ? 'bg-neutral-800' : 'bg-slate-800/60'
						}`}
					/>
				</div>
			))}
		</div>
	);
};
