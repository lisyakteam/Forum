import {
    MessageSquare, User, Shield, Menu, X, Sun, Moon,
    Gamepad2, Image as ImageIcon, Hash, Clock, Lock, MessageCircle,
    ChevronRight, ArrowLeft, Send, Edit3, Smile, LogOut,
    Bell, Upload, Bold, Italic, Link as LinkIcon, List, Eye, Search,
    Quote, Trash2
} from 'lucide-react';

export const Pagination = ({ current, totalItems, limit = 10, onChange }) => {
    const totalPages = Math.ceil(totalItems / limit);

    if (totalPages <= 1) return null;

    return <>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px', justifyContent: 'center' }}>
        <button
        className="btn btn-secondary"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        style={{ padding: '6px 12px' }}
        >
        <ArrowLeft size={16} /> Назад
        </button>

        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>
        Страница {current} из {totalPages}
        </span>

        <button
        className="btn btn-secondary"
        disabled={current === totalPages}
        onClick={() => onChange(current + 1)}
        style={{ padding: '6px 12px' }}
        >
        Вперед <ChevronRight size={16} />
        </button>
        </div>
    </>;
};
