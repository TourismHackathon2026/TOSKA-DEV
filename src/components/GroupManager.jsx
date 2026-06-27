import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash, Users, Loader2, MessageSquareText, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GroupChat from './GroupChat';
import {
  createGroupInFirestore,
  getUserGroupsFromFirestore,
  deleteGroupInFirestore,
  getUserByEmail,
  findGroupByIdentifier,
  joinGroupInFirestore,
  leaveGroupInFirestore,
  createGroupMessageInFirestore,
  subscribeToGroupMessages,
  createGroupLostAlert,
  createGroupFoundReportInFirestore,
  subscribeToGroupNotifications,
} from '../utils/firebaseService';

const EMPTY_FORM = {
  name: '',
  trek: '',
  memberEmail: '',
  members: [],
};

export default function GroupManager() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeGroup, setActiveGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupAlerts, setGroupAlerts] = useState([]);
  const [chatText, setChatText] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [lostSending, setLostSending] = useState(false);
  const [foundSending, setFoundSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [activeGroupTab, setActiveGroupTab] = useState('overview');
  const [joinQuery, setJoinQuery] = useState('');
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    if (!user) return;
    refreshGroups();
  }, [user]);

  async function refreshGroups() {
    console.log('🔄 Refreshing groups...');
    setLoading(true);
    setError('');
    try {
      const data = await getUserGroupsFromFirestore(user?.email, user);
      console.log('✅ Groups loaded:', data.length);
      setGroups(data);
      if (data.length > 0 && !activeGroup) {
        setActiveGroup(data[0]);
      }
    } catch (err) {
      console.error('❌ Failed to load groups:', err);
      setError('Unable to load your groups. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!activeGroup?.id) {
      setGroupMessages([]);
      setGroupAlerts([]);
      setActiveGroupTab('overview');
      return undefined;
    }

    const unsubscribeMessages = subscribeToGroupMessages(activeGroup.id, setGroupMessages);
    const unsubscribeAlerts = subscribeToGroupNotifications(activeGroup.id, setGroupAlerts);
    return () => {
      unsubscribeMessages?.();
      unsubscribeAlerts?.();
    };
  }, [activeGroup?.id]);

  const handleJoinGroup = async () => {
    setJoinError('');
    if (!joinQuery.trim()) {
      setJoinError('Enter a group name or ID to join.');
      return;
    }

    try {
      const group = await findGroupByIdentifier(joinQuery.trim());
      if (!group) {
        setJoinError('No group found for that code or name.');
        return;
      }

      const joined = await joinGroupInFirestore(group.id, user);
      setActiveGroup(joined);
      setJoinQuery('');
      await refreshGroups();
    } catch (err) {
      console.error(err);
      setJoinError(err.message || 'Failed to join the group.');
    }
  };

  const handleLeaveGroup = async () => {
    if (!activeGroup?.id) return;
    if (!window.confirm('Leave this group?')) return;

    try {
      await leaveGroupInFirestore(activeGroup.id);
      setActiveGroup(null);
      setGroupMessages([]);
      await refreshGroups();
    } catch (err) {
      console.error(err);
      setError('Unable to leave the group.');
    }
  };

  const handleSendMessage = async () => {
    if (!activeGroup?.id || !chatText.trim()) return;
    setChatSending(true);
    try {
      await createGroupMessageInFirestore(activeGroup.id, chatText.trim());
      setChatText('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unable to send the message.');
    } finally {
      setChatSending(false);
    }
  };

  const handleLostAlert = async () => {
    if (!activeGroup?.id) return;
    setLostSending(true);
    setStatusMessage('');
    try {
      await createGroupLostAlert(activeGroup.id);
      setStatusMessage('Lost alert sent to your group members with live location details.');
    } catch (err) {
      console.error(err);
      setStatusMessage(err.message || 'Unable to send the lost alert.');
    } finally {
      setLostSending(false);
    }
  };

  const handleReportFound = async () => {
    if (!activeGroup?.id) return;
    setFoundSending(true);
    setStatusMessage('');
    try {
      await createGroupFoundReportInFirestore(activeGroup.id, 'Member found safe and accounted for.');
      await createGroupMessageInFirestore(activeGroup.id, `✅ Found report submitted with current information.`);
      setStatusMessage('Found report saved and shared with your group.');
    } catch (err) {
      console.error(err);
      setStatusMessage(err.message || 'Unable to send the found report.');
    } finally {
      setFoundSending(false);
    }
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddMember = async () => {
    setError('');
    const email = form.memberEmail.trim().toLowerCase();
    if (!email) {
      setError('Add a valid member email.');
      return;
    }
    if (form.members.some((member) => member.email === email)) {
      setError('This member is already added.');
      return;
    }

    try {
      const profile = await getUserByEmail(email);
      const member = profile
        ? { uid: profile.uid, email: profile.email, name: profile.name || email, role: 'member' }
        : { uid: null, email, name: email, role: 'member' };

      setForm((prev) => ({
        ...prev,
        members: [...prev.members, member],
        memberEmail: '',
      }));
    } catch (err) {
      console.error(err);
      setError('Unable to resolve this member email.');
    }
  };

  const handleRemoveMember = (email) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.filter((member) => member.email !== email),
    }));
  };

  const handleCreateGroup = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.name || !form.trek) {
      setError('Group name and trek are required.');
      return;
    }

    console.log('📦 Creating group:', form.name);
    setSaving(true);
    try {
      const createdGroup = await createGroupInFirestore({
        name: form.name,
        trek: form.trek,
        members: form.members,
      }, user);
      console.log('✅ Group created:', createdGroup.id);
      setGroups((prevGroups) => [createdGroup, ...prevGroups.filter((group) => group.id !== createdGroup.id)]);
      setActiveGroup(createdGroup);
      setForm(EMPTY_FORM);
      await refreshGroups();
    } catch (err) {
      console.error('❌ Error creating group:', err);
      setError(err.message || 'Unable to create group. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Delete this group?')) return;
    try {
      await deleteGroupInFirestore(groupId);
      refreshGroups();
    } catch (err) {
      console.error(err);
      setError('Unable to remove group.');
    }
  };

  return (
    <div className="rounded-[32px] border border-[#DDEBE2] bg-[#FBFDFB] p-6 shadow-[0_16px_60px_rgba(0,0,0,0.04)] animate-fadeInUp">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
            Group Panel
          </h2>
          <p className="text-sm text-slate-500">
            Create trek groups, invite teammates, chat in-app, and trigger a lost alert when someone needs help.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
          <Users className="h-4 w-4" /> {groups.length} group{groups.length !== 1 ? 's' : ''}
        </div>
      </div>

      <form onSubmit={handleCreateGroup} className="space-y-4">
        {(error || joinError) && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error || joinError}
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Group name</span>
            <input
              value={form.name}
              onChange={(event) => handleFormChange('name', event.target.value)}
              placeholder="Example: Annapurna Team A"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Trek route</span>
            <input
              value={form.trek}
              onChange={(event) => handleFormChange('trek', event.target.value)}
              placeholder="Example: Everest Base Camp"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-end">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Add member by email</span>
            <input
              value={form.memberEmail}
              onChange={(event) => handleFormChange('memberEmail', event.target.value)}
              placeholder="member@example.com"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary"
            />
          </label>
          <button
            type="button"
            onClick={handleAddMember}
            className="inline-flex items-center justify-center gap-2 rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#007A44]"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        {form.members.length > 0 && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">Group members</div>
            <div className="space-y-2">
              {form.members.map((member) => (
                <div key={member.email} className="flex items-center justify-between gap-3 rounded-3xl bg-white p-3 shadow-sm">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.email)}
                    className="rounded-2xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-600 transition hover:bg-red-50"
                  >
                    <Trash className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-3xl bg-[#00965E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#007A44] disabled:opacity-70"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create group'}
        </button>
      </form>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Join an existing group</div>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-end">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Group name or code</span>
            <input
              value={joinQuery}
              onChange={(event) => setJoinQuery(event.target.value)}
              placeholder="Enter group name or code"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary"
            />
          </label>
          <button
            type="button"
            onClick={handleJoinGroup}
            className="inline-flex items-center justify-center gap-2 rounded-3xl bg-[#00965E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#007A44]"
          >
            Join Group
          </button>
        </div>
        {activeGroup && (
          <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Active group:</p>
                <p className="text-base text-slate-700">{activeGroup.name}</p>
                <p className="text-xs text-slate-500">Trek: {activeGroup.trek}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveGroupTab('overview')}
                  className={`rounded-3xl px-3 py-2 text-sm font-semibold transition ${activeGroupTab === 'overview' ? 'bg-[#00965E] text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGroupTab('chat')}
                  className={`rounded-3xl px-3 py-2 text-sm font-semibold transition ${activeGroupTab === 'chat' ? 'bg-[#00965E] text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  Chat & Alerts
                </button>
                <button
                  type="button"
                  onClick={handleLeaveGroup}
                  className="rounded-3xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Leave Group
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {activeGroup && activeGroupTab === 'overview' && (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <MessageSquareText className="h-4 w-4 text-[#00965E]" />
            Group overview
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(activeGroup.members || []).map((member) => (
              <div key={member.email || member.uid} className="rounded-2xl bg-white p-3 text-sm text-slate-700 shadow-sm">
                <p className="font-semibold text-slate-900">{member.name || member.email}</p>
                <p className="text-xs text-slate-500">{member.email}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeGroup && activeGroupTab === 'chat' && (
        <GroupChat
          group={activeGroup}
          messages={groupMessages}
          newMessage={chatText}
          onMessageChange={setChatText}
          onSendMessage={handleSendMessage}
          onLostAlert={handleLostAlert}
          sending={chatSending}
          lostSending={lostSending}
          statusMessage={statusMessage}
          error={error}
        />
      )}

      <div className="mt-8">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Your groups</h3>
        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Loading groups…
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            No groups yet. Create your first trek team above.
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                  <div>
                    <p className="text-base font-bold text-slate-900">{group.name}</p>
                    <p className="text-sm text-slate-600">Trek: {group.trek}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mt-1">Members: {group.memberEmails?.length ?? group.members?.length}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteGroup(group.id)}
                    className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <Trash className="h-4 w-4" /> Delete
                  </button>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {(group.members || group.memberEmails || []).map((member) => (
                    <div key={member.email || member.uid || member} className="rounded-2xl bg-white p-3 text-sm text-slate-700 shadow-sm">
                      <p className="font-semibold text-slate-900">{member.name || member.email || member}</p>
                      <p className="text-xs text-slate-500">{member.email || member.uid || ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
