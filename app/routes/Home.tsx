import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageSquare, User, Shield, Menu, X, Sun, Moon,
  Gamepad2, Image as ImageIcon, Hash, Clock, Lock, MessageCircle,
  ChevronRight, ArrowLeft, Send, Edit3, Smile, LogOut,
  Bell, Upload, Bold, Italic, Link as LinkIcon, List, Eye, Search,
  Quote, Trash2
} from 'lucide-react';
import DOMPurify from 'dompurify';

import { api } from './api';

const parseBBCode = (text) => {
  if (!text) return null;
  let formatted = text
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/\[quote=(.*?)\](.*?)\[\/quote\]/gs, '<div class="quote-block"><strong>$1 сказал:</strong><br/>$2</div>')
  .replace(/\[b\](.*?)\[\/b\]/g, '<strong>$1</strong>')
  .replace(/\[i\](.*?)\[\/i\]/g, '<em>$1</em>')
  .replace(/\[u\](.*?)\[\/u\]/g, '<u>$1</u>')
  .replace(/\[size=(\d+)\](.*?)\[\/size\]/g, '<span style="font-size: $1px;">$2</span>')
  .replace(/\[font=(.*?)\](.*?)\[\/font\]/g, '<span style="font-family: $1;">$2</span>')
  .replace(/\[table\](.*?)\[\/table\]/gs, '<table class="bb-table">$1</table>')
  .replace(/\[tr\](.*?)\[\/tr\]/gs, '<tr>$1</tr>')
  .replace(/\[td\](.*?)\[\/td\]/gs, '<td>$1</td>')
  .replace(/\[url=(.*?)\](.*?)\[\/url\]/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>')
  .replace(/\[img\](.*?)\[\/img\]/g, '<img src="$1" class="post-img" alt="User content" />')
  .replace(/\n/g, '<br />');

  const cleanHtml = DOMPurify.sanitize(formatted, {
    ALLOWED_TAGS: ['b', 'i', 'u', 's', 'strong', 'em', 'a', 'img', 'div', 'span', 'br', 'table', 'tr', 'td'],
    ALLOWED_ATTR: ['href', 'src', 'style', 'target', 'class', 'rel']
  });

  return <div dangerouslySetInnerHTML={{__html: cleanHtml}} />;
};

