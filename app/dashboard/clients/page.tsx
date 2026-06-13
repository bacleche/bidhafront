'use client';
import { useEffect, useState, useRef } from 'react';
import { api, endpoints } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  MessageCircle, CalendarCheck, AlertTriangle, Home,
  Clock, CheckCircle, XCircle, RefreshCw, Send, Loader2,
  ArrowLeft, Calendar, ChevronRight
} from 'lucide-react';

const VISIT_STATUS: Record<string, { label: string; color: string; icon: any }> = {
  pending:     { label: 'En attente',    color: 'bg-amber-100 text-amber-700',    icon: Clock },
  accepted:    { label: 'Acceptée',      color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  rescheduled: { label: 'Reprogrammée', color: 'bg-blue-100 text-blue-700',      icon: RefreshCw },
  rejected:    { label: 'Rejetée',       color: 'bg-red-100 text-red-600',        icon: XCircle },
  done:        { label: 'Effectuée',     color: 'bg-gray-100 text-gray-500',      icon: CheckCircle },
};

const COMPLAINT_STATUS: Record<string, { label: string; color: string }> = {
  open:        { label: 'Ouverte',       color: 'bg-red-100 text-red-600' },
  in_progress: { label: 'En traitement', color: 'bg-amber-100 text-amber-700' },
  resolved:    { label: 'Résolue',       color: 'bg-emerald-100 text-emerald-700' },
  closed:      { label: 'Clôturée',      color: 'bg-gray-100 text-gray-500' },
};

type Tab = 'contacts' | 'visits' | 'complaints';

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('contacts');
  const [contacts, setContacts] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Conversation ouverte (vue mobile-first)
  const [openConversation, setOpenConversation] = useState<any | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      api.get(endpoints.contactRequests),
      api.get(endpoints.visitRequests),
      api.get(endpoints.complaints),
    ]).then(([c, v, pl]) => {
      const contactList = c.data.results || c.data;
      setContacts(contactList);
      setVisits(v.data.results || v.data);
      setComplaints(pl.data.results || pl.data);
      // Refresh conversation ouverte
      if (openConversation) {
        const updated = contactList.find((x: any) => x.id === openConversation.id);
        if (updated) setOpenConversation(updated);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [openConversation?.messages?.length]);

  const openChat = (c: any) => {
    setOpenConversation(c);
    setReply('');
  };

  const handleSend = async () => {
    if (!reply.trim() || !openConversation) return;
    setSending(true);
    try {
      await api.post(`${endpoints.contactRequests}${openConversation.id}/reply/`, { content: reply });
      setReply('');
      fetchAll();
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const tabs: { key: Tab; label: string; icon: any; count: number; badge?: number }[] = [
    {
      key: 'contacts', label: 'Messages', icon: MessageCircle, count: contacts.length,
      badge: contacts.filter(c => c.status === 'replied').length,
    },
    { key: 'visits',     label: 'Visites',  icon: CalendarCheck, count: visits.length },
    { key: 'complaints', label: 'Plaintes', icon: AlertTriangle,  count: complaints.length },
  ];

  // ── VUE CONVERSATION OUVERTE ──
  if (openConversation) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-3.5 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setOpenConversation(null)}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {openConversation.agent_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || 'AG'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-gray-900">{openConversation.agent_name || 'Agent'}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
              <Home size={10} /> {openConversation.property_title}
            </p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
            openConversation.status === 'replied'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {openConversation.status === 'replied' ? 'Répondu' : 'En attente'}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {openConversation.messages?.map((msg: any) => {
            const isMe = msg.sender === openConversation.client;
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {openConversation.agent_name?.[0] || 'A'}
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
                }`}>
                  <p className={`text-xs font-semibold mb-1 ${isMe ? 'text-blue-200' : 'text-blue-500'}`}>
                    {msg.sender_name}
                  </p>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={`text-xs mt-1.5 ${isMe ? 'text-blue-300' : 'text-gray-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {isMe && (
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-100 px-4 py-3 shrink-0">
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <textarea
                rows={2}
                placeholder="Votre message..."
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                className="w-full bg-transparent text-sm text-gray-800 resize-none focus:outline-none placeholder-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1">Entrée pour envoyer</p>
            </div>
            <button
              onClick={handleSend}
              disabled={sending || !reply.trim()}
              className="w-11 h-11 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 transition-all shrink-0 shadow-md shadow-blue-200"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── VUE PRINCIPALE ──
  return (
    <div className="p-5 max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div>
        <h1 className="font-bold text-2xl text-gray-900">Mon espace</h1>
        <p className="text-sm text-gray-500 mt-0.5">Bonjour {user?.first_name} — suivez toutes vos demandes ici.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {tabs.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-2xl border p-4 text-center transition-all ${
              tab === key
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-white border-gray-100 text-gray-700 hover:border-blue-200'
            }`}
          >
            <Icon size={20} className={`mx-auto mb-1.5 ${tab === key ? 'text-blue-200' : 'text-blue-500'}`} />
            <p className={`font-bold text-2xl ${tab === key ? 'text-white' : 'text-gray-900'}`}>{count}</p>
            <p className={`text-xs mt-0.5 ${tab === key ? 'text-blue-200' : 'text-gray-500'}`}>{label}</p>
          </button>
        ))}
      </div>

      {/* Tabs nav */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1">
        {tabs.map(({ key, label, icon: Icon, badge }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === key ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={14} />
            <span>{label}</span>
            {badge && badge > 0 ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            ) : null}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* ── MESSAGES ── */}
          {tab === 'contacts' && (
            contacts.length === 0 ? (
              <Empty icon={MessageCircle} text="Aucun message envoyé" sub="Contactez un agent depuis la page d'un bien." />
            ) : (
              <div className="space-y-2">
                {contacts.map(c => {
                  const lastMsg = c.messages?.[c.messages.length - 1];
                  const hasReply = c.status === 'replied';
                  const unreadReply = hasReply && lastMsg?.sender !== c.client;
                  return (
                    <button
                      key={c.id}
                      onClick={() => openChat(c)}
                      className="w-full text-left bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm hover:border-blue-200 hover:shadow-md transition-all"
                    >
                      {/* Avatar agent */}
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        unreadReply ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {c.agent_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || 'AG'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm truncate ${unreadReply ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                            {c.agent_name || 'Agent'}
                          </p>
                          <span className="text-xs text-gray-400 shrink-0">
                            {lastMsg
                              ? new Date(lastMsg.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                              : new Date(c.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                            }
                          </span>
                        </div>
                        <p className="text-xs text-blue-500 flex items-center gap-1 truncate mt-0.5">
                          <Home size={10} /> {c.property_title}
                        </p>
                        {lastMsg && (
                          <p className={`text-xs mt-0.5 truncate ${unreadReply ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                            {lastMsg.sender_name} : {lastMsg.content}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {unreadReply && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                        <ChevronRight size={16} className="text-gray-300" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          )}

          {/* ── VISITES ── */}
          {tab === 'visits' && (
            visits.length === 0 ? (
              <Empty icon={CalendarCheck} text="Aucune visite demandée" sub="Planifiez une visite depuis la page d'un bien." />
            ) : (
              <div className="space-y-3">
                {visits.map(v => {
                  const sc = VISIT_STATUS[v.status];
                  const StatusIcon = sc.icon;
                  const date = v.rescheduled_date || v.requested_date;
                  return (
                    <div key={v.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                      {/* Bande statut */}
                      <div className={`px-4 py-2 flex items-center justify-between ${sc.color.split(' ')[0]}`}>
                        <span className={`flex items-center gap-1.5 text-xs font-bold ${sc.color.split(' ')[1]}`}>
                          <StatusIcon size={12} /> {sc.label}
                        </span>
                        <span className={`text-xs ${sc.color.split(' ')[1]}`}>
                          {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <p className="font-semibold text-sm text-gray-900">{v.property_title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar size={12} />
                          {new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {v.agent_name && <span className="text-gray-300">·</span>}
                          {v.agent_name && <span>Agent : {v.agent_name}</span>}
                        </div>

                        {v.rescheduled_date && (
                          <div className="flex items-center gap-1.5 bg-blue-50 rounded-xl px-3 py-2 text-xs text-blue-700 font-medium">
                            <RefreshCw size={11} />
                            Reprogrammée au {new Date(v.rescheduled_date).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                        )}

                        {v.agent_notes && (
                          <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-600 italic">
                            "{v.agent_notes}"
                          </div>
                        )}

                        {v.notes && (
                          <p className="text-xs text-gray-400">Votre note : {v.notes}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* ── PLAINTES ── */}
          {tab === 'complaints' && (
            complaints.length === 0 ? (
              <Empty icon={AlertTriangle} text="Aucune plainte soumise" sub="Signalez un problème depuis la page d'un bien." />
            ) : (
              <div className="space-y-3">
                {complaints.map(c => {
                  const sc = COMPLAINT_STATUS[c.status];
                  return (
                    <div key={c.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                      <div className={`px-4 py-2 flex items-center justify-between ${sc.color.split(' ')[0]}`}>
                        <span className={`text-xs font-bold ${sc.color.split(' ')[1]}`}>{sc.label}</span>
                        <span className={`text-xs ${sc.color.split(' ')[1]}`}>
                          {new Date(c.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <p className="font-semibold text-sm text-gray-900">{c.subject}</p>
                        <p className="text-xs text-gray-500 leading-relaxed">{c.description}</p>
                        {c.property_title && (
                          <p className="text-xs text-blue-500 flex items-center gap-1">
                            <Home size={10} /> {c.property_title}
                          </p>
                        )}
                        {c.owner_response && (
                          <div className="mt-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                            <p className="text-xs font-bold text-emerald-700 mb-1">Réponse de l'agence</p>
                            <p className="text-xs text-emerald-800 leading-relaxed">{c.owner_response}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}

function Empty({ icon: Icon, text, sub }: { icon: any; text: string; sub: string }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <Icon size={40} className="mx-auto mb-3 opacity-20" />
      <p className="font-medium text-gray-500">{text}</p>
      <p className="text-sm mt-1">{sub}</p>
    </div>
  );
}