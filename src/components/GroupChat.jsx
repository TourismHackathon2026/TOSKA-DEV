import { Send, AlertTriangle } from 'lucide-react';
import LocationMapPreview from './LocationMapPreview';

export default function GroupChat({ group, messages, newMessage, onMessageChange, onSendMessage, onLostAlert, sending, lostSending, statusMessage, error }) {
  return (
    <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm animate-fadeInUp">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
            Group Chat
          </h2>
          <p className="text-sm text-slate-500">Send messages to your trekking team and keep everyone coordinated.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-3xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
            {group ? `Active: ${group.name}` : 'Join a group to chat'}
          </div>
          {group && (
            <button
              type="button"
              onClick={onLostAlert}
              disabled={lostSending}
              className="inline-flex items-center gap-2 rounded-3xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-70"
            >
              <AlertTriangle className="h-4 w-4" />
              {lostSending ? 'Sending…' : 'Lost'}
            </button>
          )}
        </div>
      </div>

      {group ? (
        <>
          <div className="space-y-3 max-h-72 overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50 p-4">
            {messages.length === 0 ? (
              <div className="text-sm text-slate-500">No messages yet. Start the conversation with your team.</div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="rounded-3xl bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900 text-sm">{message.senderName}</p>
                    <span className="text-[10px] text-slate-400">
                      {message.createdAt ? new Date(message.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{message.text}</p>
                  <LocationMapPreview text={message.text} />
                </div>
              ))
            )}
          </div>

          {statusMessage && <p className="mt-3 rounded-2xl bg-[#ECFDF5] px-3 py-2 text-sm text-[#2E7D32]">{statusMessage}</p>}

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <textarea
              value={newMessage}
              onChange={(event) => onMessageChange(event.target.value)}
              rows={3}
              placeholder="Type your message to the group..."
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary resize-none"
            />
            <button
              type="button"
              onClick={onSendMessage}
              disabled={sending || !newMessage.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-3xl bg-[#00965E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#007A44] disabled:opacity-70"
            >
              <Send className="h-4 w-4" /> Send
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
          Join a group to use in-app messaging with your team.
        </div>
      )}
    </div>
  );
}
