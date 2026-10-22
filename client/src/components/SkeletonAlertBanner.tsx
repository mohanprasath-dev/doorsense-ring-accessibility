import React from 'react';

interface SkeletonAlertBannerProps {
	highContrast?: boolean;
}

export const SkeletonAlertBanner: React.FC<SkeletonAlertBannerProps> = ({ highContrast = false }) => {
	return (
		<div
			aria-hidden="true"
			className={`w-full rounded-2xl p-6 border animate-pulse ${
				highContrast
					? 'bg-black border-2 border-white'
					: 'bg-slate-900/60 border-slate-800'
			}`}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-start gap-4 flex-1">
					<div
						className={`w-14 h-14 rounded-xl ${
							highContrast ? 'bg-neutral-800' : 'bg-slate-800'
						}`}
					/>
					<div className="space-y-3 flex-1">
						<div className="flex items-center gap-3">
							<div
								className={`h-5 w-32 rounded-md ${
									highContrast ? 'bg-neutral-800' : 'bg-slate-800'
								}`}
							/>
							<div
								className={`h-4 w-40 rounded-md ${
									highContrast ? 'bg-neutral-800' : 'bg-slate-800/60'
								}`}
							/>
						</div>
						<div
							className={`h-8 w-3/4 rounded-lg ${
								highContrast ? 'bg-neutral-800' : 'bg-slate-800'
							}`}
						/>
					</div>
				</div>
			</div>

			<div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
				<div className="space-y-2">
					<div
						className={`h-3 w-28 rounded ${
							highContrast ? 'bg-neutral-800' : 'bg-slate-800/80'
						}`}
					/>
					<div
						className={`h-4 w-48 rounded ${
							highContrast ? 'bg-neutral-800' : 'bg-slate-800/50'
						}`}
					/>
					<div
						className={`h-4 w-40 rounded ${
							highContrast ? 'bg-neutral-800' : 'bg-slate-800/50'
						}`}
					/>
				</div>
				<div className="space-y-2">
					<div
						className={`h-3 w-32 rounded ${
							highContrast ? 'bg-neutral-800' : 'bg-slate-800/80'
						}`}
					/>
					<div
						className={`h-10 w-full rounded-lg ${
							highContrast ? 'bg-neutral-800' : 'bg-slate-800/40'
						}`}
					/>
				</div>
			</div>
		</div>
	);
};
