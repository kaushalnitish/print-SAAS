import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { 
  Printer, LayoutDashboard, ListOrdered, Building2, 
  Settings, CreditCard, LogOut, Menu, X, ChevronDown, User, Shield, Home, ArrowLeft, Eye
} from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';
import { developerAuthService } from '../../services/developerAuthService';

export const DashboardShell: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentOwner, currentShop, shops, selectShop, logout } = useSaaS();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);

  const isDeveloperSession = developerAuthService.isAuthenticated();

  // Authentication Guard: Redirect if not logged in
  useEffect(() => {
    if (!currentOwner) {
      navigate('/login');
    }
  }, [currentOwner, navigate]);

  if (!currentOwner) return null;

  const handleLogout = () => {
    developerAuthService.logout();
    logout();
    navigate('/');
  };

  const handleReturnToDeveloperConsole = () => {
    developerAuthService.clearImpersonatedShop();
    navigate('/developer');
  };

  // Strictly isolated owner navigation items - No Developer or Admin Links!
  const navItems = [
    { label: 'Home Page', path: '/', icon: <Home className="w-5 h-5 text-indigo-400" /> },
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Print Queue & Jobs', path: '/dashboard/queue', icon: <ListOrdered className="w-5 h-5" /> },
    { label: 'Customers & Outlet', path: '/dashboard/shops', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Subscription', path: '/dashboard/subscription', icon: <CreditCard className="w-5 h-5" /> },
    { label: 'Shop Settings', path: '/dashboard/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Developer Impersonation Top Banner */}
      {isDeveloperSession && (
        <div className="bg-indigo-950 text-indigo-100 border-b border-indigo-800/80 px-6 py-2.5 flex items-center justify-between gap-4 text-xs font-bold z-50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Eye className="w-4 h-4 text-indigo-400" />
            <span>Developer Impersonating Shop:</span>
            <span className="font-mono text-white underline">{currentShop?.name || 'Selected Shop'}</span>
          </div>

          <button
            onClick={handleReturnToDeveloperConsole}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Developer Console</span>
          </button>
        </div>
      )}

      <div className="flex-1 flex min-h-0">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white shrink-0 border-r border-slate-800">
          {/* Brand Header */}
          <Link 
            to="/" 
            className="p-6 border-b border-slate-800 flex items-center gap-2.5 group cursor-pointer hover:bg-slate-800/50 transition-colors"
            title="Return to Home Page"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Printer className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight block">PrintFlow</span>
              <span className="text-[10px] font-bold text-slate-400 block -mt-1 tracking-widest uppercase">Console</span>
            </div>
          </Link>

          {/* Selected Shop Context Info */}
          {currentShop && (
            <div className="p-4 border-b border-slate-800 bg-slate-950/40 relative">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Shop Tenant</p>
              <button 
                onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
                className="w-full flex items-center justify-between text-left mt-1 font-bold text-slate-200 hover:text-white transition-colors"
              >
                <span className="truncate max-w-[170px]">{currentShop.name}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Shop Switcher Dropdown */}
              {shopDropdownOpen && (
                <div className="absolute left-4 right-4 mt-2 bg-slate-800 rounded-xl border border-slate-700 shadow-xl z-20 overflow-hidden">
                  <p className="px-3.5 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-700">Switch Tenant</p>
                  <div className="max-h-48 overflow-y-auto">
                    {shops.map((shop) => (
                      <button
                        key={shop.id}
                        onClick={() => {
                          selectShop(shop.id);
                          setShopDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 py-2.5 text-left text-xs font-bold transition-colors flex items-center justify-between ${
                          currentShop.id === shop.id 
                            ? 'bg-indigo-600 text-white' 
                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{shop.name}</span>
                        {currentShop.id === shop.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Link list */}
          <nav className="flex-1 px-3 py-6 space-y-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-650/15' 
                      : 'text-slate-400 hover:bg-slate-800/65 hover:text-slate-250'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Owner Profile Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-extrabold text-xs">
                {currentOwner.name[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-200 truncate">{currentOwner.name}</p>
                <p className="text-[10px] text-slate-500 truncate font-semibold">Owner Admin</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all focus:outline-none cursor-pointer"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </aside>

        {/* Mobile Drawer Navigation overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40" onClick={() => setMobileMenuOpen(false)}>
            <aside 
              className="w-64 max-w-sm bg-slate-900 text-white h-full flex flex-col relative z-50 border-r border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 group cursor-pointer" title="Go to Home Page">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Printer className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-base text-white tracking-tight">PrintFlow</span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {currentShop && (
                <div className="p-4 border-b border-slate-800 bg-slate-950/40 relative">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Tenant Shop</p>
                  <button 
                    onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
                    className="w-full flex items-center justify-between text-left mt-1 font-extrabold text-slate-200 text-sm"
                  >
                    <span className="truncate">{currentShop.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {shopDropdownOpen && (
                    <div className="absolute left-4 right-4 mt-2 bg-slate-800 rounded-xl border border-slate-700 shadow-xl z-20">
                      {shops.map((shop) => (
                        <button
                          key={shop.id}
                          onClick={() => {
                            selectShop(shop.id);
                            setShopDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2 text-left text-xs font-bold ${
                            currentShop.id === shop.id ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {shop.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <nav className="flex-1 px-3 py-6 space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${
                        isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/50'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/20">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
                    {currentOwner.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200 truncate">{currentOwner.name}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          {/* Top Header */}
          <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 h-16 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-1.5 -ml-1 hover:bg-slate-100 rounded-lg text-slate-500 focus:outline-none"
                aria-label="Open mobile menu drawer"
              >
                <Menu className="w-5.5 h-5.5" />
              </button>
              
              {/* Clickable Brand Logo in Dashboard Header */}
              <Link 
                to="/" 
                className="flex items-center gap-2 group cursor-pointer hover:opacity-90 transition-opacity" 
                title="Return to PrintFlow Cloud Homepage"
                aria-label="PrintFlow Cloud Homepage"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <Printer className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-black text-sm tracking-tight text-slate-900 block leading-none">PrintFlow</span>
                  <span className="text-[9px] font-bold text-slate-400 block tracking-widest uppercase">Cloud</span>
                </div>
              </Link>

              <div className="hidden lg:flex items-center gap-2 text-slate-400 text-xs font-semibold ml-2 pl-3 border-l border-slate-200">
                <span className="capitalize">Console</span>
                <span>/</span>
                <span className="text-slate-800 font-bold">
                  {navItems.find((n) => n.path === location.pathname)?.label || 'Dashboard'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Dedicated Global Home Navigation Button */}
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer border border-slate-200/80 shadow-xs"
                title="Return to Home Page"
              >
                <Home className="w-4 h-4 text-indigo-600" />
                <span>Home</span>
              </Link>

              <div className="hidden md:flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Live</span>
              </div>
            </div>
          </header>

          {/* Children Render Outlet */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
