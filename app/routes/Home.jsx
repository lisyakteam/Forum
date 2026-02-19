import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageSquare, User, Shield, Menu, X, Sun, Moon,
  Gamepad2, Image as ImageIcon, Hash, Clock, Lock, MessageCircle,
  ChevronRight, ArrowLeft, Send, Edit3, Smile, LogOut,
  Bell, Upload, Bold, Italic, Link as LinkIcon, List, Eye, Search,
  Quote, Trash2
} from 'lucide-react';

import { Pagination } from '$/components/Pagination'
import { AuthScreen } from '$/components/AuthScreen'
import { ProfileSettings } from '$/components/ProfileSettings'
import { PostItem } from '$/components/PostItem'
import { TextEditor } from '$/components/TextEditor'
import { OtherProfile } from '$/components/OtherProfile'
import { MainTheme as Styles } from '$/styles.jsx'

import { api } from '$/utils/api';

import { parseBBCode } from '$/utils/bbcode'
import { useWebSocket } from '$/utils/websocket'
import { Avatar } from '$/utils/skins'

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

const InfoIcon = () => <span style={{display: 'inline-block', width: 14, height: 14, borderRadius: '50%', background: 'var(--text-muted)', color: 'var(--bg)', textAlign: 'center', lineHeight: '14px', fontSize: 10, marginRight: 5}}>i</span>