const Styles = () => (
  <style>{`
    body {
      background-color: var(--bg);
      color: var(--text);
      transition: background-color 0.4s ease, color 0.4s ease;
      margin: 0;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    * {
      box-sizing: border-box;
      outline: none;
      -webkit-tap-highlight-color: transparent;
    }

    textarea::focus {
      outline: none;
      box-shadow: none;
    }

    /* Скроллбар */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

    /* Элементы форм */
    input, textarea, select {
      font-size: 15px; width: 100%; padding: 12px 16px;
      background: var(--surface); border: 1px solid var(--border);
      color: var(--text); border-radius: var(--radius);
      transition: var(--transition);
      font-family: inherit;
    }
    input:focus, textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2); }

    /* Layout */
    .app-root { min-height: 100vh; display: flex; flex-direction: column; }
    .navbar {
      height: var(--nav-height); background: var(--surface); border-bottom: 1px solid var(--border);
      padding: 0 24px; display: flex; align-items: center; justify-content: space-between;
      position: sticky; top: 0; z-index: 50; backdrop-filter: blur(10px);
      transition: background-color 0.4s ease, border-color 0.4s ease;
    }
    .container { max-width: 1240px; width: 100%; margin: 0 auto; padding: 24px; flex: 1; }

    .grid-layout {
      display: grid;
      grid-template-columns: 260px 1fr 300px;
      gap: 24px;
      align-items: start;
    }

    /* Настройки профиля: по умолчанию в ряд на ПК */
    .profile-layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 24px;
    }

    /* Расстояние для лейблов в профиле */
    .profile-field {
      margin-bottom: 20px;
    }
    .profile-field label {
      display: block;
      margin-bottom: 8px; /* Вот твой отступ */
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    /* Карточки */
    .card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 20px; margin-bottom: 16px;
    }

    .post-actions { opacity: 0; transition: opacity 0.2s ease; }
    .card:hover .post-actions { opacity: 1; }

    @media (max-width: 900px) { .post-actions { opacity: 1 !important; } }

    /* Категории */
    .section-title { font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 12px 0; }
    .cat-item {
      display: grid; grid-template-columns: 52px 1fr auto; gap: 16px; padding: 16px;
      border-bottom: 1px solid var(--border); cursor: pointer; align-items: center;
      transition: var(--transition); border-radius: 8px;
    }
    .cat-item:hover { background: var(--surface-h); padding-left: 20px; }
    .cat-item:last-child { border-bottom: none; }
    .cat-icon {
      width: 52px; height: 52px; border-radius: 14px;
      background: rgba(245, 158, 11, 0.1); color: var(--primary);
      display: flex; align-items: center; justify-content: center;
      transition: var(--transition);
    }
    .cat-item:hover .cat-icon { background: var(--primary); color: #fff; transform: scale(1.1); }

    /* Кнопки */
    .btn { padding: 10px 20px; border-radius: var(--radius); font-weight: 600; cursor: pointer; border: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.95rem; transition: var(--transition); color: var(--text); }
    .btn-primary {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: #fff;
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
      border-radius: 12px;
      transition: transform 0.1s;
    }
    .create-theme {
      padding: 8px 14px;
    }
    .flex-gap {
      display: flex; gap: 10px; align-items: center;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
    }
    .btn-ghost { background: transparent; color: var(--text-muted); white-space: nowrap; }
    .btn-ghost:hover { background: var(--surface-h); color: var(--text); }
    .btn-secondary { background: var(--surface-h); border: 1px solid var(--border); }
    .btn-secondary:hover { border-color: var(--text-muted); }

    /* BBCode Редактор */
    .editor-toolbar { display: flex; gap: 4px; padding: 8px; background: var(--surface-h); border-bottom: 1px solid var(--border); flex-wrap: wrap; }
    .toolbar-btn { width: 32px; height: 32px; border-radius: 6px; border: none; background: transparent; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
    .toolbar-btn:hover { background: rgba(255,255,255,0.1); color: var(--text); }

    /* Модалка */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s; }
    .modal { background: var(--surface); width: 100%; max-width: 550px; border-radius: 16px; border: 1px solid var(--border); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; box-shadow: 0 20px 50px rgba(0,0,0,0.5); transform: translateY(0); animation: slideUp 0.3s; }

    /* Уведомления */
    .notif-badge { position: absolute; top: -2px; right: -2px; background: var(--danger); color: white; font-size: 10px; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid var(--surface); }
    .notif-dropdown { position: absolute; top: 100%; right: 0; width: 300px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); margin-top: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); z-index: 60; overflow: hidden; animation: slideUp 0.2s; }

    /* Анимации */
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 900px) { .grid-layout { grid-template-columns: 1fr; } .sidebar-left, .sidebar-right { display: none; } .cat-item { grid-template-columns: 48px 1fr; } .cat-item > div:last-child { display: none; } }

    @media (max-width: 900px) {
      .container { padding: 12px; }
      .grid-layout {
        display: flex;
        flex-direction: column; /* Смена row на column */
      }
      .sidebar-left, .sidebar-right {
        width: 100%;
        display: block; /* Показываем на мобиле, если нужно, либо скрыть */
      }
      .profile-layout {
        grid-template-columns: 1fr; /* В колонку на мобилках */
      }
      .cat-item { grid-template-columns: 48px 1fr; }
      .cat-item > div:last-child { display: none; }
    }

    .grid-layout { display: grid; grid-template-columns: 260px 1fr 300px; gap: 24px; align-items: start; }

    /* Профиль: на ПК в ряд */
    .profile-layout { display: grid; grid-template-columns: 320px 1fr; gap: 32px; align-items: start; }

    /* Отступы для полей ввода */
    .field-group { margin-bottom: 24px; }
    .field-group label { display: block; margin-bottom: 10px; font-weight: 600; font-size: 0.9rem; color: var(--text-muted); }

    /* Реакции: меню выбора скрыто, поставленные - видны */
    .reactions-list { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; }
    .reaction-picker { opacity: 0; transition: opacity 0.2s; display: flex; gap: 4px; margin-left: auto; }
    .card:hover .reaction-picker { opacity: 1; }

    @media (max-width: 900px) {
      .grid-layout, .profile-layout { display: flex; flex-direction: column; gap: 16px; }
      .sidebar-left, .sidebar-right { width: 100%; }
      .reaction-picker { opacity: 1; } /* На мобилках всегда видно */
    }

    .role-badge {
      margin: 0 7px;
      opacity: 0.5;
      font-weight: 1000;
      font-size: 14px;
    }

    .quote-block {
      background: rgba(255, 255, 255, 0.05);
      border-left: 3px solid var(--primary);
      padding: 12px;
      margin: 10px 0;
      font-style: italic;
      border-radius: 0 8px 8px 0;
    }

    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 1000;
      pointer-events: none;
    }

    .toast {
      background: var(--surface);
      color: var(--text);
      padding: 12px 20px;
      border-radius: 8px;
      border-left: 4px solid var(--primary);
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      pointer-events: auto;
      animation: slideIn 0.3s ease forwards;
      min-width: 250px;
      max-width: 400px;
    }

    .toast-error { border-left-color: var(--danger); }
    .toast-success { border-left-color: var(--success); }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    /* Убираем отступы на мобилках (Пункт 6) */
    @media (max-width: 600px) {
      .container { padding: 0 !important; }
      .card { border-radius: 0; border-left: none; border-right: none; margin-bottom: 8px; }
      .navbar { padding: 0 12px; }
    }

    /* Таблицы BBCode */
    .bb-table { width: 100%; border-collapse: collapse; margin: 10px 0; border: 1px solid var(--border); }
    .bb-table td { border: 1px solid var(--border); padding: 8px; }

    /* Заглушка Drag&Drop (Пункт 7) */
    .drag-overlay {
      position: fixed; inset: 0; background: rgba(245, 158, 11, 0.9);
      z-index: 1000; display: flex; flex-direction: column; align-items: center;
      justify-content: center; color: white; font-weight: bold; font-size: 1.5rem;
      pointer-events: none; opacity: 0; transition: 0.2s;
    }
    .drag-active .drag-overlay { opacity: 1; }
    `}</style>
);

const useWebSocket = (threadId, onMessage, onArchive, user) => {
  useEffect(() => {
    if (!threadId) return;
    const ws = new WebSocket('wss://лисяк.рф');

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', threadId }));
      if (user) ws.send(JSON.stringify({ type: 'auth', userId: user.id }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'new_message') onMessage(msg.data);
      if (msg.type === 'thread_archived') onArchive();
    };

      return () => ws.close();
  }, [threadId, user?.id]);
};

