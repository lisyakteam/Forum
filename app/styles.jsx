export const MainTheme = () => (
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
