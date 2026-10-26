import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon, LogOutIcon, MusicIcon, PaletteIcon } from './Icons';
import { useTheme, ACCENTS } from '../context/ThemeContext';
import { initials } from '../utils/format';

export default function Navbar({ user, onLogout }) {
  const { accent, setAccent } = useTheme();
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const menuRef = useRef(null);
  const paletteRef = useRef(null);

  // Close both dropdowns when clicking anywhere else.
  useEffect(() => {
    function handleClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
      if (paletteRef.current && !paletteRef.current.contains(event.target)) {
        setPaletteOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleLogout() {
    setOpen(false);
    onLogout();
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="brand">
          <span className="brand__logo">
            <MusicIcon size={20} />
          </span>
          <span className="brand__text">
            Melody<span className="brand__dot">.</span>
          </span>
        </div>

        <div className="navbar__actions">
          <div className="navbar__right" ref={paletteRef}>
            <button
              type="button"
              className={`icon-btn icon-btn--lg ${paletteOpen ? 'is-open' : ''}`}
              onClick={() => {
                setPaletteOpen((value) => !value);
                setOpen(false);
              }}
              aria-haspopup="menu"
              aria-expanded={paletteOpen}
              aria-label="Change colour theme"
              title="Change colour theme"
            >
              <PaletteIcon size={18} />
            </button>

            {paletteOpen && (
              <div className="dropdown dropdown--palette" role="menu">
                <p className="dropdown__label">Colour theme</p>

                {ACCENTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`swatch-row ${accent === item.id ? 'is-active' : ''}`}
                    onClick={() => setAccent(item.id)}
                    role="menuitemradio"
                    aria-checked={accent === item.id}
                  >
                    <span className="swatch" style={{ background: item.swatch }} />
                    <span className="swatch-row__copy">
                      <strong>{item.label}</strong>
                      <small>{item.hint}</small>
                    </span>
                    {accent === item.id && <span className="swatch-row__check">&#10003;</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="navbar__right" ref={menuRef}>
            <button
              type="button"
              className={`user-chip ${open ? 'is-open' : ''}`}
              onClick={() => {
                setOpen((value) => !value);
                setPaletteOpen(false);
              }}
              aria-haspopup="menu"
              aria-expanded={open}
            >
              <span className="avatar">{initials(user.name)}</span>
              <span className="user-chip__meta">
                <strong>{user.name}</strong>
                <small>{user.email}</small>
              </span>
              <ChevronDownIcon size={16} className="user-chip__chevron" />
            </button>

            {open && (
              <div className="dropdown" role="menu">
                <div className="dropdown__head">
                  <span className="avatar avatar--lg">{initials(user.name)}</span>
                  <div className="dropdown__identity">
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="dropdown__item dropdown__item--danger"
                  onClick={handleLogout}
                  role="menuitem"
                >
                  <LogOutIcon size={16} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
