import {
    MessageSquare, User, Shield, Menu, X, Sun, Moon,
    Gamepad2, Image as ImageIcon, Hash, Clock, Lock, MessageCircle,
    ChevronRight, ArrowLeft, Send, Edit3, Smile, LogOut,
    Bell, Upload, Bold, Italic, Link as LinkIcon, List, Eye, Search,
    Quote, Trash2
} from 'lucide-react';

import React, { useState, useEffect, useRef, useMemo } from 'react';

import { SkinViewer3D } from '$/components/SkinViewer'
import { TextEditor } from '$/components/TextEditor'
import { getSkin } from '$/utils/skins'

export const ProfileSettings = ({ user, onUpdate, onBack }) => {
    const [ form, setForm ] = useState({ ...user });

    const [ previewName, setPreviewName ] = useState(user.name);
    const [ username, setUsername ] = useState(user.username);
    const [ skinUrl, setSkinUrl ] = useState(null)

    const handleBlur = () => {
        setPreviewName(form.name);
        setUsername(form.username);
    };

    useEffect(() => {
        if (!username) return;

        (async() => {
            const skin = await getSkin(username)
            console.log('got skin', skin)
            setSkinUrl(skin)
        })();
        return () => {}
    }, [ username ])

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
        Предпросмотр {username}
        </div>
        </div>

        <div className="card">
        <h3>Настройки</h3>

        <div className="profile-field">
        <label>Отображаемое имя</label>
        <input
        value={form.name || ''}
        onChange={e => setForm({...form, name: e.target.value})}
        onBlur={handleBlur}
        />
        </div>

        <div className="profile-field">
        <label>
        Игровой никнейм
        {!!user.game_linked && (
            <span style={{color: 'var(--success)', marginLeft: 8}}>
            (привязан)
            </span>
        )}
        </label>
        <input
        value={form.username || ''}
        onChange={e => setForm({...form, username: e.target.value})}
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
