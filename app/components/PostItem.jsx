import {
    MessageSquare, User, Shield, Menu, X, Sun, Moon,
    Gamepad2, Image as ImageIcon, Hash, Clock, Lock, MessageCircle,
    ChevronRight, ArrowLeft, Send, Edit3, Smile, LogOut,
    Bell, Upload, Bold, Italic, Link as LinkIcon, List, Eye, Search,
    Quote, Trash2
} from 'lucide-react';

import React, { useState, useEffect, useRef, useMemo } from 'react';

import { getSkin } from '$/utils/skins'
import { parseBBCode } from '$/utils/bbcode'
import { Avatar } from '$/utils/skins'

const VISUAL_ROLE = {
    admin: 'Персонал'
}

export const PostItem = ({ post, user, onReact, onDelete, onQuote, onEdit, openUserProfile }) => {
    const author = post.author || { name: 'Unknown', role: 'user' };
    const reactions = post.reactions || {};

    const [ isEditing, setIsEditing ] = useState(false);
    const [ editContent, setEditContent ] = useState(post.content);
    const isOwner = user?.id === post.author_id;
    const isStaff = user?.role === 'admin' || user?.role === 'moderator';

    const handleSave = async () => {
        await onEdit(post.id, editContent);
        setIsEditing(false);
    };

    const reactionEntries = Object.entries(reactions).filter(([_, ids]) => ids && ids.length > 0);

    const myReaction = Object.keys(reactions).find(emoji => reactions[emoji]?.includes(user?.id));

    console.log(author)

    return (
        <div className="animate-in card" style={{padding: 0, overflow: 'visible'}}>
            <div style={{padding: '12px 20px', background: 'var(--surface-h)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)'}}>
                <div onClick={() => openUserProfile(author.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <Avatar
                key={ author.username }
                username={ author.username }
                name={ author.name }/>
                <div style={{fontWeight: 'bold', color: 'var(--primary)'}}>{author.name}</div>
                { author.role ? (<span className={`role-badge role-${author.role}`}>{VISUAL_ROLE[author.role]}</span>) : ''}
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
                <div
                class="animate-in"
                key={emoji}
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
