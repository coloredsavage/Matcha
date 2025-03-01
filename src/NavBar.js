import React from 'react';
import logo from './MATCHA.svg'; // Import the default logo image
import mobileLogo from './MOBILE_MATCHA.svg'; // Import the mobile logo image
import icon1 from './assets/ask.svg'; // Import the first icon
import icon2 from './assets/settings.svg'; // Import the second icon
import icon3 from './assets/music.svg'; // Import the third icon
import './NavBar.css'; // Import the CSS for the NavBar

const NavBar = ({ onIcon1Click, onIcon2Click }) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <a href="/">
          <img src={logo} alt="Matcha Logo" className="desktop-logo" />
        </a>
        <a href="/">
          <img src={mobileLogo} alt="Matcha Mobile Logo" className="mobile-logo" />
        </a>
      </div>
      <div className="navbar-icons">
        <img src={icon1} alt="Icon 1" className="navbar-icon" onClick={onIcon1Click} />
        <img src={icon2} alt="Icon 2" className="navbar-icon" onClick={onIcon2Click} />
        <img src={icon3} alt="Icon 3" className="navbar-icon" />
      </div>
    </nav>
  );
};

export default NavBar;