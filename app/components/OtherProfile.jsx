import { SkinViewer3D } from './SkinViewer'
import { parseBBCode } from '$/utils/bbcode'

import { ArrowLeft } from 'lucide-react';

export const OtherProfile = ({ setView, viewingUser }) => {
    return <div className="animate-in">
        <button className="btn btn-ghost" onClick={() => setView('forum')}><ArrowLeft /> Назад</button>
        <div className="profile-layout">
        <div className="card" style={{ textAlign: 'center' }}>
            <SkinViewer3D skinUrl={`https://minotar.net/skin/${viewingUser.game_nick || viewingUser.name}`} />
            <h2>{viewingUser.name}</h2>
            <span className={`role-badge role-${viewingUser.role}`}>{viewingUser.role}</span>
        </div>
        <div className="card">
        <p><b>Игровой ник:</b> {viewingUser.game_nick || 'Не указан'}</p>
        <p>Имейте в виду: ники <b>не проверяются!</b></p>
            <div className="signature-box">
                {parseBBCode(viewingUser.signature)}
            </div>
            </div>
        </div>
    </div>
}
