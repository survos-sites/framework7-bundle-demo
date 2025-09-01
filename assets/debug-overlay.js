// assets/debug-overlay.js
(function () {
    // Only enable if ?debug=1 or localStorage flag
    const url = new URL(window.location.href);
    const enabled = url.searchParams.get('debug') === '1' || localStorage.getItem('debugOverlay') === '1';
    if (!enabled) return;

    // Styles + container
    const style = document.createElement('style');
    style.textContent = `
    #__dbg {
      position: fixed; bottom: 0; left: 0; right: 0; max-height: 35vh; z-index: 2147483647;
      background: rgba(20,20,20,.95); color: #eee; font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      box-shadow: 0 -4px 16px rgba(0,0,0,.35); display: flex; flex-direction: column; border-top: 1px solid #444;
    }
    #__dbg_hdr {
      display: flex; gap: 8px; align-items: center; padding: 6px 8px; border-bottom: 1px solid #444;
      user-select: none; -webkit-user-select: none; cursor: default;
    }
    #__dbg_hdr b { margin-right: auto; }
    #__dbg_btn { padding: 2px 6px; border: 1px solid #666; background: #222; color: #ddd; border-radius: 4px; }
    #__dbg_btn:hover { background: #2a2a2a; }
    #__dbg_log {
      overflow: auto; padding: 6px 8px; white-space: pre-wrap; word-break: break-word; flex: 1;
    }
    .__dbg-row { padding: 2px 0; }
    .__dbg-log  { color: #d0d0d0; }
    .__dbg-info { color: #9ecbff; }
    .__dbg-warn { color: #ffd479; }
    .__dbg-err  { color: #ff7b72; }
    #__dbg.collapsed #__dbg_log { display: none; }
  `;
    document.documentElement.appendChild(style);

    const root = document.createElement('div');
    root.id = '__dbg';
    root.innerHTML = `
    <div id="__dbg_hdr">
      <b>Debug Console</b>
      <span id="__dbg_meta" style="opacity:.8"></span>
      <button id="__dbg_btn" title="Collapse / Expand">Collapse</button>
      <button id="__dbg_copy" title="Copy logs">Copy</button>
      <button id="__dbg_dl" title="Download logs">Download</button>
      <button id="__dbg_clr" title="Clear">Clear</button>
      <button id="__dbg_off" title="Disable overlay">Off</button>
    </div>
    <div id="__dbg_log" role="log" aria-live="polite"></div>
  `;
    document.body.appendChild(root);

    const meta = document.getElementById('__dbg_meta');
    meta.textContent = [
        navigator.userAgent.split(') ')[0] + ')',
        new Date().toISOString(),
        `${window.innerWidth}x${window.innerHeight}`,
    ].join(' • ');

    const logEl = document.getElementById('__dbg_log');
    const btn = document.getElementById('__dbg_btn');
    const btnCopy = document.getElementById('__dbg_copy');
    const btnDl = document.getElementById('__dbg_dl');
    const btnClr = document.getElementById('__dbg_clr');
    const btnOff = document.getElementById('__dbg_off');

    const buffer = [];
    const push = (level, args) => {
        // stringify args gently
        const parts = Array.from(args).map(a => {
            try {
                if (typeof a === 'string') return a;
                if (a instanceof Error) return `${a.name}: ${a.message}\n${a.stack || ''}`;
                return JSON.stringify(a, (_k, v) => v instanceof Node ? `[Node <${v.nodeName}>]` : v, 2);
            } catch {
                return String(a);
            }
        });
        const line = `[${new Date().toISOString()}] ${level}: ${parts.join(' ')}`;
        buffer.push({ ts: Date.now(), level, parts });

        const row = document.createElement('div');
        row.className = `__dbg-row __dbg-${level}`;
        row.textContent = line;
        logEl.appendChild(row);
        logEl.scrollTop = logEl.scrollHeight;
    };

    // Patch console
    const native = {
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error,
        debug: console.debug,
    };
    ['log','info','warn','error','debug'].forEach(level => {
        console[level] = function (...args) {
            try { push(level === 'log' ? 'log' : level, args); } catch {}
            native[level].apply(console, args);
        };
    });

    // Runtime errors
    window.addEventListener('error', (e) => {
        push('err', [e.message, e.filename + ':' + e.lineno + ':' + e.colno]);
        if (e.error && e.error.stack) push('err', [e.error.stack]);
    }, true);

    window.addEventListener('unhandledrejection', (e) => {
        const r = e.reason;
        if (r && r.stack) push('err', ['Unhandled Rejection:', r.stack]);
        else push('err', ['Unhandled Rejection:', r]);
    });

    // Buttons
    btn.onclick = () => {
        root.classList.toggle('collapsed');
        btn.textContent = root.classList.contains('collapsed') ? 'Expand' : 'Collapse';
    };
    btnClr.onclick = () => { buffer.length = 0; logEl.innerHTML = ''; };
    btnOff.onclick = () => { localStorage.removeItem('debugOverlay'); root.remove(); };
    btnCopy.onclick = async () => {
        const text = buffer.map(x => `[${new Date(x.ts).toISOString()}] ${x.level}: ${x.parts.join(' ')}`).join('\n');
        try { await navigator.clipboard.writeText(text); console.info('Copied logs to clipboard'); } catch (e) { console.warn('Copy failed', e); }
    };
    btnDl.onclick = () => {
        const blob = new Blob([JSON.stringify({ meta: { ua: navigator.userAgent, when: new Date().toISOString() }, logs: buffer }, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = `mobile-logs-${Date.now()}.json`; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };

    // Also expose a helper for ad-hoc breadcrumbs:
    window.__dbg = {
        mark: (label, data) => console.info('MARK:', label, data ?? ''),
        buffer,
    };
})();
