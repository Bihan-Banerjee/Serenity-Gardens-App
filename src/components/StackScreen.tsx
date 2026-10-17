import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import Icon from './Icon';

export default function StackScreen({ title, children }: { title: string; children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="stack-screen route-slide">
      <header className="stack-header">
        <button className="stack-back" onClick={() => navigate(-1)} aria-label="Back"><Icon name="chevron-left" size={26} /></button>
        <h1>{title}</h1>
        <span className="stack-spacer" />
      </header>
      <main className="stack-body">{children}</main>
    </div>
  );
}
