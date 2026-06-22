import React from 'react';

function Header({ title }) {
  return (
    <header className="header">
      <h1>{title}</h1>
      <p>Built with React + Vite</p>
    </header>
  );
}

export default Header;
