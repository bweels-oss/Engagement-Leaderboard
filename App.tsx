import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import TeamCard from './components/TeamCard';
import { generateInitialData, ingestSubmission } from './services/dataService';
import { checkForNewMockResponses, mockMicrosoftLogin, AVAILABLE_FORMS } from './services/mockIntegration';
import { Team, Task, Submission, MicrosoftForm } from './types';
import { ArrowLeft, CheckCircle, Clock, Users, Calendar, UploadCloud, RefreshCw, Link2, Unlink, ExternalLink, Loader2, PlayCircle } from 'lucide-react';

// --- Sub-Components ---

const DashboardView = ({ teams, onTeamClick, lastUpdate }: { teams: Team[], onTeamClick: (t: Team) => void, lastUpdate?: string }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-api-gray">Team Rankings</h2>
          <p className="text-gray-500">Real-time engagement progress.</p>
        </div>
        <div className="flex items-center gap-3">
            {lastUpdate && (
                <span className="text-xs text-gray-400 animate-pulse">
                    Last update: {new Date(lastUpdate).toLocaleTimeString()}
                </span>
            )}
            <div className="bg-blue-50 text-api-blue px-4 py-2 rounded-lg text-sm font-medium border border-blue-100 flex items-center gap-2">
                <RefreshCw size={16} /> Auto-updates active
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {teams.map(team => (
          <TeamCard key={team.id} team={team} onClick={onTeamClick} />
        ))}
      </div>
    </div>
  );
};

