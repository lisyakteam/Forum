import {
    MessageSquare, User, Shield, Menu, X, Sun, Moon,
    Gamepad2, Image as ImageIcon, Hash, Clock, Lock, MessageCircle,
    ChevronRight, ArrowLeft, Send, Edit3, Smile, LogOut,
    Bell, Upload, Bold, Italic, Link as LinkIcon, List, Eye, Search,
    Quote, Trash2
} from 'lucide-react';

import React, { useState, useEffect, useRef, useMemo } from 'react';

export const TextEditor = ({ value, onChange, placeholder }) => {
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
        <div class="animate-in" style={{border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--bg)'}}>
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