export default function Forum() {
  const [ theme, setTheme ] = useState('dark');
  const [ appLoading, setAppLoading ] = useState(true);
  const [ view, setView ] = useState('loading');
  const [ user, setUser ] = useState(null);
  const [ notifications, setNotifications ] = useState([]);

  const [ categories, setCategories ] = useState([]);
  const [ threads, setThreads ] = useState({ data: [], total: 0 });
  const [ posts, setPosts ] = useState({ data: [], total: 0 });

  const [ activeCategory, setActiveCategory ] = useState(null);
  const [ activeThread, setActiveThread ] = useState(null);
  const [ currentPage, setCurrentPage ] = useState(1);

  const [ viewingUser, setViewingUser ] = useState(null);

  const [ createModalOpen, setCreateModalOpen ] = useState(false);
  const [ newThreadTitle, setNewThreadTitle ] = useState('');
  const [ newThreadContent, setNewThreadContent ] = useState('');
  const [ replyText, setReplyText ] = useState('');

  const [ searchQuery, setSearchQuery ] = useState('');
  const [ onlineStats, setOnlineStats ] = useState(0);
  const [ toasts, setToasts ] = useState([]);

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
    const groups = { 'general': [], 'game': [], 'random': [] };
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
          console.log(threadData)
          setPosts(threadData);
          setActiveThread({
            id: threadId,
            title: threadData.title,
            categoryId: threadData.category_id
          });
          setCurrentPage(1);
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
    if (activeCategory && activeCategory.id !== "search") {
      setThreads({ data: [], total: 0 });
      api.getThreads(activeCategory.id, currentPage).then(setThreads).catch(console.error);
    }
  }, [activeCategory, currentPage]);

  useEffect(() => {
    if (activeThread?.id) {
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
        const response = await api.request(`/search?q=${encodeURIComponent(searchQuery)}`);

        const { results } = response

        console.log('Search results', results)

        setActiveThread(null);
        setView('forum');

        setThreads({
          data: results || [],
          total: results?.length || 0
        });

        setActiveCategory({
          id: 'search',
          title: 'Результаты поиска',
          description: `По запросу: ${searchQuery}`
        });

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
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <div style={{ fontWeight: 900, fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }} onClick={() => handleNavigation('main')}>
      <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: 8, display: 'grid', placeItems: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(245,158,11,0.4)' }}>M</div>
      <span style={{ background: 'linear-gradient(90deg, var(--text), var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Лисяк</span>
      </div>

      <div style={{ position: 'relative', marginLeft: 20 }} className="desktop-only">
      <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
      <input
      type="text"
      className="input"
      placeholder="Поиск тем..."
      style={{ paddingLeft: 40, height: 38, width: 250, background: 'var(--surface-h)' }}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onKeyDown={handleSearch}
      />
      </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {user && <NotificationBell notifications={notifications} onRead={() => setNotifications([])} />}
      <button className="btn-ghost" style={{ padding: 8, borderRadius: '50%' }} onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      {user ? (
        <div className="btn-ghost" onClick={() => handleNavigation('account')} style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', padding: '6px 12px', borderRadius: 20, border: '1px solid var(--border)' }}>
        <Avatar username={ user.username } styles={{ width: 24, height: 24 }}/>
        <span style={{ fontWeight: 600 }}>{user.name}</span>
        </div>
      ) : (
        <button className="btn btn-primary" onClick={() => setView('auth')}>Войти</button>
      )}
      </div>
      </div>

      <div className="container">
      {view === 'account' ? (
        <ProfileSettings
        user={user}
        onUpdate={(u) =>
          api.updateProfile(u).then(res => {
            setUser(res);
            showToast('Профиль сохранен');
          })}
          onBack={() => handleNavigation('main')} />
      ) : view === 'user_profile' ?
        <OtherProfile
          setView={setView}
          viewingUser={viewingUser}
        />
      : (
        <div className="grid-layout">
        <div className="sidebar-left">
        <div className="card">
        <button className={`btn w-full ${!activeCategory ? 'btn-primary' : 'btn-ghost'}`} style={{ justifyContent: 'flex-start' }} onClick={() => handleNavigation('main')}> <Hash size={18} /> Все разделы</button>
        <div style={{ margin: '15px 0', borderBottom: '1px solid var(--border)' }}></div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 10, paddingLeft: 10 }}>БЫСТРЫЙ ДОСТУП</div>

        <button className="btn btn-ghost sidebar-btn" onClick={() => {
          const banCat = categories.find(c => c.title === 'Жалобы');
          if (banCat) handleNavigation('category', banCat);
        }}><Lock size={18} /> Жалобы</button>

        <button className="btn btn-ghost sidebar-btn" onClick={() => {
          const offtopic = categories.find(c => c.title === "Курилка");
          if (offtopic) handleNavigation('category', offtopic);
        }}><MessageCircle size={18} /> Курилка</button>
        </div>
        </div>

        <div className="content">
        {activeThread ? (
          <div className="animate-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => handleNavigation('category', categories.find(c => c.id === activeThread.categoryId))}><ArrowLeft /></button>
          <h2 style={{ margin: 0, lineHeight: 1.2 }}>{activeThread.title}</h2>
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

          <Pagination
          current={currentPage}
          totalItems={posts.total}
          onChange={(page) => {
            setCurrentPage(page);
            window.scrollTo(0, 0);
          }}
          />

          <h4 style={{ marginTop: '40px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Edit3 size={18} /> Ваш ответ</h4>
          <TextEditor value={replyText} onChange={setReplyText} placeholder="Напишите сообщение..." />
          <div class="animate-in" style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={sendReply}><Send size={16} /> Отправить ответ</button>
          </div>
          </div>
        ) : activeCategory ? (
          <div className="animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
          <button style={{ padding: '10px' }} className="btn btn-ghost flex-gap" onClick={() => handleNavigation('main')}><ArrowLeft size={18} /> К разделам</button>
          <button className="btn-primary create-theme flex-gap" onClick={() => setCreateModalOpen(true)}><Edit3 size={18} /> Создать тему</button>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 24, background: 'linear-gradient(to right, var(--surface-h), var(--surface))', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{activeCategory.title}</h2>
          <div className="text-muted" style={{ marginTop: 5 }}>{activeCategory.description}</div>
          </div>
          {threads.data.length === 0 ? (
            <div class="animate-in" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            В этом разделе пока нет тем. Будьте первыми!
            </div>
          ) : (
            <>
            {threads.data.map(t => (
              <div key={t.id} className="animate-in cat-item" onClick={() => handleNavigation('thread', t)}>
              <div className="cat-icon" style={{ background: t.pinned ? 'rgba(239, 68, 68, 0.1)' : undefined, color: t.pinned ? 'var(--danger)' : undefined }}>
              {t.pinned ? <Shield size={24} /> : <MessageSquare size={24} />}
              </div>
              <div>
              <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: 4 }}>
              {!!t.pinned && <span style={{ color: 'var(--danger)', marginRight: 5 }}>📌</span>}
              {t.title}
              </div>
              <div className="text-muted" style={{ fontSize: '0.85rem' }}>
              Автор: {t.author_name} • {new Date(t.createdAt || t.created_at).toLocaleDateString()}
              </div>
              </div>
              <div class="thread-info">
              <div className="text-muted" style={{ fontSize: '0.9rem', textAlign: 'right', fontWeight: 600 }}>
              {t.replies} <MessageCircle size={14}/>
              </div>
              <div className="text-muted" style={{ fontSize: '0.9rem', textAlign: 'right', fontWeight: 600 }}>
              {t.views} <Eye size={16}/>
              </div>
              </div>
              </div>
            ))}

            <div style={{ padding: '0 24px 24px' }}>
            <Pagination
            current={currentPage}
            totalItems={threads.total}
            onChange={(page) => {
              setCurrentPage(page);
              window.scrollTo(0, 0);
            }}
            />
            </div>
            </>
          )}
          </div>
          </div>
        ) : (
          <div className="animate-in">
          {Object.entries(groupedCategories).map(([type, cats]) => {
            if (cats.length === 0) return null;
            const titles = { 'general': 'Официальные топики', 'game': 'Игровые серверы', 'random': 'Разношерстное' };
            const icons = { 'general': <Shield size={16} />, 'game': <Gamepad2 size={16} />, 'random': <Lock size={16} /> };

            return (
              <div key={type}>
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{icons[type]} {titles[type] || 'Разное'}</div>
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
              {cats.map(cat => (
                <div key={cat.id} className="cat-item" onClick={() => handleNavigation('category', cat)}>
                <div className="cat-icon">
                {cat.icon === 'shield' ? <Shield /> : cat.icon === 'gamepad' ? <Gamepad2 /> : <MessageCircle />}
                </div>
                <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>{cat.title}</div>
                <div className="text-muted" style={{ fontSize: '0.9rem' }}>{cat.description}</div>
                </div>
                <div class="open-btn"><ChevronRight className="text-muted" /></div>
                </div>
              ))}
              </div>
              </div>
            );
          })}
          </div>
        )}
        </div>

        <div className="sidebar-right">
        <div className="card" style={{ background: 'linear-gradient(145deg, var(--surface), var(--surface-h))' }}>
        <div style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}><Gamepad2 /> Лисяк</div>
        <div style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>
        Лучший сервер Minecraft (с худшим форумом)
        </div>
        <button
        className="btn btn-primary w-full"
        style={{ marginTop: 15 }}
        onClick={() => {
          handleNavigation('thread', { id: 'q62j1rjo9', title: 'Начало игры', categoryId: 'c2' });
        }}
        >
        Начать играть
        </button>
        </div>

        {/*<div className="card">
        <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: 15 }}>СТАТИСТИКА</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem' }}>
        <span>Онлайн:</span> <span style={{ color: 'var(--success)' }}>{onlineStats}</span>
        </div>
        </div>*/}
        </div>
        </div>
      )}
      </div>

      {createModalOpen && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) setCreateModalOpen(false);
        }}>
        <div className="modal">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-h)' }}>
        <h3 style={{ margin: 0 }}>Создать новую тему</h3>
        <button className="btn-ghost" style={{ padding: 4 }} onClick={() => setCreateModalOpen(false)}><X size={20} /></button>
        </div>
        <div style={{ padding: 24, overflowY: 'auto' }}>
        <label className="text-muted" style={{ fontSize: '0.85rem' }}>Заголовок</label>
        <input placeholder="Краткая суть вопроса..." value={newThreadTitle} onChange={e => setNewThreadTitle(e.target.value)} style={{ marginBottom: 20, marginTop: 5, width: '100%' }} />

        <label className="text-muted" style={{ fontSize: '0.85rem' }}>Содержание</label>
        <div style={{ marginTop: 5 }}>
        <TextEditor value={newThreadContent} onChange={setNewThreadContent} placeholder="Опишите подробно..." />
        </div>
        </div>
        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 12, justifyContent: 'flex-end', background: 'var(--surface)' }}>
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
