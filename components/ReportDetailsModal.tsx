
import React, { useState, useEffect, useRef } from 'react';
import { Report, ReportStatus, Comment } from '../types';
import { useTranslation } from '../TranslationContext';

interface ReportDetailsModalProps {
  report: Report;
  onClose: () => void;
  onVote: (id: string) => void;
  onComment: (id: string, text: string) => void;
  onToggleFollow: (id: string) => void;
  isFollowing: boolean;
  userRole: string;
  isDarkMode?: boolean;
}

const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({ 
  report, 
  onClose, 
  onVote, 
  onComment, 
  onToggleFollow,
  isFollowing,
  userRole, 
  isDarkMode 
}) => {
  const [commentText, setCommentText] = useState('');
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [report.comments]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(report.id, commentText);
      setCommentText('');
    }
  };

  const toggleCommentLike = (commentId: string) => {
    setLikedComments(prev => {
        const next = new Set(prev);
        if (next.has(commentId)) next.delete(commentId);
        else next.add(commentId);
        return next;
    });
  };

  const handleReply = (userName: string) => {
    setCommentText(`@${userName} `);
  };

  const statusSteps = [
    { label: 'Reported', status: ReportStatus.OPEN, icon: 'edit_location' },
    { label: 'Analyzing', status: ReportStatus.OPEN, icon: 'auto_awesome' },
    { label: 'Under Review', status: ReportStatus.IN_PROGRESS, icon: 'visibility' },
    { label: 'Solved', status: ReportStatus.SOLVED, icon: 'check_circle' },
  ];

  const currentStepIndex = report.status === ReportStatus.SOLVED ? 3 : 
                           report.status === ReportStatus.IN_PROGRESS ? 2 : 1;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in transition-colors">
      {/* Expanded Image Overlay */}
      {isImageExpanded && report.imageUrl && (
        <div 
            className="fixed inset-0 z-[1200] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
            onClick={() => setIsImageExpanded(false)}
        >
            <img src={report.imageUrl} alt="Full view" className="max-w-full max-h-full rounded-3xl shadow-2xl border border-white/10" />
            <button className="absolute top-6 right-6 text-white bg-white/20 hover:bg-white/40 rounded-full p-2 transition">
                <span className="material-icons-round text-3xl">close</span>
            </button>
        </div>
      )}

      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white dark:border-slate-800 flex flex-col max-h-[90vh] transition-colors ring-1 ring-black/10">
        
        {/* Header Image or Gradient */}
        <div className="h-56 bg-gray-100 dark:bg-slate-800 relative shrink-0 group overflow-hidden">
          {report.imageUrl ? (
            <>
                <img 
                    src={report.imageUrl} 
                    alt="Report" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 cursor-zoom-in" 
                    onClick={() => setIsImageExpanded(true)}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none backdrop-blur-[2px]">
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white font-bold flex items-center gap-2">
                        <span className="material-icons-round">zoom_in</span>
                        Enlarge Moment
                    </div>
                </div>
            </>
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-tr 
              ${report.category === 'Infrastructure' ? 'from-slate-400 to-slate-500' : 
                report.category === 'Cleanliness' ? 'from-teal-300 to-teal-500' : 
                'from-rose-300 to-rose-500'}`}
            >
              <span className="material-icons-round text-7xl text-white opacity-40">
                {report.category === 'Infrastructure' ? 'build' : 
                 report.category === 'Cleanliness' ? 'cleaning_services' : 'campaign'}
              </span>
            </div>
          )}
          
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition backdrop-blur-xl z-20 border border-white/20"
          >
            <span className="material-icons-round">close</span>
          </button>

          <div className="absolute bottom-5 left-5 z-20 flex gap-2">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border backdrop-blur-md
                  ${report.priority === 'High' ? 'bg-red-500/90 text-white border-red-400/50' : 
                    report.priority === 'Medium' ? 'bg-amber-400/90 text-amber-900 border-amber-300/50' : 
                    'bg-green-500/90 text-white border-green-400/50'}
              `}>
                {report.priority} Priority
              </span>
              <button 
                onClick={() => onToggleFollow(report.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border backdrop-blur-md transition flex items-center gap-1
                  ${isFollowing 
                    ? 'bg-brand-teal text-white border-teal-400/50' 
                    : 'bg-white/20 text-white border-white/20 hover:bg-white/40'}
                `}
              >
                <span className="material-icons-round text-sm">{isFollowing ? 'notifications_active' : 'notifications_none'}</span>
                {isFollowing ? 'Following' : 'Follow'}
              </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-7 pb-2">
            <div className="mb-6">
                <div className="flex justify-between items-start mb-1">
                    <h2 className="text-3xl font-display font-bold text-gray-800 dark:text-white leading-tight">{report.title}</h2>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                      <img src={`https://i.pravatar.cc/150?u=${report.userId}`} className="w-4 h-4 rounded-full border border-white" alt="" />
                      <span className="text-gray-600 dark:text-slate-300">{report.userName}</span>
                    </div>
                    <span>•</span>
                    <span>{new Date(report.timestamp).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5"><span className="material-icons-round text-[12px]">group</span> {report.followerIds?.length || 0}</span>
                </div>
            </div>

            {/* Timeline Feature */}
            <div className="mb-10 px-2">
                <div className="flex justify-between relative">
                    <div className="absolute top-4 left-0 right-0 h-1.5 bg-gray-100 dark:bg-slate-800 -z-10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-teal transition-all duration-1000" 
                          style={{ width: `${(currentStepIndex / 3) * 100}%` }}
                        ></div>
                    </div>
                    {statusSteps.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 group">
                            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-500 border-4
                                ${idx <= currentStepIndex 
                                    ? 'bg-brand-teal text-white border-white dark:border-slate-900 shadow-md' 
                                    : 'bg-gray-100 dark:bg-slate-800 text-gray-300 border-white dark:border-slate-900'}
                            `}>
                                <span className="material-icons-round text-sm">{step.icon}</span>
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors
                                ${idx <= currentStepIndex ? 'text-brand-teal' : 'text-gray-400 dark:text-slate-600'}
                            `}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50/50 dark:bg-slate-800/30 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800/50 shadow-inner">
                <p className="text-gray-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-line">{report.description}</p>
              </div>

              {report.aiAnalysis && (
                <div className="bg-gradient-to-br from-brand-teal/10 to-blue-50/5 dark:from-brand-teal/5 dark:to-slate-900 p-6 rounded-[2rem] border border-brand-teal/20 dark:border-brand-teal/10 flex gap-4 animate-fade-in-up">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                    <span className="material-icons-round text-brand-teal">auto_awesome</span>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-brand-teal uppercase tracking-[0.2em] mb-1">Buddy AI Analysis</h4>
                    <p className="text-sm text-gray-800 dark:text-slate-200 font-medium leading-relaxed italic">"{report.aiAnalysis}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="px-7 py-8 bg-gray-50/30 dark:bg-slate-950/20 mt-6 transition-colors">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-xl text-gray-800 dark:text-white flex items-center gap-2">
                    <span className="material-icons-round text-brand-teal">forum</span>
                    Community Conversation
                </h3>
                <span className="px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest shadow-sm border border-gray-100 dark:border-slate-800">{report.comments?.length || 0} Comments</span>
            </div>
            
            <div className="space-y-6 mb-8">
              {report.comments && report.comments.length > 0 ? (
                report.comments.map((comment, idx) => (
                  <div key={comment.id} className="flex gap-4 items-start comment-entrance group" style={{ animationDelay: `${idx * 0.08}s` }}>
                    <div className="relative shrink-0">
                      <img src={comment.userAvatar} alt="avatar" className="w-11 h-11 rounded-2xl border-2 border-white dark:border-slate-800 shadow-sm object-cover transition-transform group-hover:scale-110" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-brand-teal rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
                        <span className="material-icons-round text-[8px] text-white">person</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                       <div className="flex justify-between items-center px-1">
                          <span className="font-bold text-gray-900 dark:text-white text-xs">{comment.userName}</span>
                          <span className="text-[9px] text-gray-400 dark:text-slate-600 font-bold uppercase">
                            {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                       </div>
                       <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none px-5 py-4 border border-gray-100 dark:border-slate-700/50 shadow-sm relative group/bubble hover:shadow-md transition-shadow">
                          <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed pr-8">
                            {comment.text.startsWith('@') ? (
                              <>
                                <span className="text-brand-teal font-bold mr-1">{comment.text.split(' ')[0]}</span>
                                {comment.text.split(' ').slice(1).join(' ')}
                              </>
                            ) : comment.text}
                          </p>
                          <div className="absolute right-3 bottom-3 flex items-center gap-3 opacity-0 group-hover/bubble:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleReply(comment.userName)}
                              className="text-gray-300 hover:text-brand-teal transition-colors"
                              title={t('reply')}
                            >
                               <span className="material-icons-round text-sm">reply</span>
                            </button>
                            <button 
                              onClick={() => toggleCommentLike(comment.id)}
                              className={`flex items-center gap-1 transition-all transform active:scale-150
                                  ${likedComments.has(comment.id) ? 'text-rose-500 scale-110' : 'text-gray-300 dark:text-slate-600 hover:text-rose-400'}
                              `}
                            >
                               <span className="material-icons-round text-sm">{likedComments.has(comment.id) ? 'favorite' : 'favorite_border'}</span>
                               <span className="text-[9px] font-bold">{likedComments.has(comment.id) ? (comment.likes || 0) + 1 : comment.likes || 0}</span>
                            </button>
                          </div>
                       </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white/50 dark:bg-slate-800/30 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-slate-700 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center mb-3">
                      <span className="material-icons-round text-3xl text-gray-300 dark:text-slate-600">textsms</span>
                    </div>
                    <p className="text-sm font-bold text-gray-500 dark:text-slate-400 italic">No whispers yet...</p>
                    <p className="text-xs text-gray-300 dark:text-slate-600 mt-1 max-w-[200px]">Be the first to share an update or support this report.</p>
                </div>
              )}
              <div ref={commentsEndRef} />
            </div>
            
            <form onSubmit={handleCommentSubmit} className="sticky bottom-0 pb-2">
              <div className="relative group shadow-2xl shadow-black/5">
                <input 
                  type="text" 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share a thought or tag someone..." 
                  className="w-full bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 rounded-3xl pl-6 pr-16 py-5 text-sm focus:outline-none focus:border-brand-teal dark:focus:border-brand-teal dark:text-white transition-all shadow-sm group-hover:shadow-md"
                />
                <button 
                  type="submit" 
                  disabled={!commentText.trim()}
                  className="absolute right-3 top-3 bottom-3 bg-brand-teal text-white rounded-2xl px-4 flex items-center justify-center disabled:opacity-30 disabled:grayscale transition-all active:scale-90 hover:bg-teal-500 shadow-lg shadow-teal-500/20"
                >
                  <span className="material-icons-round">send</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center shrink-0 transition-colors z-20">
          <button 
            onClick={() => onVote(report.id)}
            className="group flex items-center gap-4 bg-gray-50 dark:bg-slate-800 px-6 py-4 rounded-3xl shadow-sm hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all active:scale-95 border border-transparent hover:border-rose-100 dark:hover:border-rose-900/50"
          >
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <span className="material-icons-round text-rose-400 animate-pulse-slow">favorite</span>
            </div>
            <div className="text-left">
                <div className="text-xl font-display font-bold text-gray-800 dark:text-white leading-none">{report.votes}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Supporters</div>
            </div>
          </button>
          
          <button 
            onClick={onClose} 
            className="text-gray-400 dark:text-slate-500 font-bold text-sm hover:text-gray-800 dark:hover:text-white px-8 py-4 transition rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95"
          >
            Back to City
          </button>
        </div>

      </div>
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ReportDetailsModal;
