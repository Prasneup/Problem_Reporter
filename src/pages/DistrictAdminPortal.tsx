import React from 'react';

export const DistrictAdminPortal: React.FC<{ activeView: string }> = () => {
  return (
    <div className="glass-panel p-6">
      <h2 className="text-base font-bold text-slate-800">District Admin Portal (Deprecated)</h2>
      <p className="text-xs text-slate-500 mt-2">This portal has been consolidated as part of the Ghorahi manual routing workflow refactor.</p>
    </div>
  );
};

export default DistrictAdminPortal;
