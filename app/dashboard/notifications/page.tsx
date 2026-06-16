'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { api, endpoints } from '@/lib/api';
import { Bell, CheckCheck, Loader2, MessageCircle, CalendarCheck, AlertTriangle, Star, FileText, RefreshCw, Info, X } from 'lucide-react';

const NOTIF_ICONS: Record<string, any> = {
  contact:    { icon: MessageCircle, color: 'bg-blue-100 text-blue-600' },
  message:    { icon: MessageCircle, color: 'bg-blue-100 text-blue-600' },
  visit:      { icon: CalendarCheck, color: 'bg-emerald-100 text-emerald-600' },
  complaint:  { icon: AlertTriangle, color: 'bg-red-100 text-red-500' },
  review:     { icon: Star,          color: 'bg-amber-100 text-amber-500' },
  contract:   { icon: FileText,      color: 'bg-purple-100 text-purple-600' },
  transaction:{ icon: FileText,      color: 'bg-purple-100 text-purple-600' },
};

function getIconConfig(type: string) {
  for (const key of Object.keys(NOTIF_ICONS)) {
    if (type?.toLowerCase().includes(key)) return NOTIF_ICONS[key];
  }
  return { icon: Info, color: 'bg-gray-100 text-gray-500' };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'À l\'instant';
  if (mins < 60) return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Il y a ${days}j`;
}

function NotifModal({ notif, onClose }: { notif: any; onClose: () => void }) {
  const cfg = getIconConfig(notif.notification_type || notif.category || '');
  const Icon = cfg.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-snug">{notif.title}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(notif.created_at)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-5">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {notif.message}
          </p>

          {/* Meta */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>
              {new Date(notif.created_at).toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </span>
            {notif.is_read
              ? <span className="flex items-center gap-1 text-emerald-500"><CheckCheck size={12} /> Lu</span>
              : <span className="flex items-center gap-1 text-blue-500"><Bell size={12} /> Non lu</span>
            }
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold text-gray-600 transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  const fetchNotifications = () => {
    setLoading(true);
    api.get(endpoints.notifications)
      .then(r => {
        const data = r.data.results ?? (Array.isArray(r.data) ? r.data : []);
        setNotifications(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const openNotif = async (n: any) => {
    setSelected(n);
    if (!n.is_read) {
      await api.post(`${endpoints.notifications}${n.id}/mark_read/`).catch(() => {});
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    await api.post(`${endpoints.notifications}mark_all_read/`).catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setMarkingAll(false);
  };

  const unread = notifications.filter(n => !n.is_read);
  const read   = notifications.filter(n => n.is_read);

  const NotifCard = ({ n }: { n: any }) => {
    const cfg = getIconConfig(n.notification_type || n.category || '');
    const Icon = cfg.icon;
    const isUnread = !n.is_read;

    return (
      <div
        onClick={() => openNotif(n)}
        className={`flex items-start gap-3 bg-white rounded-2xl p-4 border cursor-pointer hover:shadow-md transition-all group ${
          isUnread ? 'border-blue-100 shadow-sm hover:border-blue-200' : 'border-gray-100 opacity-70'
        }`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.color} ${!isUnread ? 'opacity-60' : ''}`}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-snug ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
            {n.title}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">
            {n.message}
          </p>
          <p className={`text-[10px] font-medium mt-1.5 ${isUnread ? 'text-blue-400' : 'text-gray-300'}`}>
            {timeAgo(n.created_at)}
          </p>
        </div>
        {isUnread
          ? <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
          : <CheckCheck size={14} className="text-gray-300 mt-1 shrink-0" />
        }
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md">
              <Bell size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-gray-900">Notifications</h1>
              <p className="text-xs text-gray-400">
                {unread.length > 0 ? `${unread.length} non lue${unread.length > 1 ? 's' : ''}` : 'Tout est lu'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchNotifications} className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all">
              <RefreshCw size={15} />
            </button>
            {unread.length > 0 && (
              <button onClick={markAllRead} disabled={markingAll} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all">
                {markingAll ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
                Tout marquer lu
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Bell size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Aucune notification pour le moment</p>
            <p className="text-xs text-gray-400 mt-1">Vos nouvelles notifications apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-6">
            {unread.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Non lues</p>
                <div className="space-y-2">
                  {unread.map(n => <NotifCard key={n.id} n={n} />)}
                </div>
              </div>
            )}
            {read.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Lues</p>
                <div className="space-y-2">
                  {read.map(n => <NotifCard key={n.id} n={n} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>


      {selected && (
        <NotifModal notif={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}