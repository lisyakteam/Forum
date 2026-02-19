import {
    MessageSquare, User, Shield, Menu, X, Sun, Moon,
    Gamepad2, Image as ImageIcon, Hash, Clock, Lock, MessageCircle,
    ChevronRight, ArrowLeft, Send, Edit3, Smile, LogOut,
    Bell, Upload, Bold, Italic, Link as LinkIcon, List, Eye, Search,
    Quote, Trash2
} from 'lucide-react';

import React, { useState, useEffect, useRef, useMemo } from 'react';

export const AuthScreen = ({ onLogin, onRegister, onGuest }) => {
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

    return (<>
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
    </>);
};
