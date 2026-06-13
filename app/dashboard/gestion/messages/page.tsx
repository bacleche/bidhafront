'use client';
import { useEffect, useState, useRef } from 'react';
import { api, endpoints } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { MessageCircle, Send, Loader2, Home, Clock, CheckCircle, Search, Circle } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Non lu',   color: 'bg-amber-100 text-amber-700' },
  read:     { label: 'Lu',       color: 'bg-gray-100 text-gray-500' },
  replied:  { label: 'Répondu',  color: 'bg-emerald-100 text-emerald-700' },
  closed:   { label: 'Clôturé', color: 'bg-gray-100 text-gray-400' },
};

export default function AgentMessagesPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchContacts = async () => {
    try {
      const { data } = await api.get(endpoints.contactRequests);
      const list: any[] = data.results || data;
      setContacts(list);
      // Refresh la conversation ouverte
      if (selected) {
        const updated = list.find((c: any) => c.id === selected.id);
        if (updated) setSelected(updated);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected?.messages?.length]);

  const selectConversation = async (c: any) => {
    setSelected(c);
    setReply('');
    if (c.status === 'pending') {
      await api.patch(`${endpoints.contactRequests}${c.id}/mark_read/`, {});
      fetchContacts();
    }
  };

  const handleSend = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      await api.post(`${endpoints.contactRequests}${selected.id}/reply/`, { content: reply });
      setReply('');
      fetchContacts();
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const filteredContacts = contacts.filter(c =>
    c.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.property_title?.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = contacts.filter(c => c.status === 'pending').length;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">

      {/* ── SIDEBAR CONVERSATIONS ── */}
      <aside className="w-80 shrink-0 bg-white border-r border-gray-100 flex flex-col">

        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-bold text-lg text-gray-900">Messages</h1>
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {/* Recherche */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Chercher un client, un bien..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-3 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <MessageCircle size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">{search ? 'Aucun résultat' : 'Aucune conversation'}</p>
            </div>
          ) : filteredContacts.map(c => {
            const isSelected = selected?.id === c.id;
            const isUnread = c.status === 'pending';
            const lastMsg = c.messages?.[c.messages.length - 1];

            return (
              <button
                key={c.id}
                onClick={() => selectConversation(c)}
                className={`w-full text-left px-4 py-3.5 border-b border-gray-50 transition-colors ${
                  isSelected
                    ? 'bg-blue-50 border-l-[3px] border-l-blue-500'
                    : 'hover:bg-gray-50 border-l-[3px] border-l-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar initiales */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isUnread ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {c.client_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-sm truncate ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {c.client_name}
                      </p>
                      <span className="text-xs text-gray-400 shrink-0">
                        {lastMsg
                          ? new Date(lastMsg.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                          : new Date(c.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                        }
                      </span>
                    </div>
                    <p className="text-xs text-blue-500 truncate flex items-center gap-1 mt-0.5">
                      <Home size={10} className="shrink-0" />
                      {c.property_title}
                    </p>
                    {lastMsg && (
                      <p className={`text-xs mt-0.5 truncate ${isUnread ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                        {lastMsg.content}
                      </p>
                    )}
                  </div>

                  {isUnread && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── ZONE CONVERSATION ── */}
      {selected ? (
        <div className="flex-1 flex flex-col min-w-0">

          {/* Header conversation */}
          <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                {selected.client_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <p className="font-bold text-gray-900">{selected.client_name}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Home size={11} />
                  {selected.property_title}
                </p>
              </div>
            </div>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${STATUS_CONFIG[selected.status]?.color}`}>
              {STATUS_CONFIG[selected.status]?.label}
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
            {selected.messages?.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">Aucun message dans cette conversation.</div>
            )}
            {selected.messages?.map((msg: any) => {
              // isMe = l'agent est celui qui a envoyé ce message (pas le client)
              const isMe = msg.sender !== selected.client;
              return (
                <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && (
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0 mb-1">
                      {selected.client_name?.[0]}
                    </div>
                  )}
                  <div className={`max-w-sm lg:max-w-md rounded-2xl px-4 py-3 ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
                  }`}>
                    <p className={`text-xs font-semibold mb-1 ${isMe ? 'text-blue-200' : 'text-blue-500'}`}>
                      {msg.sender_name}
                    </p>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className={`text-xs mt-2 ${isMe ? 'text-blue-300' : 'text-gray-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {isMe && (
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mb-1">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Zone de saisie */}
          <div className="bg-white border-t border-gray-100 px-6 py-4 shrink-0">
            <div className="flex items-end gap-3">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                <textarea
                  rows={2}
                  placeholder="Écrivez votre réponse..."
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="w-full bg-transparent text-sm text-gray-800 resize-none focus:outline-none placeholder-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">Entrée pour envoyer · Maj+Entrée pour sauter une ligne</p>
              </div>
              <button
                onClick={handleSend}
                disabled={sending || !reply.trim()}
                className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 shadow-md shadow-blue-200"
              >
                {sending
                  ? <Loader2 size={17} className="animate-spin" />
                  : <Send size={17} />
                }
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* État vide */
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
          <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center mb-4">
            <MessageCircle size={36} className="text-blue-300" />
          </div>
          <p className="font-semibold text-gray-600">Aucune conversation sélectionnée</p>
          <p className="text-sm mt-1">Choisissez une conversation dans la liste</p>
        </div>
      )}
    </div>
  );
}