const AuthScreen = ({ onLogin, onRegister, onGuest }) => {
  const [step, setStep] = useState('login');
  const [formData, setFormData] = useState({ email: '', password: '', name: '', otp: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 'login') {
      onLogin(formData.email, formData.password);
    } else {
      onRegister(formData, step, () => setStep('otp'));
    }
  };

  return (
    <div className="container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh'}}>
    <div className="card" style={{width: '100%', maxWidth: '420px', padding: '32px 24px'}}>
    <div style={{textAlign: 'center', marginBottom: 24}}>
    <div style={{width:48, height:48, background:'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: 12, display:'grid', placeItems:'center', color:'#fff', margin: '0 auto 16px', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'}}>
    <Gamepad2 size={28}/>
    </div>
    <h2 style={{margin: 0, fontSize: '1.5rem'}}>
    {step === 'login' ? 'Вход в аккаунт' : step === 'register' ? 'Создание аккаунта' : 'Подтверждение'}
    </h2>
    <div className="text-muted" style={{marginTop: 8}}>
    {step === 'login' ? 'С возвращением в Лисяк!' : step === 'register' ? 'Присоединяйтесь к сообществу' : 'Мы отправили код на вашу почту'}
    </div>
    </div>

    <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 16}}>
    {step === 'register' && (
      <div>
      <label style={{fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, display: 'block'}}>Никнейм</label>
      <input
      name="name"
      placeholder="Steve"
      value={formData.name}
      onChange={e => setFormData({...formData, name: e.target.value})}
      required
      />
      </div>
    )}

    {step !== 'otp' && (
      <>
      <div>
      <label style={{fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, display: 'block'}}>Email</label>
      <input
      name="email"
      type="email"
      placeholder="user@example.com"
      value={formData.email}
      onChange={e => setFormData({...formData, email: e.target.value})}
      required
      />
      </div>
      <div>
      <label style={{fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, display: 'block'}}>Пароль</label>
      <input
      type="password"
      name="password"
      placeholder="••••••••"
      value={formData.password}
      onChange={e => setFormData({...formData, password: e.target.value})}
      required
      />
      </div>
      </>
    )}

    {step === 'otp' && (
      <div>
      <label style={{fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, display: 'block'}}>Код подтверждения</label>
      <input
      name="otp"
      placeholder="1234"
      value={formData.otp}
      onChange={e => setFormData({...formData, otp: e.target.value})}
      style={{textAlign: 'center', letterSpacing: 8, fontSize: '1.2rem', fontWeight: 'bold'}}
      maxLength={4}
      required
      />
      </div>
    )}

    <button className="btn btn-primary w-full" type="submit" style={{marginTop: 8, height: 48, fontSize: '1rem'}}>
    {step === 'login' ? 'Войти' : step === 'register' ? 'Продолжить' : 'Подтвердить вход'}
    </button>
    </form>

    <div style={{display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0'}}>
    <div style={{height: 1, flex: 1, background: 'var(--border)'}}></div>
    <span className="text-muted" style={{fontSize: '0.8rem'}}>ИЛИ</span>
    <div style={{height: 1, flex: 1, background: 'var(--border)'}}></div>
    </div>

    {step === 'login' && (
      <button className="btn btn-secondary w-full" type="button" onClick={onGuest} style={{marginBottom: 16, width: '70%', marginLeft: 'calc(30% / 2)'}}>
      <User size={18}/> Продолжить как гость
      </button>
    )}

    <div style={{textAlign: 'center', fontSize: '0.9rem'}}>
    <span className="text-muted">{step === 'login' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}</span>
    <button
    style={{background:'none', border:'none', color:'var(--primary)', cursor:'pointer', fontWeight: 600, padding: 0}}
    onClick={() => setStep(step === 'login' ? 'register' : 'login')}
    >
    {step === 'login' ? 'Зарегистрироваться' : 'Войти'}
    </button>
    </div>
    </div>
    </div>
  );
};

const NotificationBell = ({ notifications = [], onRead }) => {
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    if (!open) {
      onRead();
    }
    setOpen(!open);
  };

  return (
    <div style={{position: 'relative'}}>
    <button className="btn-ghost" style={{position: 'relative', padding: 8, borderRadius: '50%'}} onClick={handleToggle}>
    <Bell size={20} />
    {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
    </button>
    {open && (
      <>
      <div style={{position:'fixed', inset:0, zIndex:50}} onClick={() => setOpen(false)}/>
      <div className="notif-dropdown">
      <div style={{padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 'bold'}}>Уведомления</div>
      <div style={{maxHeight: 300, overflowY: 'auto'}}>
      {notifications.length === 0 ? <div style={{padding: 20, textAlign: 'center', color: 'var(--text-muted)'}}>Нет новых уведомлений</div> :
      notifications.map((n, i) => (
        <div key={i} style={{padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: '0.9rem'}}>
        <div style={{color: 'var(--primary)', fontWeight: 600}}>@System</div>
        <div>{n.text}</div>
        </div>
      ))}
      </div>
      </div>
      </>
    )}
    </div>
  )
};

const SkinViewer3D = ({ skinUrl, width = 200, height = 300 }) => {
  const canvasRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!window.skinview3d) {
      const script = document.createElement('script');
      script.src = "https://bs-community.github.io/skinview3d/js/skinview3d.bundle.js";
      script.async = true;
      script.onload = initViewer;
      document.body.appendChild(script);
    } else {
      initViewer();
    }

    function initViewer() {
      if (!canvasRef.current) return;
      if (viewerRef.current) {
        viewerRef.current.dispose();
      }

      // @ts-ignore
      const viewer = new window.skinview3d.SkinViewer({
        canvas: canvasRef.current,
        width: width,
        height: height,
        skin: skinUrl || "https://minecraft.wiki/images/Steve_%28classic_texture%29_JE6.png?8aa86"
      });

      viewer.animation = new window.skinview3d.WalkingAnimation();
      viewer.fov = 70;
      viewer.zoom = 0.9;
      viewer.autoRotate = true;
      viewer.autoRotateSpeed = 0.5;

      viewerRef.current = viewer;
    }

    return () => {};
  }, [skinUrl, width, height]);

  return (
    <div style={{background: 'radial-gradient(circle, var(--surface-h) 0%, var(--surface) 100%)', borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--border)'}}>
    <canvas ref={canvasRef} />
    </div>
  );
};

