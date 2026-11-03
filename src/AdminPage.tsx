import { useEffect, useState, type FormEvent } from 'react';
import { Copy, Link as LinkIcon, MessageSquareText, CheckCircle } from 'lucide-react';
import { PREFIXES, type Prefix, WEDDING, buildDisplayName } from './config';

function buildMessage(displayName: string, link: string) {
  return `Dear ${displayName} ❤️

With joyful hearts, we warmly invite you to celebrate one of the most special days of our lives as we begin our journey together.

Please view our wedding invitation and all the event details through the link below 🌐:

${link}

Your presence would truly mean the world to us, and we would be honored to celebrate this beautiful moment together.

With love,
❤️ ${WEDDING.groomName} & ${WEDDING.brideName}`;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers / non-secure contexts
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }
}

export function AdminPage() {
  const [prefix, setPrefix] = useState<Prefix>('Mr.');
  const [guestName, setGuestName] = useState('');
  const [result, setResult] = useState<{ displayName: string; link: string; message: string } | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    document.title = `Invitation Links · ${WEDDING.brideName} & ${WEDDING.groomName}`;
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 2000);
    return () => clearTimeout(t);
  }, [notice]);

  const handleGenerate = (e?: FormEvent) => {
    e?.preventDefault();
    const displayName = buildDisplayName(prefix, guestName);
    if (!displayName) return;
    const link = `${window.location.origin}/${encodeURIComponent(displayName)}`;
    setResult({ displayName, link, message: buildMessage(displayName, link) });
  };

  const handleCopy = async (text: string, label: string) => {
    setNotice((await copyText(text)) ? label : 'Copy failed — please copy manually');
  };

  const inputCls =
    'w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-brand-beige-deep/40 focus:border-brand-beige-deep outline-none bg-white text-stone-800';

  return (
    <div className="min-h-screen bg-brand-ivory py-10 px-4 font-sans text-stone-800">
      <div className="mx-auto w-full max-w-lg bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-semibold text-stone-800">Invitation Link Generator</h1>
          <p className="text-stone-500 text-sm mt-1">
            {WEDDING.brideName} &amp; {WEDDING.groomName} · {WEDDING.dateLong}
          </p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5">
          <div>
            <label htmlFor="prefix" className="block text-sm font-medium mb-1">Select Prefix</label>
            <select
              id="prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value as Prefix)}
              className={inputCls}
            >
              {PREFIXES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="guestName" className="block text-sm font-medium mb-1">Guest Name</label>
            <input
              id="guestName"
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Sanjaya"
              autoComplete="off"
              className={inputCls}
            />
          </div>

          <button
            type="submit"
            disabled={!guestName.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand-beige-deep text-white font-semibold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <LinkIcon className="w-5 h-5" /> Generate Link
          </button>
        </form>

        {result && (
          <div className="mt-8 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-stone-500 mb-1">Generated Link</p>
              <input
                readOnly
                value={result.link}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full px-3 py-2 text-sm rounded-md border border-stone-200 bg-stone-50 text-stone-700"
              />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-stone-500 mb-1">Website Greeting</p>
              <p className="text-sm italic text-stone-700 bg-stone-50 border border-stone-200 rounded-md px-3 py-2">
                We cordially invite <strong className="not-italic">{result.displayName}</strong> to celebrate our special day with us.
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-stone-500 mb-1">Message Preview</p>
              <pre className="whitespace-pre-wrap break-words text-sm font-sans text-stone-700 bg-stone-50 border border-stone-200 rounded-md px-3 py-3 max-h-80 overflow-auto">
                {result.message}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            disabled={!result}
            onClick={() => result && handleCopy(result.link, 'Link copied!')}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-brand-beige-deep text-brand-beige-deep font-semibold hover:bg-brand-beige-deep/5 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Copy className="w-4 h-4" /> Copy Link Only
          </button>
          <button
            type="button"
            disabled={!result}
            onClick={() => result && handleCopy(result.message, 'Message copied!')}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#25D366] text-white font-semibold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <MessageSquareText className="w-4 h-4" /> Copy Full Message
          </button>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-stone-900 text-white text-sm px-4 py-2 rounded-full shadow-lg"
        >
          <CheckCircle className="w-4 h-4 text-green-400" /> {notice}
        </div>
      )}
    </div>
  );
}
