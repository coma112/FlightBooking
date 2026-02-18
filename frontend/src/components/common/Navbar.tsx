import './Navbar.css';

const Navbar = () => {
    const navigate = (page: string) => {
        const nav = (window as unknown as Record<string, unknown>).__navigateTo;

        if (typeof nav === 'function') {
            (nav as (p: string) => void)(page);
        } else {
            window.location.reload();
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo" onClick={() => navigate('home')} style={{ cursor: 'pointer' }}>
                    <span className="logo-text">SkyBooker</span>
                </div>
                <ul className="navbar-links">
                    <li><a onClick={() => navigate('home')} className="nav-link active" style={{ cursor: 'pointer' }}>Járatok keresése</a></li>
                    <li><a onClick={() => navigate('my-bookings')} className="nav-link active" style={{ cursor: 'pointer' }}>Foglalásaim</a></li>
                    <li><a href="#contact" className="nav-link">Kapcsolat</a></li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;