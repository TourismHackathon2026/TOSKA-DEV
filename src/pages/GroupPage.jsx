import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, AlertTriangle, MessageSquare, CheckCircle2, Loader2 } from 'lucide-react';
import LocationMapPreview from '../components/LocationMapPreview';
import {
  getUserGroupsFromFirestore,
  subscribeToGroupMessages,
  subscribeToGroupNotifications,
  createGroupMessageInFirestore,
  createGroupLostAlert,
  createGroupFoundReportInFirestore,
  addMemberToGroup,
} from '../utils/firebaseService';

export default function GroupPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendingLost, setSendingLost] = useState(false);
  const [sendingFound, setSendingFound] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [activeTab, setActiveTab] = useState('messages');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [memberError, setMemberError] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => {
    loadGroups();
  }, [user]);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const data = await getUserGroupsFromFirestore(user?.email, user);
      setGroups(data);
      if (data.length > 0) {
        setSelectedGroup(data[0]);
      }
    } catch (err) {
      console.error('Failed to load groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedGroup?.id) {
      setMessages([]);
      setAlerts([]);
      return undefined;
    }

    const unsubMessages = subscribeToGroupMessages(selectedGroup.id, setMessages);
    const unsubAlerts = subscribeToGroupNotifications(selectedGroup.id, setAlerts);

    return () => {
      unsubMessages?.();
      unsubAlerts?.();
    };
  }, [selectedGroup?.id]);

  const handleSendMessage = async () => {
    if (!selectedGroup?.id || !messageText.trim()) return;
    setSendingMessage(true);
    try {
      await createGroupMessageInFirestore(selectedGroup.id, messageText.trim());
      setMessageText('');
    } catch (err) {
      console.error(err);
      setStatusMessage('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleLostAlert = async () => {
    if (!selectedGroup?.id) return;
    setSendingLost(true);
    setStatusMessage('');
    try {
      await createGroupLostAlert(selectedGroup.id);
      setStatusMessage('Lost alert sent to group members with live location details!');
    } catch (err) {
      console.error(err);
      setStatusMessage('Failed to send lost alert');
    } finally {
      setSendingLost(false);
    }
  };

  const handleFoundReport = async () => {
    if (!selectedGroup?.id) return;
    setSendingFound(true);
    setStatusMessage('');
    try {
      await createGroupFoundReportInFirestore(selectedGroup.id, 'Member accounted for and safe.');
      await createGroupMessageInFirestore(selectedGroup.id, '✅ Found report filed. Member is safe.');
      setStatusMessage('Found report sent to group!');
    } catch (err) {
      console.error(err);
      setStatusMessage('Failed to send found report');
    } finally {
      setSendingFound(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedGroup?.id) return;
    const email = newMemberEmail.trim().toLowerCase();
    setMemberError('');
    setStatusMessage('');

    if (!email) {
      setMemberError('Enter a valid email address to add.');
      return;
    }

    setAddingMember(true);
    try {
      const updatedGroup = await addMemberToGroup(selectedGroup.id, email, user);
      setSelectedGroup(updatedGroup);
      setGroups((prevGroups) => prevGroups.map((group) => (group.id === updatedGroup.id ? updatedGroup : group)));
      setNewMemberEmail('');
      setStatusMessage('Member added successfully to the group.');
    } catch (err) {
      console.error(err);
      setMemberError(err.message || 'Unable to add member.');
    } finally {
      setAddingMember(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        {/* Page Header */}
        <div className="mb-8 animate-fadeInUp">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 section-heading">
                Group <span className="text-primary-dark">Hub</span>
              </h1>
              <p className="text-sm text-slate-500">
                Manage your trekking groups, send messages, and coordinate alerts.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="section-card-soft rounded-[32px] p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#00965E]" />
            <p className="text-slate-600">Loading your groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="section-card-soft rounded-[32px] border-dashed p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600 mb-4">No groups yet. Create or join a group from your dashboard.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Groups Sidebar */}
            <div className="section-card-soft rounded-[32px] p-6 h-fit shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 section-heading">Your groups</h2>
              <div className="space-y-3">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroup(group)}
                    className={`w-full text-left rounded-3xl border px-4 py-3 transition ${
                      selectedGroup?.id === group.id
                        ? 'border-[#00965E] bg-[#F0FBF6]'
                        : 'border-slate-200 bg-white hover:border-[#00965E]'
                    }`}
                  >
                    <p className="font-semibold text-slate-900 text-sm">{group.name}</p>
                    <p className="text-xs text-slate-500">{group.trek}</p>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mt-1">
                      {group.memberIds?.length || 0} members
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Group Content */}
            {selectedGroup && (
              <div className="space-y-6">
                {/* Header */}
                <div className="section-card-soft rounded-[32px] p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 section-heading">
                        {selectedGroup.name}
                      </h2>
                      <p className="text-sm text-slate-500">{selectedGroup.trek || 'Trek route not specified'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleLostAlert}
                        disabled={sendingLost}
                        className="inline-flex items-center gap-2 rounded-3xl bg-[#FDECEA] px-4 py-2 text-sm font-semibold text-[#B42318] transition hover:bg-[#FBD3C1] disabled:opacity-70"
                      >
                        <AlertTriangle className="h-4 w-4" /> Lost
                      </button>
                      <button
                        onClick={handleFoundReport}
                        disabled={sendingFound}
                        className="inline-flex items-center gap-2 rounded-3xl bg-[#EDF7FF] px-4 py-2 text-sm font-semibold text-[#1D4ED8] transition hover:bg-[#DCEEFF] disabled:opacity-70"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Found
                      </button>
                    </div>
                  </div>
                </div>

                {statusMessage && (
                  <div className="rounded-3xl bg-[#ECFDF5] px-4 py-3 text-sm text-[#1F7A32]">{statusMessage}</div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-200">
                  <button
                    onClick={() => setActiveTab('messages')}
                    className={`px-4 py-3 text-sm font-semibold border-b-2 transition ${
                      activeTab === 'messages'
                        ? 'border-[#00965E] text-[#00965E]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <MessageSquare className="inline h-4 w-4 mr-2" /> Messages
                  </button>
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className={`px-4 py-3 text-sm font-semibold border-b-2 transition ${
                      activeTab === 'alerts'
                        ? 'border-[#00965E] text-[#00965E]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <AlertTriangle className="inline h-4 w-4 mr-2" /> Alerts & Found
                  </button>
                </div>

                {/* Messages Tab */}
                {activeTab === 'messages' && (
                  <div className="section-card-soft rounded-[32px] p-6 shadow-sm space-y-4">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 max-h-96 overflow-y-auto">
                      {messages.length === 0 ? (
                        <p className="text-sm text-slate-500">No messages yet. Start the conversation!</p>
                      ) : (
                        <div className="space-y-3">
                          {messages.map((msg) => (
                            <div key={msg.id} className="rounded-3xl bg-white p-4 shadow-sm">
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <p className="font-semibold text-slate-900 text-sm">{msg.senderName}</p>
                                <span className="text-xs text-slate-400">
                                  {msg.createdAt
                                    ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    : 'Now'}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700">{msg.text}</p>
                              <LocationMapPreview text={msg.text} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type a message to your group..."
                        rows={3}
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#00965E] resize-none"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={sendingMessage || !messageText.trim()}
                        className="inline-flex items-center justify-center rounded-3xl bg-[#00965E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#007A44] disabled:opacity-70"
                      >
                        {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Alerts & Found Tab */}
                {activeTab === 'alerts' && (
                  <div className="rounded-[32px] border border-[#DDEBE2] bg-[#FBFDFB] p-6 shadow-sm">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 max-h-96 overflow-y-auto">
                      {alerts.length === 0 ? (
                        <p className="text-sm text-slate-500">No alerts or found reports yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {alerts.map((alert) => (
                            <div key={alert.id} className="rounded-3xl bg-white p-4 shadow-sm">
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div>
                                  <p className="font-semibold text-slate-900 text-sm">{alert.title}</p>
                                  <p className="text-xs text-slate-500">{alert.senderName}</p>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] font-semibold ${
                                  alert.type === 'group_lost_alert'
                                    ? 'bg-[#FDECEA] text-[#B42318]'
                                    : 'bg-[#EDF7FF] text-[#1D4ED8]'
                                }`}>
                                  {alert.type === 'group_lost_alert' ? 'Lost' : 'Found'}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 mb-2">{alert.message}</p>
                              <LocationMapPreview text={alert.message} />
                              <p className="text-xs text-slate-400">
                                {alert.createdAt
                                  ? new Date(alert.createdAt.seconds * 1000).toLocaleString()
                                  : 'Just now'}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="rounded-[32px] border border-[#DDEBE2] bg-[#FBFDFB] p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                    Add a member to this group
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto] mb-4">
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="Member email address"
                      className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#00965E]"
                    />
                    <button
                      onClick={handleAddMember}
                      disabled={addingMember || !newMemberEmail.trim()}
                      className="inline-flex items-center justify-center rounded-3xl bg-[#00965E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#007A44] disabled:opacity-70"
                    >
                      {addingMember ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                    </button>
                  </div>
                  {memberError && <p className="text-sm text-[#B42318] mb-4">{memberError}</p>}
                  <hr className="border-slate-200 my-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                    Group members
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {(selectedGroup.members || []).map((member) => (
                      <div key={`${member.email}-${member.uid || 'pending'}`} className="rounded-3xl border border-slate-200 bg-white p-4">
                        <p className="font-semibold text-slate-900">{member.name}</p>
                        <p className="text-sm text-slate-500">{member.email}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mt-2">
                          {member.role === 'owner' ? 'Owner' : member.uid ? 'Member' : 'Invited'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
