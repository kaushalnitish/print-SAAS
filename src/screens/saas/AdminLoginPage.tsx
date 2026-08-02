import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/developer-login', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans text-slate-100">
      <div className="text-center space-y-3">
        <p className="text-xs font-bold text-slate-400">Redirecting to Developer Sign In...</p>
      </div>
    </div>
  );
};