const TeamDetailsView = ({ team, tasks, onBack }: { team: Team, tasks: Task[], onBack: () => void }) => {
  const teamTasks = tasks.filter(t => t.teamId === team.id);
  const completed = teamTasks.filter(t => t.status === 'Completed');
  const pending = teamTasks.filter(t => t.status === 'Pending');

  return (
    <div className="space-y-6 animate-fadeIn">
      <button 
        onClick={onBack}
        className="flex items-center text-api-accent hover:underline mb-2 font-medium"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Leaderboard
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-api-blue">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-api-gray">{team.name}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Users size={14}/> {team.members.length || 5} Members</span>
              <span className="flex items-center gap-1"><Calendar size={14}/> Last Active: {team.lastSubmissionDate ? new Date(team.lastSubmissionDate).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-api-blue">{team.percentComplete}%</div>
            <div className="text-sm text-gray-500">Overall Completion</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold text-api-gray border-b pb-2">Task Progress</h3>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {teamTasks.map((task, idx) => (
              <div key={task.id} className={`p-4 flex items-center justify-between border-b last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  {task.status === 'Completed' ? (
                    <CheckCircle className="text-api-green" size={20} color="#2E7D32" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                  <div>
                    <p className={`font-medium ${task.status === 'Completed' ? 'text-gray-800 line-through opacity-70' : 'text-gray-800'}`}>
                      {task.title}
                    </p>
                    {task.completedDate && (
                      <p className="text-xs text-gray-400">Completed on {new Date(task.completedDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                <div className="font-bold text-api-accent bg-blue-50 px-2 py-1 rounded text-xs">
                  {task.points} pts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           <div className="bg-white p-5 rounded-lg shadow-sm">
             <h4 className="font-semibold text-gray-700 mb-3">Stats</h4>
             <ul className="space-y-2 text-sm">
               <li className="flex justify-between">
                 <span>Points Earned:</span>
                 <span className="font-bold text-api-blue">{team.points}</span>
               </li>
               <li className="flex justify-between">
                 <span>Tasks Completed:</span>
                 <span className="font-bold">{completed.length}</span>
               </li>
               <li className="flex justify-between">
                 <span>Tasks Remaining:</span>
                 <span className="font-bold text-api-red">{pending.length}</span>
               </li>
             </ul>
           </div>
           
           <div className="bg-white p-5 rounded-lg shadow-sm">
             <h4 className="font-semibold text-gray-700 mb-3">Team Members</h4>
             <ul className="space-y-2">
                {[1,2,3,4,5].map(m => (
                  <li key={m} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                      {String.fromCharCode(64 + m)}
                    </div>
                    Member {m}
                  </li>
                ))}
             </ul>
           </div>
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({ 
  onIngest,
  linkedForm,
  onLinkForm,
  onUnlinkForm
}: { 
  onIngest: (data: any) => void,
  linkedForm: MicrosoftForm | null,
  onLinkForm: (form: MicrosoftForm) => void,
  onUnlinkForm: () => void
}) => {
  const [activeTab, setActiveTab] = useState<'connect' | 'simulate'>('connect');
  const [platform, setPlatform] = useState<'Microsoft' | 'Google'>('Microsoft');
  const [payload, setPayload] = useState('{\n  "teamName": "Safety First Squad",\n  "taskTitle": "Complete Safety Module"\n}');
  const [status, setStatus] = useState<string | null>(null);

  // Connection State
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showFormSelector, setShowFormSelector] = useState(false);

  const handleSimulate = () => {
    try {
      const data = JSON.parse(payload);
      onIngest({ ...data, formPlatform: platform });
      setStatus(`Success! Ingested from ${platform} Forms.`);
      setTimeout(() => setStatus(null), 3000);
    } catch (e) {
      setStatus('Error: Invalid JSON payload.');
    }
  };

  const handleConnectClick = async () => {
    setIsAuthenticating(true);
    await mockMicrosoftLogin();
    setIsAuthenticating(false);
    setShowFormSelector(true);
  };

  const handleFormSelect = (form: MicrosoftForm) => {
    onLinkForm(form);
    setShowFormSelector(false);
    setStatus(`Successfully linked to ${form.title}`);
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-api-gray">Integrations & Settings</h2>
        <p className="text-gray-500">Manage data sources and simulation tools.</p>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
         <button 
           className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'connect' ? 'text-api-blue border-b-2 border-api-blue' : 'text-gray-500 hover:text-gray-700'}`}
           onClick={() => setActiveTab('connect')}
         >
           Microsoft Forms Integration
         </button>
         <button 
           className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'simulate' ? 'text-api-blue border-b-2 border-api-blue' : 'text-gray-500 hover:text-gray-700'}`}
           onClick={() => setActiveTab('simulate')}
         >
           Manual Simulator
         </button>
      </div>

      {activeTab === 'connect' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
           <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-teal-600 rounded flex items-center justify-center text-white shrink-0">
                  <span className="font-bold text-xl">F</span>
              </div>
              <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">Microsoft Forms</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Connect a specific Microsoft Form to automatically ingest submissions. 
                    The app will poll for new responses and update the leaderboard in real-time.
                  </p>
              </div>
           </div>

           {!linkedForm ? (
             <div className="mt-4 bg-gray-50 p-6 rounded-lg flex flex-col items-center justify-center border border-dashed border-gray-300">
               {!showFormSelector ? (
                  <>
                    <p className="text-gray-600 mb-4 text-center">No form currently connected.</p>
                    <button 
                      onClick={handleConnectClick}
                      disabled={isAuthenticating}
                      className="bg-api-blue hover:bg-api-accent text-white px-6 py-2 rounded-md font-semibold flex items-center gap-2 transition-all disabled:opacity-70"
                    >
                      {isAuthenticating ? <Loader2 className="animate-spin" size={20} /> : <Link2 size={20} />}
                      {isAuthenticating ? 'Connecting to Microsoft...' : 'Connect Microsoft Form'}
                    </button>
                  </>
               ) : (
                  <div className="w-full max-w-md">
                    <h4 className="font-semibold text-gray-700 mb-3">Select a Form to Link:</h4>
                    <div className="space-y-2">
                        {AVAILABLE_FORMS.map(form => (
                            <button
                                key={form.id}
                                onClick={() => handleFormSelect(form)}
                                className="w-full text-left p-3 bg-white border border-gray-200 rounded hover:border-api-blue hover:shadow-sm transition-all flex items-center justify-between group"
                            >
                                <span className="font-medium text-gray-800">{form.title}</span>
                                <span className="text-api-blue opacity-0 group-hover:opacity-100">Select</span>
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setShowFormSelector(false)} className="mt-4 text-sm text-gray-500 hover:underline w-full text-center">Cancel</button>
                  </div>
               )}
             </div>
           ) : (
             <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full text-green-700">
                      <Link2 size={24} />
                  </div>
                  <div>
                      <p className="text-sm text-green-800 font-bold uppercase tracking-wider">Connected</p>
                      <h4 className="font-semibold text-gray-800">{linkedForm.title}</h4>
                      <a href={linkedForm.url} target="_blank" rel="noreferrer" className="text-xs text-api-blue hover:underline flex items-center gap-1 mt-1">
                          View Form <ExternalLink size={10} />
                      </a>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                   <div className="px-3 py-1 bg-white border border-green-200 rounded text-xs text-green-700 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Listening for updates...
                   </div>
                   <button 
                     onClick={onUnlinkForm}
                     className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                     title="Disconnect"
                   >
                     <Unlink size={20} />
                   </button>
               </div>
             </div>
           )}
        </div>
      )}

      {activeTab === 'simulate' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
            <h3 className="font-bold text-gray-800">Manual Webhook Simulator</h3>
            <p className="text-sm text-gray-600">Simulate a raw JSON payload arriving at the webhook endpoint.</p>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
                <button 
                    onClick={() => setPlatform('Microsoft')}
                    className={`py-2 px-4 rounded border text-sm font-medium ${platform === 'Microsoft' ? 'bg-api-blue text-white border-api-blue' : 'bg-gray-50 text-gray-600'}`}
                >
                    Microsoft Forms
                </button>
                <button 
                    onClick={() => setPlatform('Google')}
                    className={`py-2 px-4 rounded border text-sm font-medium ${platform === 'Google' ? 'bg-green-600 text-white border-green-600' : 'bg-gray-50 text-gray-600'}`}
                >
                    Google Forms
                </button>
            </div>

            <textarea 
                className="w-full h-32 p-3 font-mono text-sm bg-gray-50 border rounded focus:ring-2 focus:ring-api-accent outline-none"
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
            />

            <button 
                onClick={handleSimulate}
                className="w-full bg-gray-800 hover:bg-black text-white py-2 rounded font-medium flex items-center justify-center gap-2"
            >
                <PlayCircle size={18} />
                Send Test Payload
            </button>
        </div>
      )}

      {status && (
        <div className={`fixed bottom-8 right-8 p-4 rounded shadow-lg animate-bounce-in z-50 flex items-center gap-2 ${status.includes('Error') ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-gray-800 text-white'}`}>
            {status.includes('Error') ? null : <CheckCircle size={18} className="text-green-400" />}
            {status}
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [view, setView] = useState<'dashboard' | 'team_details' | 'settings'>('dashboard');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [linkedForm, setLinkedForm] = useState<MicrosoftForm | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | undefined>(undefined);
  const [toast, setToast] = useState<{ message: string, visible: boolean }>({ message: '', visible: false });

  // App State (The Mock Database)
  const [data, setData] = useState<{ teams: Team[], tasks: Task[], submissions: Submission[] }>({
    teams: [], tasks: [], submissions: []
  });

  // Load Initial Seed Data
  useEffect(() => {
    setData(generateInitialData());
  }, []);

  // Polling Effect for Connected Forms
  useEffect(() => {
    if (!linkedForm) return;

    const intervalId = setInterval(() => {
        const mockResponse = checkForNewMockResponses(linkedForm.id);
        if (mockResponse) {
            handleIngest(mockResponse);
            setLastUpdate(new Date().toISOString());
            showToast(`New submission received from ${linkedForm.title}`);
        }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, [linkedForm, data.teams, data.tasks]); // Dependency on data ensures we have latest state context if needed (though ingest uses state updater)

  // Handlers
  const handleTeamClick = (team: Team) => {
    setSelectedTeam(team);
    setView('team_details');
  };

  const showToast = (msg: string) => {
      setToast({ message: msg, visible: true });
      setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
  };

  const handleIngest = (formData: { teamName: string; taskTitle: string; formPlatform: 'Microsoft' | 'Google' }) => {
    try {
      // Functional update to avoid stale state in interval closure
      setData(currentData => {
          const result = ingestSubmission(currentData.teams, currentData.tasks, formData);
          if (result.newSubmission) {
            return {
              teams: result.teams,
              tasks: result.tasks,
              submissions: [...currentData.submissions, result.newSubmission!]
            };
          } else {
             console.warn('Ingestion failed: No matching team/task found for', formData);
             return currentData; 
          }
      });
    } catch (e: any) {
      console.error(e.message);
    }
  };

  return (
    <Layout currentView={view} onChangeView={(v) => { setView(v as any); setSelectedTeam(null); }}>
      {view === 'dashboard' && (
        <DashboardView 
            teams={data.teams} 
            onTeamClick={handleTeamClick} 
            lastUpdate={lastUpdate}
        />
      )}
      
      {view === 'team_details' && selectedTeam && (
        <TeamDetailsView 
          team={data.teams.find(t => t.id === selectedTeam.id) || selectedTeam} // Ensure we pass updated team object
          tasks={data.tasks} 
          onBack={() => { setView('dashboard'); setSelectedTeam(null); }} 
        />
      )}

      {view === 'settings' && (
        <SettingsView 
            onIngest={handleIngest} 
            linkedForm={linkedForm}
            onLinkForm={setLinkedForm}
            onUnlinkForm={() => setLinkedForm(null)}
        />
      )}

      {/* Global Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-3 animate-fade-in-up">
            <div className="w-2 h-2 bg-api-accent rounded-full animate-pulse" />
            {toast.message}
        </div>
      )}
    </Layout>
  );
}