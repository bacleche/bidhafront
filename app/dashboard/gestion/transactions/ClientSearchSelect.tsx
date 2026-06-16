'use client';
import { useState, useEffect, useRef } from 'react';
import { api, endpoints } from '@/lib/api';
import { Search, X, Loader2, UserCircle } from 'lucide-react';
import type { ClientRecord } from '@/types';

interface Props {
  value: number | null;
  onChange: (clientId: number | null, client?: ClientRecord | null) => void;
  error?: string;
}

export function ClientSearchSelect({ value, onChange, error }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ClientRecord[]>([]);
  const [selected, setSelected] = useState<ClientRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fermer dropdown au clic extérieur
  useEffect(() => {
  const handler = (e: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };
  // ← "mousedown" est bien, mais assure-toi que les boutons de la liste
  // utilisent onMouseDown avec e.preventDefault() pour éviter le blur
  document.addEventListener('mousedown', handler);
  return () => document.removeEventListener('mousedown', handler);
}, []);


  // Recherche avec debounce
  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`${endpoints.clients}?search=${encodeURIComponent(query)}`);
        const list: ClientRecord[] = data.results || (Array.isArray(data) ? data : []);
        // const list: ClientRecord[] = data.results || (Array.isArray(data) ? data : []);
console.log('API response:', data);
console.log('List:', list);
setResults(list);
setOpen(list.length > 0);
        setResults(list);
        setOpen(list.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  

  // const select = (c: ClientRecord) => {
  //   setSelected(c);
  //   setQuery(c.full_name || `${c.first_name} ${c.last_name}`.trim());
  //   setOpen(false);
  //   onChange(c.id, c);
  // };

  const select = (c: ClientRecord) => {
  console.log('select() called with:', c);
  setSelected(c);
  setQuery(c.full_name || `${c.first_name} ${c.last_name}`.trim());
  setOpen(false);
  onChange(c.id, c);
  console.log('onChange called with id:', c.id);
};

  const clear = () => {
    setSelected(null);
    setQuery('');
    setResults([]);
    onChange(null, null);
  };

  const initials = (c: ClientRecord) => {
    const f = c.first_name?.[0] ?? '';
    const l = c.last_name?.[0] ?? '';
    return (f + l).toUpperCase() || c.email?.[0]?.toUpperCase() || 'C';
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        Client <span className="text-red-500">*</span>
      </label>

      {/* Input */}
      <div className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 bg-white transition-all ${
        error  ? 'border-red-300 ring-1 ring-red-300' :
        open   ? 'border-blue-400 ring-2 ring-blue-100' :
                 'border-gray-200 hover:border-gray-300'
      }`}>
        {loading
          ? <Loader2 size={15} className="text-gray-400 shrink-0 animate-spin" />
          : <Search size={15} className="text-gray-400 shrink-0" />
        }
        <input
          type="text"
          placeholder="Tapez un nom, email ou téléphone..."
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            if (selected) { setSelected(null); onChange(null, null); }
          }}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          className="flex-1 text-sm bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
        />
        {selected && (
          <button type="button" onClick={clear} className="text-gray-400 hover:text-gray-600 shrink-0">
            <X size={14} />
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* Client sélectionné */}
      {selected && (
        <div className="mt-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials(selected)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-blue-900">
              {selected.full_name || `${selected.first_name} ${selected.last_name}`}
            </p>
            <p className="text-xs text-blue-500 truncate">
              {selected.email}{selected.phone ? ` · ${selected.phone}` : ''}
            </p>
          </div>
          <span className="text-xs bg-blue-200 text-blue-700 font-bold px-2 py-0.5 rounded-full shrink-0">
            Sélectionné
          </span>
        </div>
      )}

      {/* Dropdown résultats */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          {results.length === 0 ? (
            <div className="px-4 py-5 text-sm text-gray-400 text-center">
              <UserCircle size={24} className="mx-auto mb-1.5 opacity-30" />
              Aucun client trouvé pour &quot;{query}&quot;
            </div>
          ) : (
            <ul className="max-h-60 overflow-y-auto divide-y divide-gray-50">
              {results.map(c => (
                <li key={c.id}>
                  <button
                    type="button"
                     onMouseDown={(e) => e.preventDefault()}
                    onClick={() => select(c)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0">
                      {initials(c)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {c.full_name || `${c.first_name} ${c.last_name}`.trim()}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {c.email && <span>{c.email}</span>}
                        {c.phone && <span> · {c.phone}</span>}
                        {c.client_type && (
                          <span className="ml-1 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                            {c.client_type === 'individual' ? 'Particulier' : 'Entreprise'}
                          </span>
                        )}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}