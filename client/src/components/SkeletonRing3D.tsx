import React from 'react';

export const SkeletonRing3D: React.FC = () => {
	return (
		<div
			aria-hidden="true"
			className="w-full h-[280px] sm:h-[320px] rounded-2xl bg-slate-900/40 border border-slate-800/80 animate-pulse flex flex-col items-center justify-center p-6 space-y-4"
		>
			<div className="w-16 h-36 rounded-2xl bg-slate-800/70 border border-slate-700/50 flex flex-col items-center justify-between py-3">
				<div className="w-8 h-8 rounded-full bg-slate-700/60" />
				<div className="w-9 h-9 rounded-full bg-slate-700/50 border-2 border-slate-600/50" />
			</div>
			<div className="h-3 w-40 rounded bg-slate-800/50" />
		</div>
	);
};
