import './Navbar.css';

const Navbar = () => {
    const handleHomeClick = () => {
        // Simple page reload to go back to home
        window.location.reload();
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo" onClick={handleHomeClick} style={{ cursor: 'pointer' }}>
                    <span className="logo-text">SkyBooker</span>
                </div>
                <ul className="navbar-links">
                    <li><a onClick={handleHomeClick} className="nav-link active" style={{ cursor: 'pointer' }}>Járatok keresése</a></li>
                    <li><a href="#bookings" className="nav-link">Foglalásaim</a></li>
                    <li><a href="#contact" className="nav-link">Kapcsolat</a></li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;