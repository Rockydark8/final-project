const { useState, useEffect, useMemo } = React;
    
    // Custom SVG Area Chart Component
    const MetricsAreaChart = ({ data }) => {
      const maxBugs = Math.max(...data.map(d => Math.max(d.bugs, d.resolved))) + 5;
      const pointsBugs = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d.bugs / maxBugs) * 80}`).join(' ');
      const pointsResolved = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d.resolved / maxBugs) * 80}`).join(' ');

      return (
        <div className="h-full w-full flex flex-col justify-between pt-2">
          <div className="relative flex-1 w-full border-b border-l border-gray-800">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Bugs Area Fill */}
              <polygon points={`0,100 ${pointsBugs} 100,100`} fill="rgba(139, 92, 246, 0.15)" />
              <polyline points={pointsBugs} fill="none" stroke="#8B5CF6" strokeWidth="2" vectorEffect="non-scaling-stroke" />

              {/* Resolved Area Fill */}
              <polygon points={`0,100 ${pointsResolved} 100,100`} fill="rgba(16, 185, 129, 0.15)" />
              <polyline points={pointsResolved} fill="none" stroke="#10B981" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <div className="flex justify-between text-xs text-gray-500 pt-2 px-1">
            {data.map(d => <span key={d.time}>{d.time}</span>)}
          </div>
          <div className="flex items-center justify-center space-x-6 pt-3 text-xs">
            <span className="flex items-center space-x-1.5"><span className="w-3 h-3 rounded-sm bg-accentPurple inline-block"></span><span className="text-gray-300">New Bugs</span></span>
            <span className="flex items-center space-x-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span><span className="text-gray-300">Resolved</span></span>
          </div>
        </div>
      );
    };

    // Custom SVG Pie Chart Component
    const ComponentPieChart = ({ data }) => {
      const colors = ['#06B6D4', '#F43F5E', '#8B5CF6', '#10B981'];
      const total = data.reduce((acc, curr) => acc + curr.value, 0);
      let cumulativePercent = 0;

      return (
        <div className="h-full w-full flex flex-col items-center justify-center">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 32 32" className="w-full h-full transform -rotate-90">
              {data.map((item, idx) => {
                const percent = total ? item.value / total : 0;
                const strokeDasharray = `${percent * 100} 100`;
                const strokeDashoffset = -cumulativePercent * 100;
                cumulativePercent += percent;
                return (
                  <circle
                    key={item.name}
                    r="15.91549430918954"
                    cx="16"
                    cy="16"
                    fill="transparent"
                    stroke={colors[idx % colors.length]}
                    strokeWidth="5"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs text-gray-400">Total</span>
              <span className="text-base font-bold text-white">{total} Issues</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-400 mt-4">
            {data.map((item, idx) => (
              <span key={item.name} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: colors[idx % colors.length] }}></span>
                <span className="truncate">{item.name} ({item.value}, {total ? Math.round((item.value / total) * 100) : 0}%)</span>
              </span>
            ))}
          </div>
        </div>
      );
    };

    // Initial Data Sets
    const INITIAL_BUGS = [
      {
        id: 'BUG-101',
        title: 'Streamlit session state reset on file upload',
        component: 'Streamlit UI',
        severity: 'High',
        status: 'In Progress',
        assignee: 'Alex Chen',
        reportedBy: 'CI/CD Automation',
        createdAt: '2026-10-04 14:22',
        description: 'Uploading datasets > 50MB causes Streamlit frontend rerun loop resetting reactive widgets.',
        logs: 'StreamlitAPIException: Signal 9 SIGKILL on child worker process (PID 4021).\nMemory Exceeded Limit: 512MB.',
        aiAnalysis: {
          rootCause: 'Unbounded memory buffer during multipart form-data parsing in Streamlit runner.',
          confidence: 94,
          fixSnippet: '# shared/streamlit_utils.py\n@st.cache_data(max_entries=10, ttl=3600)\ndef handle_large_upload(file_stream):\n    return pd.read_csv(file_stream, chunksize=5000)',
          severityScore: 7.8
        }
      },
      {
        id: 'BUG-102',
        title: 'Gmail OAuth2 Refresh Token expired in background worker',
        component: 'Gmail Integration',
        severity: 'Critical',
        status: 'New',
        assignee: 'Unassigned',
        reportedBy: 'Gmail Watcher',
        createdAt: '2026-10-02 09:15',
        description: 'Auto-triage emails failing to send via Gmail API due to unhandled TokenExpiredException.',
        logs: 'google.auth.exceptions.RefreshError: ("invalid_grant: Bad Request", {\'error\': \'invalid_grant\'})',
        aiAnalysis: null
      },
      {
        id: 'BUG-103',
        title: 'AI model inference bottleneck on long log traces',
        component: 'AI-Bug-Analysis-System',
        severity: 'Medium',
        status: 'In Progress',
        assignee: 'Devon Vance',
        reportedBy: 'System Monitor',
        createdAt: '2026-09-08 18:40',
        description: 'Analysis takes > 12 seconds when parsing stack traces longer than 4000 tokens.',
        logs: 'TimeoutError: Inference pipeline exceeded max limit (10000ms).\nTrace truncation fallback triggered.',
        aiAnalysis: null
      },
      {
        id: 'BUG-104',
        title: 'Triage auto-assignment engine skipping offline engineers',
        component: 'Triage Service',
        severity: 'Low',
        status: 'Resolved',
        assignee: 'Sarah Lin',
        reportedBy: 'Quality Assurance',
        createdAt: '2026-09-15 11:05',
        description: 'Engineers marked as away on Slack still receive high priority tickets.',
        logs: 'TriageEngineWarning: Availability API returned 404 for user s_lin. Defaulted status to AVAILABLE.',
        aiAnalysis: null
      }
    ];

    const METRICS_DATA = [
      { time: '00:00', bugs: 12, resolved: 8 },
      { time: '04:00', bugs: 7, resolved: 10 },
      { time: '08:00', bugs: 18, resolved: 14 },
      { time: '12:00', bugs: 24, resolved: 19 },
      { time: '16:00', bugs: 15, resolved: 22 },
      { time: '20:00', bugs: 9, resolved: 13 }
    ];

    const SEVERITY_COLORS = {
      Critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      High: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    };

    const STATUS_COLORS = {
      New: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      'In Progress': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      Escalated: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      Resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    };

    const apiRequest = async (path, method = 'GET', data) => {
      const response = await fetch(path, {
        method,
        headers: data ? { 'Content-Type': 'application/json' } : {},
        body: data ? JSON.stringify(data) : undefined
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Request failed (${response.status})`);
      }
      return result;
    };

    function App() {
      const [bugs, setBugs] = useState(INITIAL_BUGS);
      const [apiError, setApiError] = useState('');
      const [activeTab, setActiveTab] = useState('dashboard');
      const [selectedBugId, setSelectedBugId] = useState('BUG-101');
      const [searchQuery, setSearchQuery] = useState('');
      const [filterComponent, setFilterComponent] = useState('All');
      const [filterSeverity, setFilterSeverity] = useState('All');
      const [filterStatus, setFilterStatus] = useState('All');
      const [sortBugsBy, setSortBugsBy] = useState('newest');

      // Modal State
      const [isAddModalOpen, setIsAddModalOpen] = useState(false);
      const [newBug, setNewBug] = useState({
        title: '',
        component: 'Streamlit UI',
        severity: 'Medium',
        description: '',
        logs: ''
      });

      // AI Scanner State
      const [isAnalyzing, setIsAnalyzing] = useState(false);

      // Email Logs State (Gmail Module)
      const [emails, setEmails] = useState([
        { id: 'm-1', to: 'alex.c@company.com', subject: '[AUTO-TRIAGE] Ticket Assigned: BUG-101', snippet: 'Issue BUG-101 assigned to you via automated triage rules.', timestamp: '14:23', status: 'Sent' },
        { id: 'm-2', to: 'lead-dev@company.com', subject: '[CRITICAL-ALERT] Token Expired on Gmail Integration', snippet: 'High priority defect BUG-102 requires immediate authorization refresh.', timestamp: '09:16', status: 'Sent' }
      ]);

      const selectedBug = useMemo(() => bugs.find(b => b.id === selectedBugId) || bugs[0], [bugs, selectedBugId]);

      // Filtered bugs
      const filteredBugs = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const severityRank = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        return bugs.filter(bug => {
          const searchableFields = [bug.id, bug.title, bug.component, bug.assignee, bug.description, bug.logs];
          const matchesSearch = !query || searchableFields.some(value => value.toLowerCase().includes(query));
          const matchesComp = filterComponent === 'All' || bug.component === filterComponent;
          const matchesSev = filterSeverity === 'All' || bug.severity === filterSeverity;
          const matchesStatus = filterStatus === 'All' || bug.status === filterStatus;
          return matchesSearch && matchesComp && matchesSev && matchesStatus;
        }).sort((a, b) => {
          if (sortBugsBy === 'severity') return severityRank[a.severity] - severityRank[b.severity];
          const dateDifference = new Date(b.createdAt) - new Date(a.createdAt);
          return sortBugsBy === 'oldest' ? -dateDifference : dateDifference;
        });
      }, [bugs, searchQuery, filterComponent, filterSeverity, filterStatus, sortBugsBy]);

      // Metrics Summary
      const metrics = useMemo(() => {
        return {
          total: bugs.length,
          critical: bugs.filter(b => b.severity === 'Critical' || b.severity === 'High').length,
          inProgress: bugs.filter(b => b.status === 'In Progress').length,
          resolved: bugs.filter(b => b.status === 'Resolved').length,
        };
      }, [bugs]);

      // Component Breakdown for Pie Chart
      const componentPieData = useMemo(() => {
        const counts = {};
        bugs.forEach(b => {
          counts[b.component] = (counts[b.component] || 0) + 1;
        });
        return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
      }, [bugs]);

      // Handle AI Diagnosis Generation
      const handleRunAiDiagnosis = (bugId) => {
        setIsAnalyzing(true);
        setTimeout(async () => {
          const bug = bugs.find(item => item.id === bugId);
          if (!bug) {
            setIsAnalyzing(false);
            return;
          }
          const aiAnalysis = {
            rootCause: `Detected exception trace pattern matching missing exception boundary in module ${bug.component}. Token validation failed during state transition.`,
            confidence: 96,
            fixSnippet: `# Automated Patch for ${bug.id}\ntry:\n    execute_service_pipeline(component="${bug.component}")\nexcept Exception as err:\n    logger.error("Handled issue: %s", err)\n    trigger_gmail_fallback_notification("${bug.id}")`,
            severityScore: bug.severity === 'Critical' ? 9.2 : 6.5
          };
          try {
            const updatedBug = await apiRequest(`/api/bugs/${bugId}`, 'PATCH', { aiAnalysis });
            setBugs(prev => prev.map(item => item.id === bugId ? updatedBug : item));
            setApiError('');
          } catch (error) {
            setApiError(`Could not save analysis: ${error.message}`);
          } finally {
            setIsAnalyzing(false);
          }
        }, 1200);
      };

      // Handle Auto Triage Action
      const handleAutoTriage = async (bugId) => {
        const engineers = ['Alex Chen', 'Sarah Lin', 'Devon Vance', 'Elena Rostova'];
        const randomEngineer = engineers[Math.floor(Math.random() * engineers.length)];
        try {
          const updatedBug = await apiRequest(`/api/bugs/${bugId}`, 'PATCH', {
            status: 'In Progress',
            assignee: randomEngineer
          });
          setBugs(prev => prev.map(b => b.id === bugId ? updatedBug : b));
          setApiError('');
        } catch (error) {
          setApiError(`Could not assign defect: ${error.message}`);
          return;
        }

        // Trigger Gmail Integration Dispatcher
        const newMail = {
          id: `m-${Date.now()}`,
          to: `${randomEngineer.toLowerCase().replace(' ', '.')}@company.com`,
          subject: `[AUTO-TRIAGE] Assigned to ${bugId}`,
          snippet: `Triage engine assigned issue ${bugId} to you. Priority: High.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Sent'
        };
        setEmails(prev => [newMail, ...prev]);
      };

      // Create new bug
      const handleCreateBug = async (e) => {
        e.preventDefault();
        const bugData = {
          title: newBug.title,
          component: newBug.component,
          severity: newBug.severity,
          description: newBug.description,
          logs: newBug.logs || 'No stack trace provided by reporter.'
        };

        try {
          const createdBug = await apiRequest('/api/bugs', 'POST', bugData);
          setBugs(prev => [createdBug, ...prev]);
          setApiError('');
          setIsAddModalOpen(false);
          setNewBug({ title: '', component: 'Streamlit UI', severity: 'Medium', description: '', logs: '' });
        } catch (error) {
          setApiError(`Could not create defect: ${error.message}`);
        }
      };

      useEffect(() => {
        let isMounted = true;
        apiRequest('/api/bugs/initialize', 'POST', { bugs: INITIAL_BUGS })
          .then(savedBugs => {
            if (isMounted) {
              setBugs(savedBugs);
              setApiError('');
            }
          })
          .catch(error => {
            if (isMounted) {
              setApiError(`Backend unavailable; changes cannot be saved. ${error.message}`);
            }
          });
        return () => { isMounted = false; };
      }, []);

      useEffect(() => {
        if (window.lucide) {
          window.lucide.createIcons();
        }
      });

      return (
        <div className="min-h-screen flex flex-col lg:flex-row">
          
          {/* SIDEBAR NAVIGATION */}
          <aside className="w-full lg:w-64 bg-cardbg border-r border-gray-800 flex flex-col justify-between shrink-0">
            <div>
              {/* Header / Monorepo Title */}
              <div className="p-5 border-b border-gray-800 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accentCyan to-accentPurple flex items-center justify-center font-extrabold text-white text-lg shadow-lg">
                  R8
                </div>
                <div>
                  <h1 className="font-extrabold text-sm text-white tracking-wide">Rockydark8</h1>
                  <span className="text-[10px] uppercase font-semibold text-accentCyan tracking-wider bg-cyan-950/60 border border-cyan-800/50 px-1.5 py-0.5 rounded">
                    Monorepo Hub
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="p-3 space-y-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <i data-lucide="layout-dashboard" className="w-4 h-4"></i>
                  <span>System Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab('defect_queue')}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'defect_queue'
                      ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <i data-lucide="bug" className="w-4 h-4"></i>
                  <span>Defect Queue</span>
                  <span className="ml-auto bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full text-[10px]">
                    {bugs.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('ai_analyzer')}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'ai_analyzer'
                      ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <i data-lucide="brain-circuit" className="w-4 h-4 text-accentPurple"></i>
                  <span>AI Bug Analyzer</span>
                </button>

                <button
                  onClick={() => setActiveTab('cicd_pipelines')}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'cicd_pipelines'
                      ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <i data-lucide="git-branch" className="w-4 h-4 text-emerald-400"></i>
                  <span>CI/CD Workflows</span>
                  <span className="ml-auto flex h-2 w-2 rounded-full bg-emerald-400"></span>
                </button>

                <button
                  onClick={() => setActiveTab('dep_matrix')}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'dep_matrix'
                      ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <i data-lucide="network" className="w-4 h-4 text-amber-400"></i>
                  <span>Dependency Graph</span>
                </button>

                <button
                  onClick={() => setActiveTab('gmail')}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'gmail'
                      ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <i data-lucide="mail" className="w-4 h-4 text-rose-400"></i>
                  <span>Gmail Dispatcher</span>
                  <span className="ml-auto bg-rose-950/60 text-rose-400 border border-rose-800/50 px-1.5 py-0.5 rounded text-[10px]">
                    {emails.length}
                  </span>
                </button>
              </nav>
            </div>

            {/* Repositories Integrated Tag Footer */}
            <div className="p-4 border-t border-gray-800/80 bg-gray-900/30">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Integrated Repos</div>
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded border border-gray-700">Streamlit</span>
                <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded border border-gray-700">defect</span>
                <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded border border-gray-700">triage</span>
                <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded border border-gray-700">Gmail</span>
                <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded border border-gray-700">AI-Bug-Analysis</span>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 flex flex-col overflow-y-auto">
            
            {/* TOP BAR */}
            <header className="bg-cardbg/80 backdrop-blur-md border-b border-gray-800 p-4 sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-gray-400 font-medium capitalize">Workspace / {activeTab.replace('_', ' ')}</span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(bugs, null, 2))}`;
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", jsonString);
                    downloadAnchor.setAttribute("download", `rockydark8_bugs_export_${Date.now()}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-xs px-3.5 py-2 rounded-lg transition-all border border-gray-700 flex items-center space-x-2"
                >
                  <i data-lucide="download" className="w-4 h-4"></i>
                  <span className="hidden sm:inline">Export Audit Report</span>
                </button>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-r from-accentCyan to-brand-600 hover:from-cyan-500 hover:to-brand-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all shadow-md flex items-center space-x-2"
                >
                  <i data-lucide="plus-circle" className="w-4 h-4"></i>
                  <span>Report New Defect</span>
                </button>
              </div>
            </header>

            {apiError && (
              <div role="alert" className="mx-4 mt-4 sm:mx-6 rounded-lg border border-rose-800/60 bg-rose-950/50 px-4 py-3 text-xs text-rose-200">
                {apiError}
              </div>
            )}

            {/* BODY PANELS */}
            <div className="p-4 sm:p-6 space-y-6 flex-1">
              
              {/* TAB 1: SYSTEM DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-cardbg border border-gray-800 p-5 rounded-xl glow-cyan flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-gray-400 uppercase">Total Logged Issues</span>
                        <div className="text-2xl font-extrabold text-white mt-1">{metrics.total}</div>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-accentCyan">
                        <i data-lucide="layers" className="w-5 h-5"></i>
                      </div>
                    </div>

                    <div className="bg-cardbg border border-gray-800 p-5 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-gray-400 uppercase">Critical & High</span>
                        <div className="text-2xl font-extrabold text-rose-400 mt-1">{metrics.critical}</div>
                        <div className="text-[11px] text-gray-500 mt-1">
                          {metrics.total ? Math.round((metrics.critical / metrics.total) * 100) : 0}% of all issues
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-rose-950/60 border border-rose-800/50 flex items-center justify-center text-rose-400">
                        <i data-lucide="alert-triangle" className="w-5 h-5"></i>
                      </div>
                    </div>

                    <div className="bg-cardbg border border-gray-800 p-5 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-gray-400 uppercase">In Active Triage</span>
                        <div className="text-2xl font-extrabold text-brand-300 mt-1">{metrics.inProgress}</div>
                        <div className="text-[11px] text-gray-500 mt-1">
                          {metrics.total ? Math.round((metrics.inProgress / metrics.total) * 100) : 0}% of all issues
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-brand-950/60 border border-brand-800/50 flex items-center justify-center text-brand-400">
                        <i data-lucide="clock" className="w-5 h-5"></i>
                      </div>
                    </div>

                    <div className="bg-cardbg border border-gray-800 p-5 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-gray-400 uppercase">Auto Resolved</span>
                        <div className="text-2xl font-extrabold text-emerald-400 mt-1">{metrics.resolved}</div>
                        <div className="text-[11px] text-gray-500 mt-1">
                          {metrics.total ? Math.round((metrics.resolved / metrics.total) * 100) : 0}% of all issues
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
                        <i data-lucide="check-circle-2" className="w-5 h-5"></i>
                      </div>
                    </div>
                  </div>

                  {/* Visual Analytics Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-cardbg border border-gray-800 p-5 rounded-xl h-80 flex flex-col">
                      <h3 className="text-sm font-bold text-gray-200 mb-4 flex items-center justify-between">
                        <span>Defect Lifecycle & Resolution Velocity</span>
                        <span className="text-xs font-normal text-gray-400">Real-time Streamlit telemetry</span>
                      </h3>
                      <div className="flex-1 w-full">
                        <MetricsAreaChart data={METRICS_DATA} />
                      </div>
                    </div>

                    <div className="bg-cardbg border border-gray-800 p-5 rounded-xl h-80 flex flex-col">
                      <h3 className="text-sm font-bold text-gray-200 mb-2">Component Distribution</h3>
                      <div className="flex-1 w-full">
                        <ComponentPieChart data={componentPieData} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DEFECT QUEUE */}
              {activeTab === 'defect_queue' && (
                <div className="space-y-4">
                  {/* Filter Toolbar */}
                  <div className="bg-cardbg border border-gray-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-80">
                      <i data-lucide="search" className="w-4 h-4 absolute left-3 top-3 text-gray-500"></i>
                      <input
                        type="text"
                        placeholder="Search defects, logs, assignees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-darkbg border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-xs text-gray-200 focus:outline-none focus:border-accentCyan"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                      <select
                        value={filterComponent}
                        onChange={(e) => setFilterComponent(e.target.value)}
                        aria-label="Filter by repository or module"
                        className="bg-darkbg border border-gray-800 text-xs text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-accentCyan"
                      >
                        <option value="All">All Repos / Modules</option>
                        <option value="Streamlit UI">Streamlit UI</option>
                        <option value="Gmail Integration">Gmail Integration</option>
                        <option value="Triage Service">Triage Service</option>
                        <option value="AI-Bug-Analysis-System">AI-Bug-Analysis-System</option>
                      </select>

                      <select
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value)}
                        aria-label="Filter by severity"
                        className="bg-darkbg border border-gray-800 text-xs text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-accentCyan"
                      >
                        <option value="All">All Severities</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>

                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        aria-label="Filter by status"
                        className="bg-darkbg border border-gray-800 text-xs text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-accentCyan"
                      >
                        <option value="All">All Statuses</option>
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Escalated">Escalated</option>
                        <option value="Resolved">Resolved</option>
                      </select>

                      <select
                        value={sortBugsBy}
                        onChange={(e) => setSortBugsBy(e.target.value)}
                        aria-label="Sort defects"
                        className="bg-darkbg border border-gray-800 text-xs text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-accentCyan"
                      >
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="severity">Highest severity</option>
                      </select>
                    </div>
                  </div>

                  {/* Defects Table */}
                  <div className="bg-cardbg border border-gray-800 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-gray-800 text-[11px] text-gray-400">
                      Showing <span className="font-semibold text-gray-200">{filteredBugs.length}</span> of {bugs.length} defects
                    </div>
                    <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-xs">
                      <thead className="bg-gray-900/60 border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="p-4">Issue ID</th>
                          <th className="p-4">Title & Component</th>
                          <th className="p-4">Severity</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Assignee</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/60">
                        {filteredBugs.length === 0 && (
                          <tr>
                            <td colSpan="6" className="p-10 text-center">
                              <i data-lucide="search-x" className="w-8 h-8 mx-auto mb-2 text-gray-600"></i>
                              <p className="text-sm font-semibold text-gray-300">No defects match these filters</p>
                              <p className="text-xs text-gray-500 mt-1">Try another search or clear the selected filters.</p>
                              <button
                                onClick={() => {
                                  setSearchQuery('');
                                  setFilterComponent('All');
                                  setFilterSeverity('All');
                                  setFilterStatus('All');
                                }}
                                className="mt-3 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-semibold transition-all"
                              >
                                Clear filters
                              </button>
                            </td>
                          </tr>
                        )}
                        {filteredBugs.map((bug) => (
                          <tr key={bug.id} className="hover:bg-gray-800/30 transition-all">
                            <td className="p-4 font-mono font-bold text-accentCyan">{bug.id}</td>
                            <td className="p-4">
                              <div className="font-semibold text-gray-100">{bug.title}</div>
                              <span className="text-[10px] text-gray-400">{bug.component} • {bug.createdAt}</span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full font-bold border text-[10px] ${SEVERITY_COLORS[bug.severity]}`}>
                                {bug.severity}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full font-bold border text-[10px] ${STATUS_COLORS[bug.status]}`}>
                                {bug.status}
                              </span>
                            </td>
                            <td className="p-4 text-gray-300">{bug.assignee}</td>
                            <td className="p-4 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedBugId(bug.id);
                                  setActiveTab('ai_analyzer');
                                }}
                                className="px-2.5 py-1 bg-accentPurple/20 hover:bg-accentPurple/30 text-purple-300 border border-accentPurple/40 rounded text-[11px] font-semibold transition-all"
                              >
                                Analyze AI
                              </button>
                              <button
                                onClick={() => handleAutoTriage(bug.id)}
                                className="px-2.5 py-1 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/50 rounded text-[11px] font-semibold transition-all"
                              >
                                Auto Triage
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: AI BUG ANALYZER WITH CODE DIFF & MERGE PATCH */}
              {activeTab === 'ai_analyzer' && selectedBug && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Bug Select & Trace */}
                  <div className="space-y-6">
                    <div className="bg-cardbg border border-gray-800 rounded-xl p-5">
                      <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-2">Select Defect for Deep Scan</label>
                      <select
                        value={selectedBug.id}
                        onChange={(e) => setSelectedBugId(e.target.value)}
                        className="w-full bg-darkbg border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-accentCyan"
                      >
                        {bugs.map(b => (
                          <option key={b.id} value={b.id}>{b.id}: {b.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-cardbg border border-gray-800 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 uppercase font-semibold">Defect Meta</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${SEVERITY_COLORS[selectedBug.severity]}`}>
                          {selectedBug.severity}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-100">{selectedBug.title}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">{selectedBug.description}</p>
                      <div className="pt-2 border-t border-gray-800">
                        <span className="text-xs text-gray-400 font-semibold block mb-1">Stack Trace Logs</span>
                        <pre className="bg-darkbg p-3 rounded-lg text-xs font-mono text-rose-300 border border-gray-800 overflow-x-auto whitespace-pre-wrap">
                          {selectedBug.logs}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: AI Root Cause & Fix Generator */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-cardbg border border-gray-800 rounded-xl p-6 relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-lg bg-accentPurple/20 border border-accentPurple/40 flex items-center justify-center text-accentPurple">
                            <i data-lucide="sparkles" className="w-5 h-5"></i>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-100">AI Neural Root Cause Analysis</h3>
                            <p className="text-xs text-gray-400">Trained on repository commit patterns & failure metrics</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRunAiDiagnosis(selectedBug.id)}
                          disabled={isAnalyzing}
                          className="bg-accentPurple/20 hover:bg-accentPurple/30 border border-accentPurple/40 text-purple-300 text-xs px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-all"
                        >
                          <i data-lucide="refresh-cw" className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`}></i>
                          <span>{isAnalyzing ? 'Scanning Stack...' : 'Re-run Diagnosis'}</span>
                        </button>
                      </div>

                      {selectedBug.aiAnalysis ? (
                        <div className="space-y-5">
                          {/* Metrics Pill Grid */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-900/60 border border-gray-800 p-4 rounded-xl">
                              <div className="text-xs text-gray-400">AI Confidence Score</div>
                              <div className="text-2xl font-extrabold text-accentCyan mt-1">
                                {selectedBug.aiAnalysis.confidence}%
                              </div>
                            </div>
                            <div className="bg-gray-900/60 border border-gray-800 p-4 rounded-xl">
                              <div className="text-xs text-gray-400">Calculated Risk Index</div>
                              <div className="text-2xl font-extrabold text-rose-400 mt-1">
                                {selectedBug.aiAnalysis.severityScore} / 10
                              </div>
                            </div>
                          </div>

                          {/* Root Cause Diagnosis */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Diagnosis</h4>
                            <p className="text-sm text-gray-200 bg-gray-900/40 p-3.5 rounded-lg border border-gray-800/80">
                              {selectedBug.aiAnalysis.rootCause}
                            </p>
                          </div>

                          {/* Automated Interactive Code Patch & Sandbox */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Automated Code Patch Sandbox</h4>
                              <button
                                onClick={() => {
                                  setBugs(prev => prev.map(b => b.id === selectedBug.id ? { ...b, status: 'Resolved' } : b));
                                }}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-all shadow flex items-center space-x-1.5"
                              >
                                <i data-lucide="git-merge" className="w-3.5 h-3.5"></i>
                                <span>Apply & Auto-Merge Patch</span>
                              </button>
                            </div>
                            <pre className="bg-darkbg border border-emerald-950/80 p-4 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto relative">
                              {selectedBug.aiAnalysis.fixSnippet}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 text-center text-gray-500">
                          <i data-lucide="cpu" className="w-10 h-10 mx-auto mb-3 opacity-40"></i>
                          <p className="text-sm">No analysis cached for this issue yet.</p>
                          <button
                            onClick={() => handleRunAiDiagnosis(selectedBug.id)}
                            className="mt-3 px-4 py-2 bg-accentPurple text-white text-xs font-semibold rounded-lg hover:bg-purple-600 transition-all"
                          >
                            Run AI Diagnosis Now
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* NEW TAB: CI/CD WORKFLOWS SIMULATOR */}
              {activeTab === 'cicd_pipelines' && (
                <div className="space-y-6">
                  <div className="bg-cardbg border border-gray-800 p-5 rounded-xl flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <i data-lucide="git-branch" className="w-5 h-5 text-emerald-400"></i>
                        Monorepo Integrated Continuous Delivery Workflows
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">Automated build, test, and container packaging across repositories</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { name: 'Streamlit UI Integration Tests', repo: 'apps/streamlit-app', status: 'Passing', time: '2m 14s', commit: 'fe3a91b' },
                      { name: 'AI Bug Analyzer Model Suite', repo: 'services/ai-bug-analyzer', status: 'Passing', time: '4m 02s', commit: '820cf19' },
                      { name: 'Defect Management API', repo: 'services/defect-tracker', status: 'Passing', time: '1m 45s', commit: 'a19d803' },
                      { name: 'Gmail Dispatcher OAuth Handshake', repo: 'services/gmail-service', status: 'Failed', time: '48s', commit: 'bc0412e' },
                      { name: 'Auto-Triage Rule Engine', repo: 'services/triage-service', status: 'Passing', time: '1m 12s', commit: '77e810a' },
                    ].map((pipeline, i) => (
                      <div key={i} className="bg-cardbg border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3.5">
                          <div className={`w-3 h-3 rounded-full ${pipeline.status === 'Passing' ? 'bg-emerald-400' : 'bg-rose-500 animate-pulse'}`}></div>
                          <div>
                            <div className="font-semibold text-white text-sm">{pipeline.name}</div>
                            <div className="text-xs text-gray-400 font-mono mt-0.5">{pipeline.repo} • commit <span className="text-cyan-400">{pipeline.commit}</span></div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-xs">
                          <span className="text-gray-400">Duration: <strong className="text-gray-200">{pipeline.time}</strong></span>
                          <span className={`px-2.5 py-1 rounded-full font-bold border ${pipeline.status === 'Passing' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                            {pipeline.status}
                          </span>
                          <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-semibold transition-all">
                            Re-run
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NEW TAB: DEPENDENCY GRAPH MATRIX */}
              {activeTab === 'dep_matrix' && (
                <div className="bg-cardbg border border-gray-800 rounded-xl p-6 space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <i data-lucide="network" className="w-5 h-5 text-amber-400"></i>
                      Monorepo Cross-Service Dependency Architecture
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Shared libraries, RPC contracts, and microservice topologies</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-darkbg rounded-xl border border-gray-800">
                      <div className="font-bold text-accentCyan text-sm mb-2">Frontend Applications</div>
                      <div className="p-3 bg-gray-900 rounded-lg border border-gray-800 mb-2">
                        <div className="font-semibold text-white text-xs">Streamlit UI Dashboard</div>
                        <div className="text-[11px] text-gray-400 mt-1">Depends on: AI Analyzer, Defect API</div>
                      </div>
                    </div>

                    <div className="p-4 bg-darkbg rounded-xl border border-gray-800">
                      <div className="font-bold text-accentPurple text-sm mb-2">AI & Intelligence Core</div>
                      <div className="p-3 bg-gray-900 rounded-lg border border-gray-800 mb-2">
                        <div className="font-semibold text-white text-xs">AI-Bug-Analysis-System</div>
                        <div className="text-[11px] text-gray-400 mt-1">Depends on: Shared PyTorch Models</div>
                      </div>
                    </div>

                    <div className="p-4 bg-darkbg rounded-xl border border-gray-800">
                      <div className="font-bold text-emerald-400 text-sm mb-2">Backend & Notification</div>
                      <div className="p-3 bg-gray-900 rounded-lg border border-gray-800 mb-2">
                        <div className="font-semibold text-white text-xs">Triage & Gmail Integration</div>
                        <div className="text-[11px] text-gray-400 mt-1">Depends on: Defect Engine</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: GMAIL NOTIFICATIONS */}
              {activeTab === 'gmail' && (
                <div className="bg-cardbg border border-gray-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                    <div>
                      <h3 className="font-bold text-gray-100 flex items-center space-x-2">
                        <i data-lucide="mail" className="w-4 h-4 text-rose-400"></i>
                        <span>Gmail Automated Notification Log</span>
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">Automated triage triggers and escalation alerts</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {emails.map(mail => (
                      <div key={mail.id} className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl hover:border-gray-700 transition-all">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                          <span className="font-semibold text-gray-300">To: {mail.to}</span>
                          <span>{mail.timestamp}</span>
                        </div>
                        <h4 className="font-semibold text-sm text-gray-100">{mail.subject}</h4>
                        <p className="text-xs text-gray-400 mt-1">{mail.snippet}</p>
                        <div className="mt-2 text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {mail.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </main>

          {/* CREATE DEFECT MODAL */}
          {isAddModalOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-cardbg border border-gray-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                  <i data-lucide="x" className="w-5 h-5"></i>
                </button>

                <h3 className="text-lg font-bold text-white mb-4">Submit Software Defect</h3>

                <form onSubmit={handleCreateBug} className="space-y-4 text-sm">
                  <div>
                    <label className="text-xs text-gray-400 font-medium block mb-1">Defect Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Memory leak on multi-threading"
                      value={newBug.title}
                      onChange={e => setNewBug({...newBug, title: e.target.value})}
                      className="w-full bg-darkbg border border-gray-800 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-accentCyan"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 font-medium block mb-1">Module</label>
                      <select
                        value={newBug.component}
                        onChange={e => setNewBug({...newBug, component: e.target.value})}
                        className="w-full bg-darkbg border border-gray-800 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-accentCyan"
                      >
                        <option value="Streamlit UI">Streamlit UI</option>
                        <option value="Gmail Integration">Gmail Integration</option>
                        <option value="Triage Service">Triage Service</option>
                        <option value="AI-Bug-Analysis-System">AI-Bug-Analysis-System</option>
                        <option value="Defect Tracker">Defect Tracker</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 font-medium block mb-1">Severity</label>
                      <select
                        value={newBug.severity}
                        onChange={e => setNewBug({...newBug, severity: e.target.value})}
                        className="w-full bg-darkbg border border-gray-800 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-accentCyan"
                      >
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 font-medium block mb-1">Description</label>
                    <textarea
                      required
                      rows="3"
                      placeholder="Detailed reproduction steps..."
                      value={newBug.description}
                      onChange={e => setNewBug({...newBug, description: e.target.value})}
                      className="w-full bg-darkbg border border-gray-800 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-accentCyan"
                    ></textarea>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 font-medium block mb-1">Stack Trace Logs (Optional)</label>
                    <textarea
                      rows="3"
                      placeholder="Paste exception trace here..."
                      value={newBug.logs}
                      onChange={e => setNewBug({...newBug, logs: e.target.value})}
                      className="w-full bg-darkbg border border-gray-800 rounded-lg px-3 py-2 font-mono text-xs text-rose-300 focus:outline-none focus:border-accentCyan"
                    ></textarea>
                  </div>

                  <div className="pt-2 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-700 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-accentCyan to-brand-600 text-white rounded-lg text-xs font-semibold hover:from-cyan-500 hover:to-brand-700 transition-all shadow-md"
                    >
                      Log Issue
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      );
    }

    // Mount React App cleanly
    const rootElement = document.getElementById('root');
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
