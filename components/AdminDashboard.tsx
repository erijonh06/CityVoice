
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { jsPDF } from "jspdf";
import { Report, ReportStatus, ReportCategory } from '../types';
import { generateAdminSummary } from '../services/geminiService';
import { useTranslation } from '../TranslationContext';

interface AdminDashboardProps {
  reports: Report[];
  onUpdateStatus: (id: string, status: ReportStatus) => void;
  isDarkMode?: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ reports, onUpdateStatus, isDarkMode }) => {
  const [weeklySummary, setWeeklySummary] = useState<string>("");
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'SOLVED'>('ALL');
  const { t } = useTranslation();

  const openReports = reports.filter(r => r.status !== ReportStatus.SOLVED).length;
  const solvedReports = reports.filter(r => r.status === ReportStatus.SOLVED).length;
  
  const filteredReports = reports.filter(r => {
      if (filter === 'OPEN') return r.status !== ReportStatus.SOLVED;
      if (filter === 'SOLVED') return r.status === ReportStatus.SOLVED;
      return true;
  });

  const chartData = useMemo(() => {
    return Object.values(ReportCategory).map(cat => ({
      name: cat,
      count: reports.filter(r => r.category === cat).length
    }));
  }, [reports]);

  const COLORS = ['#4fd1c5', '#fda4af', '#fef08a', '#e9d5ff', '#94a3b8'];

  const handleGenerateSummary = async () => {
    setWeeklySummary(t('generatingBrief'));
    const summary = await generateAdminSummary(reports);
    setWeeklySummary(summary);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - (margin * 2);

    // Helper: Header
    const drawHeader = () => {
      doc.setFillColor(45, 155, 99); // Brand Green
      doc.rect(0, 0, pageWidth, 45, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.text(t('appTitle'), margin, 25);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(t('operationalIntelligenceReport'), margin, 33);
      doc.setFontSize(9);
      doc.text(t('generatedOn', { date: today }), pageWidth - margin, 25, { align: 'right' });
    };

    // Helper: Footer
    const drawFooter = (pageNum: number) => {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(t('confidentialFooter'), margin, 285);
      doc.text(t('page', { num: pageNum }), pageWidth - margin, 285, { align: 'right' });
    };

    drawHeader();
    let yPos = 60;

    // --- SECTION: KPI DASHBOARD ---
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(t('executiveSummaryKPIs'), margin, yPos);
    yPos += 8;

    const cardWidth = contentWidth / 3 - 5;
    const cards = [
      { label: t('active'), value: openReports.toString(), color: [225, 29, 72] },
      { label: t('resolved'), value: solvedReports.toString(), color: [45, 155, 99] },
      { label: t('resolution'), value: `${Math.round((solvedReports / Math.max(1, reports.length)) * 100)}%`, color: [59, 130, 246] }
    ];

    cards.forEach((card, i) => {
      const x = margin + (i * (cardWidth + 7.5));
      doc.setDrawColor(240, 240, 240);
      doc.setFillColor(252, 252, 252);
      doc.roundedRect(x, yPos, cardWidth, 25, 3, 3, 'FD');
      
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text(card.label, x + cardWidth / 2, yPos + 8, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(card.color[0], card.color[1], card.color[2]);
      doc.text(card.value, x + cardWidth / 2, yPos + 18, { align: 'center' });
    });
    yPos += 40;

    // --- SECTION: AI STRATEGIC INSIGHT (DYNAMIC HEIGHT) ---
    if (weeklySummary && weeklySummary !== "Generating brief...") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(40, 40, 40);
      doc.text(t('strategicInsightBriefing'), margin, yPos);
      yPos += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const splitBrief = doc.splitTextToSize(`"${weeklySummary}"`, contentWidth - 20);
      const lineHeight = 6;
      const boxHeight = (splitBrief.length * lineHeight) + 15;

      // Draw Container
      doc.setFillColor(245, 250, 248);
      doc.setDrawColor(45, 155, 99);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, yPos, contentWidth, boxHeight, 4, 4, 'F');
      doc.line(margin, yPos, margin, yPos + boxHeight); // Green accent bar

      doc.setTextColor(45, 155, 99);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("AI-GENERATED MAYORAL SUMMARY", margin + 6, yPos + 7);

      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.text(splitBrief, margin + 6, yPos + 16);
      
      yPos += boxHeight + 15;
    }

    // --- SECTION: ISSUE LEDGER ---
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(t('operationalIssueLedger'), margin, yPos);
    yPos += 8;

    // Table Header
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, yPos, contentWidth, 10, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(t('priority'), margin + 5, yPos + 6.5);
    doc.text(t('descriptionTitle'), margin + 35, yPos + 6.5);
    doc.text(t('category'), margin + 115, yPos + 6.5);
    doc.text(t('status'), margin + 155, yPos + 6.5);
    yPos += 10;

    // Table Rows
    filteredReports.forEach((report, index) => {
      // Check for page overflow
      if (yPos > 265) {
        drawFooter(doc.internal.pages.length - 1);
        doc.addPage();
        drawHeader();
        yPos = 60;
        
        // Re-draw table header for new page
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPos, contentWidth, 10, 'F');
        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "bold");
        doc.text(t('priority'), margin + 5, yPos + 6.5);
        doc.text(t('descriptionTitle'), margin + 35, yPos + 6.5);
        doc.text(t('category'), margin + 115, yPos + 6.5);
        doc.text(t('status'), margin + 155, yPos + 6.5);
        yPos += 10;
      }

      // Zebra Stripe
      if (index % 2 === 0) {
        doc.setFillColor(252, 253, 254);
        doc.rect(margin, yPos, contentWidth, 12, 'F');
      }

      // Priority Icon/Indicator
      const isHigh = report.priority === 'High';
      doc.setFont("helvetica", isHigh ? "bold" : "normal");
      doc.setTextColor(isHigh ? 225 : 100, isHigh ? 29 : 116, isHigh ? 72 : 139);
      doc.text(report.priority.toUpperCase(), margin + 5, yPos + 7.5);

      // Other Fields
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      doc.text(report.title.substring(0, 45), margin + 35, yPos + 7.5);
      doc.setFontSize(7);
      doc.text(report.category, margin + 115, yPos + 7.5);
      doc.setFontSize(8);
      
      const isSolved = report.status === ReportStatus.SOLVED;
      doc.setTextColor(isSolved ? 45 : 100, isSolved ? 155 : 116, isSolved ? 99 : 139);
      doc.text(report.status, margin + 155, yPos + 7.5);
      
      yPos += 12;
    });

    drawFooter(doc.internal.pages.length - 1);
    doc.save(`CityVoice_Ops_Report_${today.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-gray-800 dark:text-white">City Operations</h2>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Feed • {reports.length} Signals</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleDownloadPDF} 
            className="bg-rose-500/10 text-rose-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 border border-rose-500/20 hover:bg-rose-500/20 transition-all active:scale-95"
          >
            <span className="material-icons-round text-lg">picture_as_pdf</span> {t('pdfReport')}
          </button>
          <button 
            onClick={handleGenerateSummary} 
            className="bg-[#2D9B63]/10 text-[#2D9B63] px-6 py-3 rounded-2xl font-bold flex items-center gap-2 border border-[#2D9B63]/20 hover:bg-[#2D9B63]/20 transition-all active:scale-95"
          >
            <span className="material-icons-round text-lg">auto_awesome</span> {t('runAiAnalysis')}
          </button>
        </div>
      </header>

      <div className="flex bg-white/50 dark:bg-slate-800/50 p-1.5 rounded-2xl shadow-inner max-w-sm">
          <button onClick={() => setFilter('ALL')} className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === 'ALL' ? 'bg-white dark:bg-slate-700 shadow-md text-brand-teal' : 'text-gray-400'}`}>{t('all')}</button>
          <button onClick={() => setFilter('OPEN')} className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === 'OPEN' ? 'bg-white dark:bg-slate-700 shadow-md text-rose-500' : 'text-gray-400'}`}>{t('active')}</button>
          <button onClick={() => setFilter('SOLVED')} className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === 'SOLVED' ? 'bg-white dark:bg-slate-700 shadow-md text-brand-teal' : 'text-gray-400'}`}>{t('solved')}</button>
      </div>

      {weeklySummary && (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur p-6 rounded-[2rem] border-l-4 border-l-[#2D9B63] shadow-sm animate-fade-in-up">
          <h4 className="font-bold text-[#2D9B63] mb-2 flex items-center gap-2 uppercase text-xs tracking-widest">
             <span className="material-icons-round">summarize</span> {t('aiStrategicBriefing')}
          </h4>
          <p className="text-gray-700 dark:text-slate-300 text-sm italic leading-relaxed">"{weeklySummary}"</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-lg border border-gray-100 dark:border-slate-800 flex flex-col items-center">
          <span className="text-4xl font-display font-bold text-rose-500">{openReports}</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">{t('activeAlerts')}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-lg border border-gray-100 dark:border-slate-800 flex flex-col items-center">
          <span className="text-4xl font-display font-bold text-brand-teal">{solvedReports}</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">{t('fixedSpots')}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-lg border border-gray-100 dark:border-slate-800 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '20px', 
                border: 'none', 
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                color: isDarkMode ? '#fff' : '#000'
              }} 
            />
            <Bar dataKey="count" radius={[10, 10, 10, 10]} barSize={35}>
              {chartData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-display font-bold text-gray-800 dark:text-white px-2">{t('recentReports')}</h3>
        {filteredReports.length === 0 ? (
          <div className="py-20 text-center opacity-50">
            <span className="material-icons-round text-5xl mb-2">inventory_2</span>
            <p className="text-sm font-bold uppercase tracking-widest">{t('noReportsInCategory')}</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <div key={report.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-gray-50 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 group hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 w-full">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold transition-transform group-hover:scale-110 shadow-sm ${report.priority === 'High' ? 'bg-rose-500' : 'bg-brand-teal'}`}>
                  {report.priority[0]}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 dark:text-white">{report.title}</h4>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{report.category} • {new Date(report.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {report.status !== ReportStatus.SOLVED ? (
                  <button onClick={() => onUpdateStatus(report.id, ReportStatus.SOLVED)} className="flex-1 sm:flex-none bg-[#2D9B63] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-green-600 transition-all active:scale-95">{t('resolve')}</button>
                ) : (
                  <div className="flex-1 sm:flex-none px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl text-xs font-bold border border-green-100 dark:border-green-900/30 flex items-center gap-2">
                    <span className="material-icons-round text-sm">check_circle</span> {t('solvedStatus')}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