const TextEditor = ({ value, onChange, placeholder }) => {
  const textAreaRef = useRef(null);

  const insertTag = (tagOpen, tagClose) => {
    const input = textAreaRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);

    const newVal = before + tagOpen + selected + tagClose + after;
    onChange(newVal);

    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + tagOpen.length, end + tagOpen.length);
    }, 0);
  };

  return (
    <div style={{border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--bg)'}}>
    <div className="editor-toolbar">
    <button className="toolbar-btn" onClick={() => insertTag('[b]', '[/b]')} title="Жирный"><Bold size={16}/></button>
    <button className="toolbar-btn" onClick={() => insertTag('[i]', '[/i]')} title="Курсив"><Italic size={16}/></button>
    <button className="toolbar-btn" onClick={() => insertTag('[u]', '[/u]')} title="Подчеркнутый"><span style={{textDecoration:'underline'}}>U</span></button>
    <div style={{width:1, height:20, background:'var(--border)', margin:'0 4px'}}></div>
    <button className="toolbar-btn" onClick={() => insertTag('[img]', '[/img]')} title="Вставить фото"><ImageIcon size={16}/></button>
    <button className="toolbar-btn" onClick={() => insertTag('[url=]', '[/url]')} title="Ссылка"><LinkIcon size={16}/></button>
    </div>
    <textarea
    ref={textAreaRef}
    className="input"
    style={{border: 'none', borderRadius: 0, minHeight: 150, resize: 'vertical', background: 'transparent'}}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    />
    <div style={{padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)'}}>
    Поддерживается BBCode: [b], [i], [img], [url]
    </div>
    </div>
  );
};

const ROLE = {
  user: 'игрок'
}

const PostItem = ({ post, user, onReact, onDelete, onQuote, onEdit, openUserProfile }) => {
  const author = post.author || { name: 'Unknown', role: 'user', avatar: '' };
  const reactions = post.reactions || {};

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const isOwner = user?.id === post.author_id;
  const isStaff = user?.role === 'admin' || user?.role === 'moderator';

  const handleSave = async () => {
    await onEdit(post.id, editContent);
    setIsEditing(false);
  };

  const reactionEntries = Object.entries(reactions).filter(([_, ids]) => ids && ids.length > 0);

  const myReaction = Object.keys(reactions).find(emoji => reactions[emoji]?.includes(user?.id));

  return (
    <div className="card" style={{padding: 0, overflow: 'visible'}}>
    <div style={{padding: '12px 20px', background: 'var(--surface-h)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)'}}>
    <div onClick={() => openUserProfile(author.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
    <img src={author.avatar} style={{width: 32, height: 32, borderRadius: '50%'}} />
    <div style={{fontWeight: 'bold', color: 'var(--primary)'}}>{author.name}</div>
    <span className={`role-badge role-${author.role}`}>{author.role}</span>
    </div>

    <div style={{display: 'flex', gap: 8}}>

    <button className="btn-ghost" style={{padding: 4}} onClick={() => onQuote(author.name, post.content)} title="Ответить">
    <Quote size={16}/>
    </button>

    {(isOwner || isStaff) && (
      <>
      {isOwner && <button className="btn-ghost" onClick={() => setIsEditing(!isEditing)} style={{padding: 4}}><Edit3 size={16}/></button>}
      <button className="btn-ghost" onClick={() => onDelete(post.id)} style={{padding: 4, color: 'var(--danger)'}}><Trash2 size={16}/></button>
      </>
    )}
    </div>
    </div>

    <div style={{padding: '20px'}}>
    {isEditing ? (
      <div>
      <textarea className="input" value={editContent} onChange={e => setEditContent(e.target.value)} style={{minHeight: 100}} />
      <div style={{marginTop: 10, display: 'flex', gap: 8}}>
      <button className="btn btn-primary" onClick={handleSave}>Сохранить</button>
      <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>Отмена</button>
      </div>
      </div>
    ) : (
      parseBBCode(post.content)
    )}
    </div>

    <div style={{padding: '12px 24px', background: 'rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', minHeight: 48}}>

    <div className="reactions-list">
    {reactionEntries.map(([emoji, ids]) => {
      const isMine = ids.includes(user?.id);
      return (
        <div key={emoji}
        onClick={() => onReact(post.id, emoji)}
        style={{
          border: `1px solid ${isMine ? 'var(--primary)' : 'var(--border)'}`,
              background: isMine ? 'rgba(245, 158, 11, 0.1)' : 'var(--surface)',
              borderRadius: 16, padding: '4px 10px', fontSize: '0.85rem', cursor: 'pointer',
              color: isMine ? 'var(--primary)' : 'var(--text-muted)', display: 'flex', gap: 6
        }}>
        {emoji} <span>{ids.length}</span>
        </div>
      )
    })}
    </div>

    <div className="reaction-picker">
    {['👍', '❤️', '🔥', '🤡'].map(emoji => (
      <button
      key={emoji}
      className="btn-ghost"
      style={{padding: 6, fontSize: '1.2rem', opacity: myReaction === emoji ? 1 : 0.5}}
      onClick={() => onReact(post.id, emoji)}
      >
      {emoji}
      </button>
    ))}
    </div>
    </div>

    {author.signature && <div style={{margin: '0 24px 24px', paddingTop: 16, borderTop: '1px dashed var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic'}}>{parseBBCode(author.signature)}</div>}
    </div>
  );
};

const ProfileSettings = ({ user, onUpdate, onBack }) => {
  const [ form, setForm ] = useState({ ...user });
  const [ previewName, setPreviewName ] = useState(user.gameNick || user.name);

  const handleBlur = () => {
    setPreviewName(form.gameNick || form.name);
  };

  const skinUrl = `https://minotar.net/skin/${previewName}`;

  return (
    <div className="animate-in">
    <button className="btn btn-ghost" onClick={onBack} style={{marginBottom: 16}}>
    <ArrowLeft size={18}/> Назад
    </button>

    <div className="profile-layout">
    <div className="card" style={{textAlign: 'center'}}>
    <h3>Ваш скин</h3>
    <SkinViewer3D skinUrl={skinUrl} />
    <div style={{marginTop: 12, fontSize: '0.8rem'}} className="text-muted">
    Предпросмотр ника: {previewName}
    </div>
    </div>

    <div className="card">
    <h3>Настройки</h3>

    <div className="profile-field">
    <label>Отображаемое имя</label>
    <input
    value={form.name}
    onChange={e => setForm({...form, name: e.target.value})}
    onBlur={handleBlur}
    />
    </div>

    <div className="profile-field">
    <label>
    Игровой никнейм
    {!!user.game_linked && (
      <span style={{color: 'var(--success)', marginLeft: 8}}>
      (Привязан)
      </span>
    )}
    </label>
    <input
    value={form.gameNick || ''}
    onChange={e => setForm({...form, gameNick: e.target.value})}
    disabled={!!user.game_linked}
    onBlur={handleBlur}
    placeholder="Steve"
    />
    </div>

    <div className="profile-field">
    <label>Подпись</label>
    <TextEditor
    value={form.signature || ''}
    onChange={val => setForm({...form, signature: val})}
    />
    </div>

    <button className="btn btn-primary" onClick={() => onUpdate(form)}>
    Сохранить
    </button>
    </div>
    </div>
    </div>
  );
};

const InfoIcon = () => <span style={{display: 'inline-block', width: 14, height: 14, borderRadius: '50%', background: 'var(--text-muted)', color: 'var(--bg)', textAlign: 'center', lineHeight: '14px', fontSize: 10, marginRight: 5}}>i</span>

export default function Forum() {
  const [theme, setTheme] = useState('dark');
  const [appLoading, setAppLoading] = useState(true);
  const [view, setView] = useState('loading');
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const [categories, setCategories] = useState([]);
  const [threads, setThreads] = useState({ data: [], total: 0 });
  const [posts, setPosts] = useState({ data: [], total: 0 });

  const [activeCategory, setActiveCategory] = useState(null);
  const [activeThread, setActiveThread] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [viewingUser, setViewingUser] = useState(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [replyText, setReplyText] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [onlineStats, setOnlineStats] = useState(0);
  const [toasts, setToasts] = useState([]);

  const showToast = (msg, type = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  useWebSocket(
    activeThread?.id,
    (newMsg) => {
      setPosts(prev => ({ ...prev, data: [...prev.data, newMsg] }));
    },
    () => {
      showToast("Эта тема была архивирована или удалена.");
      handleNavigation('main');
    },
    user
  );

  const groupedCategories = useMemo(() => {
    const groups = { 'official': [], 'general': [], 'admin': [], 'archive': [] };
    categories.forEach(c => {
      if (c.id === 'archive' && user?.role !== 'admin') return;

      if (groups[c.type]) groups[c.type].push(c);
      else groups['general'].push(c);
    });
      return groups;
  }, [categories, user]);

  const handleNavigation = (type, data = null) => {
    const url = new URL(window.location);
    url.search = '';

    if (type === 'category') {
      setThreads({ data: [], total: 0 });
      setActiveCategory(data);
      setActiveThread(null);
      setCurrentPage(1);
      setView('forum');
      url.searchParams.set('cat', data.id);
    } else if (type === 'thread') {
      setPosts({ data: [], total: 0 });
      setActiveThread(data);
      setCurrentPage(1);
      setView('forum');
      url.searchParams.set('thread', data.id);
    } else if (type === 'main') {
      setActiveCategory(null);
      setActiveThread(null);
      setView('forum');
    } else if (type === 'account') {
      setView('account');
      url.searchParams.set('view', 'account');
    }

    window.history.pushState({}, '', url);
  };

  useEffect(() => {
    if (view === 'account')
      document.title = "Лисяк | Профиль";
    else if (view === 'forum') {
      if (activeThread) {
        document.title = "Лисяк | " + activeThread.title;
      }
      else document.title = "Лисяк | Форум";
    }
    else if (view === 'auth') {
      document.title = "Лисяк | Вход";
    }
  }, [ view, activeThread ])

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [ theme ]);

  useEffect(() => {
    const init = async () => {
      setAppLoading(true);
      const token = api.getToken();
      let currentUser = null;

      if (token) {
        try {
          currentUser = await api.getMe();
          setUser(currentUser);
        } catch (e) { api.logout(); }
      }

      const cats = await api.getCategories();
      setCategories(cats);

      const params = new URLSearchParams(window.location.search);
      const threadId = params.get('thread');
      const catId = params.get('cat');
      const viewParam = params.get('view');

      if (viewParam === 'account' && currentUser) {
        setView('account');
      } else if (threadId) {
        try {
          const threadData = await api.getThreadById(threadId);
          setActiveThread(threadData);
          setView('forum');
        } catch (e) {
          console.error("Тема не найдена");
          setView('forum');
        }
      } else if (catId) {
        const cat = cats.find(c => c.id === catId);
        if (cat) setActiveCategory(cat);
        setView('forum');
      } else {
        setView(currentUser ? 'forum' : 'auth');
      }

      setAppLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (activeCategory) {
      setThreads({ data: [], total: 0 });
      api.getThreads(activeCategory.id, currentPage).then(setThreads).catch(console.error);
    }
  }, [activeCategory, currentPage]);

  useEffect(() => {
    if (activeThread) {
      setPosts({ data: [], total: 0 });
      api.getPosts(activeThread.id, currentPage).then(setPosts).catch(console.error);
    }
  }, [activeThread, currentPage]);

  const handleDeletePost = async (postId) => {
    if (!confirm("Вы уверены?")) return;
    try {
      const res = await api.deletePost(postId);
      if (res.isThread) {
        handleNavigation('main');
      } else {
        setPosts(prev => ({ ...prev, data: prev.data.filter(p => p.id !== postId) }));
      }
    } catch (e) { showToast(e.message); }
  };

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tid = params.get('thread');
      const cid = params.get('cat');
      if (tid) api.getThreadById(tid).then(setActiveThread);
      else if (cid) setActiveCategory(categories.find(c => c.id === cid));
      else { setActiveThread(null); setActiveCategory(null); setView('forum'); }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [ categories ]);

  const handleReact = async (postId, emoji) => {
    if (!user) return showToast("Нужно войти");

    setPosts(prev => ({
      ...prev,
      data: prev.data.map(p => {
        if (p.id !== postId) return p;
        const current = { ...p.reactions };
        const isAlreadyReacted = current[emoji]?.includes(user.id);

        // Если уже ставили — убираем, если нет — добавляем и чистим другие
        Object.keys(current).forEach(key => {
          current[key] = current[key].filter(id => id !== user.id);
          if (current[key].length === 0) delete current[key];
        });

          if (!isAlreadyReacted) {
            if (!current[emoji]) current[emoji] = [];
            current[emoji].push(user.id);
          }
          return { ...p, reactions: current };
      })
    }));
    await api.toggleReaction(postId, emoji);
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleGlobalDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    /*const imageUrl = "ССЫЛКА_ПОСЛЕ_ЗАГРУЗКИ";

    if (!activeThread) {
      const banCat = categories.find(c => c.id === 'c1' || c.title === 'Жалобы');
      setActiveCategory(banCat);
      setNewThreadTitle("Жалоба от " + user?.name);
      setNewThreadContent(`[img]${imageUrl}[/img]`);
      setCreateModalOpen(true);
    } else {
      setReplyText(prev => prev + `\n[img]${imageUrl}[/img]\n`);
    }*/
  };

  const handleQuote = (author, content) => {
    const cleanContent = content.replace(/\[quote.*?\][\s\S]*?\[\/quote\]/g, '').trim();
    setReplyText(prev => prev + `[quote=${author}]${cleanContent}[/quote]\n`);

    const editor = document.querySelector('textarea');
    if (editor) editor.focus();
  };

  const handleEditPost = async (postId, newContent) => {
    try {
      await api.editPost(postId, newContent);
      setPosts(prev => ({
        ...prev,
        data: prev.data.map(p => p.id === postId ? { ...p, content: newContent } : p)
      }));
    } catch (e) {
      showToast("Ошибка при сохранении: " + e.message);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const res = await api.login(email, password);
      api.setToken(res.token);
      setUser(res.user);
      handleNavigation('main');
    } catch (e) {
      showToast(e.message || "Ошибка входа");
    }
  };

  const handleRegister = async (data, step, onSuccess) => {
    try {
      if (step === 'register') {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|[a-zA-Z0-9.-]+\.ru)$/;

        if (!emailRegex.test(data.email)) {
          showToast("Разрешены почты .ru и gmail.com");
          return;
        }

        await api.register(data);
        if (onSuccess) onSuccess();
      } else if (step === 'otp') {
        const res = await api.verify(data.email, data.otp);
        api.setToken(res.token);
        setUser(res.user);
        handleNavigation('main');
      }
    } catch (e) {
      showToast(e.message || "Ошибка регистрации");
    }
  };

  const createThread = async () => {
    if (!user) return showToast("Войдите в аккаунт");
    if (!newThreadTitle || !newThreadContent) return showToast("Заполните все поля");
    try {
      await api.createThread({ categoryId: activeCategory.id, title: newThreadTitle, content: newThreadContent });
      setCreateModalOpen(false);
      setNewThreadTitle(''); setNewThreadContent('');
      const updated = await api.getThreads(activeCategory.id, 1);
      setThreads(updated);
    } catch (e) { showToast(e.message); }
  };

  const sendReply = async () => {
    if (!user) return showToast("Войдите в аккаунт");
    if (!replyText.trim()) return;
    try {
      await api.createPost({ threadId: activeThread.id, content: replyText });
      setReplyText('');
      const updated = await api.getPosts(activeThread.id, currentPage);
      setPosts(updated);
    } catch (e) { showToast(e.message); }
  };

  const openUserProfile = async (userId) => {
    console.log(userId)
    setAppLoading(true);
    try {
      const data = await api.request(`/user/${userId}`);
      setViewingUser(data);
      setView('user_profile');
    } catch (e) {
      console.error(e)
      showToast("Пользователь не найден");
    }
    setAppLoading(false);
  };

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setAppLoading(true);
      try {
        const results = await api.request(`/search?q=${encodeURIComponent(searchQuery)}`);

        setThreads({
          data: Array.isArray(results) ? results : [],
                   total: results.length || 0
        });

        setActiveCategory({
          id: 'search',
          title: 'Результаты поиска',
          description: `По запросу: ${searchQuery}`
        });

        setActiveThread(null);
        setView('forum');

        const url = new URL(window.location);
        url.search = `?q=${encodeURIComponent(searchQuery)}`;
        window.history.pushState({}, '', url);

      } catch (e) {
        console.error("Ошибка поиска:", e);
        alert("Не удалось выполнить поиск");
      }
      setAppLoading(false);
    }
  };



  if (appLoading) return <div className="app-root" style={{justifyContent:'center', alignItems:'center'}}>Загрузка...</div>;

  return (
    <div className="app-root" data-theme={theme}>
    <Styles />

    {view === 'auth' && (
      <AuthScreen
      onLogin={handleLogin}
      onRegister={handleRegister}
      onGuest={() => { setUser(null); handleNavigation('main'); }}
      />
    )}

    {view !== 'auth' && view !== 'loading' && (
      <>
      <div className="navbar">
      <div style={{display:'flex', gap: 16, alignItems:'center'}}>
      <div style={{fontWeight:900, fontSize:'1.4rem', cursor:'pointer', display:'flex', alignItems:'center', gap:10}} onClick={() => handleNavigation('main')}>
      <div style={{width:36, height:36, background:'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: 8, display:'grid', placeItems:'center', color:'#fff', boxShadow: '0 4px 10px rgba(245,158,11,0.4)'}}>M</div>
      <span style={{background:'linear-gradient(90deg, var(--text), var(--text-muted))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>Лисяк</span>
      </div>

      <div style={{position: 'relative', marginLeft: 20}} className="desktop-only">
      <Search size={18} style={{position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)'}} />
      <input
      type="text"
      className="input"
      placeholder="Поиск тем..."
      style={{paddingLeft: 40, height: 38, width: 250, background: 'var(--surface-h)'}}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onKeyDown={handleSearch}
      />
      </div>

      </div>
      <div style={{display:'flex', gap: 12, alignItems:'center'}}>
      {user && <NotificationBell notifications={notifications} onRead={() => setNotifications([])} />}
      <button className="btn-ghost" style={{padding:8, borderRadius:'50%'}} onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}</button>
      {user ? (
        <div className="btn-ghost" onClick={() => handleNavigation('account')} style={{display:'flex', gap:10, alignItems:'center', cursor:'pointer', padding:'6px 12px', borderRadius:20, border:'1px solid var(--border)'}}>
        <img src={user.avatar} style={{width:24, height:24, borderRadius:'50%'}} />
        <span style={{fontWeight:600}}>{user.name}</span>
        </div>
      ) : (
        <button className="btn btn-primary" onClick={() => setView('auth')}>Войти</button>
      )}
      </div>
      </div>

      <div className="container">
      {view === 'account' ? (
        <ProfileSettings user={user} onUpdate={(u) =>
          api.updateProfile(u).then(res => {
            setUser(res);
            showToast('Профиль сохранен');
          })} onBack={() => handleNavigation('main')} />
      ) : view === 'user_profile' ? (
        <div className="animate-in">
        <button className="btn btn-ghost" onClick={() => setView('forum')}><ArrowLeft/> Назад</button>
        <div className="profile-layout">
        <div className="card" style={{textAlign: 'center'}}>
        <SkinViewer3D skinUrl={`https://minotar.net/skin/${viewingUser.game_nick || viewingUser.name}`} />
        <h2>{viewingUser.name}</h2>
        <span className={`role-badge role-${viewingUser.role}`}>{viewingUser.role}</span>
        </div>
        <div className="card">
        <h3>Инфо</h3>
        <p>Игровой ник: {viewingUser.game_nick || 'Не указан'}</p>
        <div className="signature-box">
        {parseBBCode(viewingUser.signature)}
        </div>
        </div>
        </div>
        </div>
      ) : (
        <div className="grid-layout">

        <div className="sidebar-left">
        <div className="card">
        <button className={`btn w-full ${!activeCategory ? 'btn-primary' : 'btn-ghost'}`} style={{justifyContent: 'flex-start'}} onClick={() => handleNavigation('main')}> <Hash size={18}/> Все разделы</button>
        <div style={{margin: '15px 0', borderBottom: '1px solid var(--border)'}}></div>
        <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 10, paddingLeft: 10}}>БЫСТРЫЙ ДОСТУП</div>

        <button className="btn btn-ghost sidebar-btn" onClick={() => {
          const banCat = categories.find(c => c.id === 'c1' || c.title === 'Жалобы');
          if (banCat) handleNavigation('category', banCat);
        }}><Lock size={18}/> Жалобы</button>

        <button className="btn btn-ghost sidebar-btn" onClick={() => {
          const offtopic = categories.find(c => c.type === 'offtopic');
          if (offtopic) handleNavigation('category', offtopic);
        }}><MessageCircle size={18}/> Флудилка</button>
        </div>
        </div>

        <div style={{minHeight: 400}}>
        {activeThread ? (
          <div className="animate-in">
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16}}>
          <button className="btn-ghost" style={{padding: 8}} onClick={() => handleNavigation('category', categories.find(c => c.id === activeThread.categoryId))}><ArrowLeft/></button>
          <h2 style={{margin: 0, lineHeight: 1.2}}>{activeThread.title}</h2>
          </div>

          {posts.data.map(p => (
            <PostItem
            key={p.id}
            post={p}
            user={user}
            onQuote={handleQuote}
            onEdit={handleEditPost}
            onReact={handleReact}
            onDelete={handleDeletePost}
            openUserProfile={openUserProfile}
            />
          ))}

          <h4 style={{marginTop: '40px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8}}><Edit3 size={18}/> Ваш ответ</h4>
          <TextEditor value={replyText} onChange={setReplyText} placeholder="Напишите сообщение..." />
          <div style={{marginTop: 12, display: 'flex', justifyContent: 'flex-end'}}>
          <button className="btn btn-primary" onClick={sendReply}><Send size={16}/> Отправить ответ</button>
          </div>
          </div>
        ) : activeCategory ? (
          <div className="animate-in">
          <div style={{display:'flex', justifyContent:'space-between', marginBottom: 20, alignItems: 'center'}}>
          <button className="btn-ghost flex-gap" onClick={() => handleNavigation('main')}><ArrowLeft size={18}/> К разделам</button>
          <button className="btn-primary create-theme flex-gap" onClick={() => setCreateModalOpen(true)}><Edit3 size={18}/> Создать тему</button>
          </div>
          <div className="card" style={{padding: 0, overflow: 'hidden'}}>
          <div style={{padding: 24, background: 'linear-gradient(to right, var(--surface-h), var(--surface))', borderBottom: '1px solid var(--border)'}}>
          <h2 style={{margin: 0, fontSize: '1.5rem'}}>{activeCategory.title}</h2>
          <div className="text-muted" style={{marginTop: 5}}>{activeCategory.description}</div>
          </div>
          {threads.data.length === 0 ? (
            <div style={{padding:40, textAlign:'center', color: 'var(--text-muted)'}}>
            В этом разделе пока нет тем. Будьте первыми!
            </div>
          ) : (
            threads.data.map(t => (
              <div key={t.id} className="cat-item" onClick={() => handleNavigation('thread', t)}>
              <div className="cat-icon" style={{background: t.pinned ? 'rgba(239, 68, 68, 0.1)' : undefined, color: t.pinned ? 'var(--danger)' : undefined}}>
              {t.pinned ? <Shield size={24}/> : <MessageSquare size={24}/>}
              </div>
              <div>
              <div style={{fontWeight:600, fontSize: '1.05rem', marginBottom: 4}}>
              {!!t.pinned && <span style={{color: 'var(--danger)', marginRight: 5}}>📌 ВАЖНО:</span>}
              {t.title}
              </div>
              <div className="text-muted" style={{fontSize: '0.85rem'}}>
              {/* Используем t.author_name, который пришел из JOIN */}
              Автор: {t.author_name || 'Система'} • {new Date(t.createdAt || t.created_at).toLocaleDateString()}
              </div>
              </div>
              <div className="text-muted" style={{fontSize: '0.9rem', textAlign: 'right', fontWeight: 600}}>
              {t.replies} <span style={{fontSize: '0.7rem', fontWeight: 400, display: 'block'}}>ОТВЕТОВ</span>
              </div>
              </div>
            ))
          )}
          </div>
          </div>
        ) : (
          <div className="animate-in">
          {Object.entries(groupedCategories).map(([type, cats]) => {
            if (cats.length === 0) return null;
            const titles = { 'official': 'Официальные новости', 'general': 'Игровые серверы', 'admin': 'Персонал' };
            const icons = { 'official': <Shield size={16}/>, 'general': <Gamepad2 size={16}/>, 'admin': <Lock size={16}/> };

            return (
              <div key={type}>
              <div className="section-title" style={{display: 'flex', alignItems: 'center', gap: 8}}>{icons[type]} {titles[type] || 'Разное'}</div>
              <div className="card" style={{padding: 0, overflow: 'hidden'}}>
              {cats.map(cat => (
                <div key={cat.id} className="cat-item" onClick={() => handleNavigation('category', cat)}>
                <div className="cat-icon">
                {cat.icon === 'shield' ? <Shield/> : cat.icon === 'gamepad' ? <Gamepad2/> : <MessageCircle/>}
                </div>
                <div>
                <div style={{fontWeight: 700, fontSize: '1.1rem', marginBottom: 4}}>{cat.title}</div>
                <div className="text-muted" style={{fontSize: '0.9rem'}}>{cat.description}</div>
                </div>
                <ChevronRight className="text-muted"/>
                </div>
              ))}
              </div>
              </div>
            )
          })}
          </div>
        )}
        </div>

        <div className="sidebar-right">
        <div className="card" style={{background: 'linear-gradient(145deg, var(--surface), var(--surface-h))'}}>
        <div style={{fontWeight: 800, color: 'var(--primary)', marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8}}><Gamepad2/> Лисяк</div>
        <div style={{fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-muted)'}}>
        Лучший сука сервер Minecraft.
        </div>
        <button
        className="btn btn-primary w-full"
        style={{marginTop: 15}}
        onClick={() => {
          handleNavigation('thread', { id: 'q62j1rjo9', title: 'Начало игры', categoryId: 'c2' });
        }}
        >
        Начать играть
        </button>
        </div>


        <div className="card">
        <div style={{fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: 15}}>СТАТИСТИКА</div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem'}}>
        <span>Онлайн:</span> <span style={{color: 'var(--success)'}}>{onlineStats}</span>
        </div>
        </div>
        </div>
        </div>
      )}
      </div>

      {/* 3. МОДАЛКА (Клик по серой зоне закрывает) */}
      {createModalOpen && (
        <div className="modal-overlay" onClick={(e) => {
          if(e.target === e.currentTarget) setCreateModalOpen(false); // Клик по фону
        }}>
        <div className="modal">
        <div style={{padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-h)'}}>
        <h3 style={{margin: 0}}>Создать новую тему</h3>
        <button className="btn-ghost" style={{padding: 4}} onClick={() => setCreateModalOpen(false)}><X size={20}/></button>
        </div>
        <div style={{padding: 24, overflowY: 'auto'}}>
        <label className="text-muted" style={{fontSize: '0.85rem'}}>Заголовок</label>
        <input placeholder="Краткая суть вопроса..." value={newThreadTitle} onChange={e => setNewThreadTitle(e.target.value)} style={{marginBottom: 20, marginTop: 5}} />

        <label className="text-muted" style={{fontSize: '0.85rem'}}>Содержание</label>
        <div style={{marginTop: 5}}>
        <TextEditor value={newThreadContent} onChange={setNewThreadContent} placeholder="Опишите подробно..." />
        </div>
        </div>
        <div style={{padding: '20px 24px', borderTop: '1px solid var(--border)', display:'flex', gap: 12, justifyContent:'flex-end', background: 'var(--surface)'}}>
        <button className="btn btn-secondary" onClick={() => setCreateModalOpen(false)}>Отмена</button>
        <button className="btn btn-primary" onClick={createThread}>Опубликовать</button>
        </div>
        </div>
        </div>
      )}
      </>
    )}

    <div className="toast-container">
    {toasts.map(t => (
      <div key={t.id} className={`toast toast-${t.type}`}>
      {t.msg}
      </div>
    ))}
    </div>
    </div>
  );
}
