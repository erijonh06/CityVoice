
import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, Report, ViewState, ReportStatus, ToastNotification, Comment, AppNotification, AVATAR_FRAMES } from './types';
import MapDisplay from './components/MapDisplay';
import NewReportModal from './components/NewReportModal';
import ReportDetailsModal from './components/ReportDetailsModal';
import AdminDashboard from './components/AdminDashboard';
import Profile from './components/Profile';
import Gallery from './components/Gallery';
import Leaderboard from './components/Leaderboard';
import ToastContainer from './components/ToastContainer';
import Confetti from './components/Confetti';
import CivicAssistant from './components/CivicAssistant';
import CityNewsModal from './components/CityNewsModal';
import NotificationPanel from './components/NotificationPanel';
import { mockDb } from './services/mockDb';
import { useTranslation } from './TranslationContext';

const Logo = ({ className = "w-10 h-10", iconSize = "text-lg" }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-[#2D9B63] to-[#A9C942] rounded-full shadow-lg"></div>
    <div className="relative flex items-center justify-center">
       <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center scale-75 shadow-sm">
          <span className={`material-icons-round text-[#2D9B63] ${iconSize === "text-lg" ? "text-[10px]" : "text-sm"}`}>location_on</span>
       </div>
       <span className={`material-icons-round text-white drop-shadow-md ${iconSize}`}>campaign</span>
    </div>
  </div>
);

const App: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  // Database Hydration
  const [reports, setReports] = useState<Report[]>(() => {
    mockDb.init();
    return mockDb.getReports();
  });
  
  const [user, setUser] = useState<User | null>(() => mockDb.getUser());
  const [view, setView] = useState<ViewState>(() => (mockDb.getUser() ? 'MAP' : 'LANDING'));
  
  const [newReportLocation, setNewReportLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  
  // Landing States
  const [loginRole, setLoginRole] = useState<UserRole>(UserRole.CITIZEN);
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Derived selected report
  const activeReport = useMemo(() => 
    reports.find(r => r.id === selectedReportId) || null, 
  [reports, selectedReportId]);

  // Sync state to Mock DB
  useEffect(() => {
    mockDb.saveReports(reports);
  }, [reports]);

  useEffect(() => {
    mockDb.saveUser(user);
  }, [user]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const addToast = (type: ToastNotification['type'], message: string) => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, type, message }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const addNotification = (title: string, message: string, type: AppNotification['type'] = 'info', reportId?: string) => {
    const newNotif: AppNotification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: Date.now(),
      isRead: false,
      linkToReportId: reportId
    };
    setNotifications(prev => [newNotif, ...prev]);
    addToast(type === 'alert' ? 'error' : type === 'success' ? 'success' : 'info', title);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = username.trim();
    const registeredUsers = mockDb.getRegisteredUsers();

    if (loginRole === UserRole.ADMIN) {
        if (cleanName === 'admin' && password === 'admin') {
            const adminUser = registeredUsers.find(u => u.name === 'admin' && u.role === UserRole.ADMIN) || { 
              id: 'admin-1', 
              role: UserRole.ADMIN, 
              name: 'Mayor Admin', 
              avatar: 'https://i.pravatar.cc/150?u=admin',
              points: 9999,
              badges: ['Top Official'],
              followedReportIds: []
            };
            setUser(adminUser);
            setView('DASHBOARD');
            addToast('success', t('welcomeMayor'));
        } else {
            addToast('error', t('invalidAdminCredentials'));
        }
    } else {
        if (!cleanName) {
            addToast('error', t('pleaseEnterName'));
            return;
        }

        const existingUser = registeredUsers.find(u => u.name.toLowerCase() === cleanName.toLowerCase() && u.role === UserRole.CITIZEN);

        if (isSignUp) {
            if (existingUser) {
                addToast('error', t('usernameTaken'));
                setIsSignUp(false);
            } else {
                const newUser: User = { 
                  id: `u-${Date.now()}`, 
                  role: UserRole.CITIZEN, 
                  name: cleanName,
                  avatar: `https://i.pravatar.cc/150?u=${cleanName}`,
                  points: 0,
                  badges: ['New Resident'],
                  followedReportIds: []
                };
                mockDb.registerUser(newUser);
                setUser(newUser);
                setView('MAP');
                addToast('achievement', t('welcomeNewUser', { name: cleanName }));
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);
            }
        } else {
            // LOGIN PATH
            if (existingUser) {
                setUser(existingUser);
                setView('MAP');
                addToast('success', t('welcomeBackUser', { name: existingUser.name }));
            } else {
                addToast('error', t('noAccountFound', { name: cleanName }));
            }
        }
    }
  };

  const handleGuestLogin = () => {
    const guestUser: User = {
      id: `guest-${Date.now()}`,
      role: UserRole.GUEST,
      name: 'City Explorer',
      avatar: 'https://i.pravatar.cc/150?u=guest',
      points: 0,
      badges: ['Guest Access'],
      followedReportIds: []
    };
    setUser(guestUser);
    setView('MAP');
    addToast('info', t('enteringAsGuest'));
  };

  const handleLogout = (forceToSignUp: boolean = false) => {
    setUser(null);
    setView('LANDING');
    setUsername('');
    setPassword('');
    if (forceToSignUp) {
        setIsSignUp(true);
        setLoginRole(UserRole.CITIZEN);
    }
    mockDb.saveUser(null);
  };

  const handleToggleFollow = (reportId: string) => {
    if (!user) return;
    const isFollowing = user.followedReportIds.includes(reportId);
    
    const newFollowed = isFollowing 
      ? user.followedReportIds.filter(id => id !== reportId)
      : [...user.followedReportIds, reportId];
    
    setUser({ ...user, followedReportIds: newFollowed });

    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        const newFollowers = isFollowing 
          ? r.followerIds.filter(id => id !== user.id)
          : [...r.followerIds, user.id];
        return { ...r, followerIds: newFollowers };
      }
      return r;
    }));

    addToast('info', isFollowing ? t('unfollowedReport') : t('nowFollowing'));
  };

  const handleSubmitReport = (data: any) => {
    if (!user) return;
    const newReport: Report = {
      id: `r${Date.now()}`,
      userId: user.id,
      userName: user.name,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: ReportStatus.OPEN,
      location: data.location,
      timestamp: Date.now(),
      imageUrl: data.imageUrl,
      aiAnalysis: data.summary,
      votes: 0,
      comments: [],
      followerIds: [user.id]
    };

    setReports(prev => [newReport, ...prev]);
    setIsModalOpen(false);
    setNewReportLocation(null);
    
    const newPoints = user.points + 50;
    setUser(prev => prev ? { 
      ...prev, 
      points: newPoints,
      followedReportIds: [...prev.followedReportIds, newReport.id]
    } : null);

    addToast('achievement', t('reportFiled'));
    addNotification(t('reportRecorded'), t('reportActive', { title: newReport.title }), 'success', newReport.id);
    
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleUpdateStatus = (id: string, status: ReportStatus) => {
    const report = reports.find(r => r.id === id);
    if (!report) return;

    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    
    if (user && user.followedReportIds.includes(id)) {
        addNotification(t('statusUpdated'), t('reportStatus', { title: report.title, status }), 'success', id);
    } else {
        addToast('success', t('status', { status }));
    }
  };

  const handleVote = (id: string) => {
      const report = reports.find(r => r.id === id);
      setReports(prev => prev.map(r => r.id === id ? { ...r, votes: r.votes + 1 } : r));
      addToast('success', t('upvoted'));

      if (report && report.userId !== user?.id) {
          addNotification(t('communitySupport'), t('someoneUpvoted', { title: report.title }), 'info', id);
      }
  };

  const handleComment = (id: string, text: string) => {
      if (!user) return;
      const report = reports.find(r => r.id === id);
      if (!report) return;

      const newComment: Comment = {
          id: `c${Date.now()}`,
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          text: text,
          timestamp: Date.now()
      };

      setReports(prev => prev.map(r => r.id === id ? { ...r, comments: [...r.comments, newComment] } : r));
      setUser(prev => prev ? { ...prev, points: prev.points + 5 } : null);
      addToast('achievement', t('commentPosted'));

      if (user.followedReportIds.includes(id)) {
          addNotification(t('newActivity'), t('userCommented', { name: user.name, title: report.title }), 'info', id);
      }
  };

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const currentFrameClass = AVATAR_FRAMES.find(f => f.id === user?.avatarFrame)?.class || 'border-white dark:border-slate-800';

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f0f9ff] dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-[#2D9B63]/10 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-[#A9C942]/10 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>

        <div className="w-full max-w-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white dark:border-slate-800 z-10 animate-fade-in-up">
            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <Logo className="w-24 h-24" iconSize="text-5xl" />
                </div>
                <h1 className="text-4xl font-display font-bold text-gray-800 dark:text-white tracking-tight">{t('appTitle')}</h1>
                <p className="text-gray-500 dark:text-slate-400 font-medium mt-2">{t('appSubtitle')}</p>
            </div>

            <div className="flex bg-white/50 dark:bg-slate-800/50 p-1.5 rounded-2xl mb-6 shadow-inner">
                <button onClick={() => setLoginRole(UserRole.CITIZEN)} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${loginRole === UserRole.CITIZEN ? 'bg-white dark:bg-slate-700 shadow-md text-[#2D9B63]' : 'text-gray-400'}`}>{t('citizen')}</button>
                <button onClick={() => setLoginRole(UserRole.ADMIN)} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${loginRole === UserRole.ADMIN ? 'bg-white dark:bg-slate-700 shadow-md text-[#2D9B63]' : 'text-gray-400'}`}>{t('admin')}</button>
            </div>

            <div className="text-center mb-6">
                <h2 className="text-xl font-display font-bold text-gray-800 dark:text-white">
                  {loginRole === UserRole.ADMIN ? t('mayorDashboardAccess') : (isSignUp ? t('joinCommunity') : t('welcomeBack'))}
                </h2>
                {loginRole === UserRole.CITIZEN && (
                  <p className="text-xs text-gray-400 mt-1">
                    {isSignUp ? t('createCivicProfile') : t('seeImpact')}
                  </p>
                )}
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="relative">
                  <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">person</span>
                  <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={loginRole === UserRole.CITIZEN ? (isSignUp ? t('fullNameForRegistry') : t('registeredName')) : "admin"}
                      className="w-full bg-white/50 dark:bg-slate-800/50 border border-white dark:border-slate-700 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-[#2D9B63] dark:text-white text-sm"
                      required
                  />
                </div>
                
                <div className="relative">
                  <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">lock</span>
                  <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('password')}
                      className="w-full bg-white/50 dark:bg-slate-800/50 border border-white dark:border-slate-700 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-[#2D9B63] dark:text-white text-sm"
                      required
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <button type="submit" className="w-full bg-gradient-to-r from-[#2D9B63] to-[#A9C942] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center space-x-2">
                      <span>
                          {loginRole === UserRole.ADMIN ? t('mayorControl') : (isSignUp ? t('createCivicProfile') : t('signIn'))}
                      </span>
                      <span className="material-icons-round">{isSignUp ? 'how_to_reg' : 'login'}</span>
                  </button>
                  
                  {loginRole === UserRole.CITIZEN && (
                    <div className="flex flex-col gap-3">
                        <button 
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-xs font-bold text-gray-400 hover:text-[#2D9B63] transition-colors"
                        >
                            {isSignUp ? t('alreadyCitizen') : t('noAccount')}
                        </button>
                        
                        <div className="h-px bg-gray-100 dark:bg-slate-800 w-full my-1"></div>

                        <button 
                            type="button"
                            onClick={handleGuestLogin}
                            className="w-full py-4 rounded-2xl font-bold text-sm text-gray-500 dark:text-slate-400 border-2 border-dashed border-gray-200 dark:border-slate-800 hover:border-brand-teal hover:text-brand-teal transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-icons-round text-lg">visibility</span>
                            {t('continueAsGuest')}
                        </button>
                    </div>
                  )}
                </div>
            </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-brand-bg dark:bg-brand-darkBg transition-colors overflow-hidden font-sans relative">
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      {showConfetti && <Confetti />}
      <CivicAssistant />
      
      {showNotifications && (
        <NotificationPanel 
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkRead={handleMarkRead}
          onClearAll={handleClearAll}
          onNotificationClick={(rid) => {
            setSelectedReportId(rid);
            setShowNotifications(false);
          }}
        />
      )}
      
      {/* Top Bar */}
      <div className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-6 z-20 shrink-0">
        <button className="flex items-center space-x-3 group" onClick={() => setView('MAP')}>
           <Logo className="w-10 h-10 group-hover:rotate-12 transition-transform" />
           <span className="font-display font-bold text-2xl text-gray-800 dark:text-white tracking-tight hidden sm:block">{t('appTitle')}</span>
        </button>
        <div className="flex items-center space-x-4">
          <button onClick={() => setLanguage(language === 'en' ? 'sq' : 'en')} className="p-2.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-800 transition text-gray-500">
              <span className="material-icons-round">{language === 'en' ? 'language' : 'translate'}</span>
          </button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-800 transition text-gray-500"><span className="material-icons-round">{isDarkMode ? 'wb_sunny' : 'nights_stay'}</span></button>
          <button onClick={() => setShowNotifications(true)} className="p-2.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-800 transition relative text-gray-400">
              <span className="material-icons-round">notifications</span>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute top-2 right-2 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white dark:border-slate-900"></span>
                </span>
              )}
          </button>
          <button onClick={() => setView('PROFILE')} className="relative group flex items-center gap-3 bg-gray-50 dark:bg-slate-800 p-1 pr-4 rounded-full border border-gray-100 dark:border-slate-700">
            <img src={user?.avatar || ''} className={`w-10 h-10 rounded-full border-2 overflow-hidden ${currentFrameClass}`} alt="profile" />
            <span className="text-xs font-bold text-gray-800 dark:text-white hidden md:block">{user?.role === UserRole.GUEST ? t('guest') : (user?.name || '').split(' ')[0]}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 relative overflow-hidden">
        {view === 'MAP' && (
          <>
            <MapDisplay 
              reports={reports} 
              interactive={user?.role !== UserRole.ADMIN}
              onMapClick={(lat, lng) => { setNewReportLocation({ lat, lng }); setSelectedReportId(null); }}
              onReportClick={(r) => setSelectedReportId(r.id)}
              newReportLocation={newReportLocation}
              isDarkMode={isDarkMode}
            />
            {user?.role !== UserRole.ADMIN && (
              <div className="absolute bottom-10 left-0 right-0 flex justify-center z-[400] pointer-events-none px-4">
                {newReportLocation ? (
                   <button 
                     onClick={() => setIsModalOpen(true)} 
                     className="pointer-events-auto bg-gradient-to-r from-[#2D9B63] to-[#A9C942] text-white px-7 py-3.5 rounded-2xl font-display font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 border border-white/20 ring-1 ring-black/5"
                   >
                     <span className="material-icons-round text-xl">add_a_photo</span>
                     <span className="text-base tracking-wide">{t('voiceIssueHere')}</span>
                   </button>
                ) : (
                  <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-gray-600 dark:text-slate-400 px-8 py-4 rounded-[2rem] shadow-2xl text-sm font-bold border border-white/50 dark:border-slate-800">
                    {t('touchMap')}
                  </div>
                )}
              </div>
            )}
          </>
        )}
        {view === 'DASHBOARD' && user && <div className="h-full overflow-y-auto p-6"><AdminDashboard reports={reports} onUpdateStatus={handleUpdateStatus} isDarkMode={isDarkMode} /></div>}
        {view === 'PROFILE' && user && <div className="h-full overflow-y-auto"><Profile user={user} reports={reports} onLogout={handleLogout} onUpdateUser={(u) => setUser(p => p ? {...p, ...u} : null)} isDarkMode={isDarkMode} onResetDb={() => mockDb.reset()} /></div>}
        {view === 'GALLERY' && <Gallery reports={reports} onReportClick={(r) => setSelectedReportId(r.id)} isDarkMode={isDarkMode} />}
        {view === 'LEADERBOARD' && <Leaderboard reports={reports} />}
      </main>

      {/* Nav */}
      <footer className="h-24 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex items-center justify-around z-[500] shrink-0 pb-6 shadow-[0_-5px_30px_rgba(0,0,0,0.05)]">
        {[
          { id: 'MAP', icon: 'map', label: t('explore') },
          { id: 'LEADERBOARD', icon: 'emoji_events', label: t('heroes') },
          { id: 'GALLERY', icon: 'auto_awesome_motion', label: t('gallery') },
          ...(user?.role === UserRole.ADMIN ? [{ id: 'DASHBOARD', icon: 'admin_panel_settings', label: t('adminPanel') }] : []),
          { id: 'PROFILE', icon: 'person', label: t('me') }
        ].map((item) => (
          <button key={item.id} onClick={() => setView(item.id as ViewState)} className={`flex flex-col items-center justify-center w-20 h-16 rounded-3xl transition duration-300 active:scale-90 ${view === item.id ? 'text-[#2D9B63] bg-green-50 dark:bg-green-900/20' : 'text-gray-400'}`}>
            <span className="material-icons-round text-2xl mb-1">{item.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </footer>

      {isModalOpen && newReportLocation && <NewReportModal location={newReportLocation} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmitReport} />}
      {activeReport && user && (
        <ReportDetailsModal 
          report={activeReport} 
          userRole={user.role} 
          onClose={() => setSelectedReportId(null)} 
          onVote={handleVote} 
          onComment={handleComment} 
          onToggleFollow={handleToggleFollow}
          isFollowing={user.followedReportIds.includes(activeReport.id)}
          isDarkMode={isDarkMode} 
        />
      )}
    </div>
  );
};

export default App;
