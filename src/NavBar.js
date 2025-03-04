import logo from "./MATCHA.svg" // Import the default logo image
import mobileLogo from "./MOBILE_MATCHA.svg" // Import the mobile logo image
import icon1 from "./assets/ask.svg" // Import the first icon
import icon2 from "./assets/settings.svg" // Import the second icon
import icon3 from "./assets/music.svg" // Import the third icon
import icon4 from "./assets/music-mute.svg" // Import the fourth icon
import "./NavBar.css" // Import the CSS for the NavBar

const NavBar = ({ onIcon1Click, onIcon2Click, onIcon3Click, isMuted }) => {
  // Check if device is mobile
  const isMobile = window.innerWidth <= 768

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <a href="/">
          <img src={logo || "/placeholder.svg"} alt="Matcha Logo" className="desktop-logo" />
        </a>
        <a href="/">
          <img src={mobileLogo || "/placeholder.svg"} alt="Matcha Mobile Logo" className="mobile-logo" />
        </a>
      </div>
      <div className="navbar-icons">
        <img
          src={icon1 || "/placeholder.svg"}
          alt="How to Play"
          className="navbar-icon"
          onClick={onIcon1Click}
          title="How to Play"
        />
        <img
          src={icon2 || "/placeholder.svg"}
          alt="Select Difficulty"
          className="navbar-icon"
          onClick={onIcon2Click}
          title="Select Difficulty"
        />
        <img
          src={(isMuted ? icon4 : icon3) || "/placeholder.svg"}
          alt={isMuted ? "Music Muted" : "Music"}
          className="navbar-icon"
          onClick={onIcon3Click}
          title={isMuted ? "Unmute Music" : "Mute Music"}
        />
      </div>
    </nav>
  )
}

export default NavBar

