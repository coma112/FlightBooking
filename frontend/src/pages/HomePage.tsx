import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import FlightSearchForm, { type SearchParams } from '../components/flight/FlightSearchForm';
import PopularRoutes from '../components/flight/PopularRoutes';
import './HomePage.css';
import { MdOutlinePriceCheck, MdContactPhone } from "react-icons/md";
import { FaStopwatch } from "react-icons/fa";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { RiGlobalLine } from "react-icons/ri";
import { GiFlexibleStar } from "react-icons/gi";

interface HomePageProps {
  onSearch: (params: SearchParams) => void;
}

const HomePage = ({ onSearch }: HomePageProps) => {
  return (
    <div className="home-page">
      <Navbar />
      
      <main>
        <section className="hero-section">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1 className="hero-title">
              Találja meg álmai járatát
            </h1>
            <p className="hero-subtitle">
              Fedezze fel a világot kedvező árakon. Több száz útvonal, egyszerű foglalás.
            </p>
            
            <div className="search-form-container">
              <FlightSearchForm onSearch={onSearch} />
            </div>
          </div>
        </section>

        <PopularRoutes />

        <section className="features-section">
          <div className="features-container">
            <h2 className="section-title">Miért válasszon minket?</h2>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon"><MdOutlinePriceCheck /></div>
                <h3>Legjobb árak</h3>
                <p>Garantáljuk a legkedvezőbb árakat. Early bird kedvezmények és speciális ajánlatok.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon"><FaStopwatch /></div>
                <h3>Gyors foglalás</h3>
                <p>Mindössze néhány kattintással lefoglalhatja járatát. Egyszerű és biztonságos folyamat.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon"><IoShieldCheckmarkSharp /></div>
                <h3>Biztonság</h3>
                <p>Adatai biztonságban vannak. SSL titkosítás és biztonságos fizetési módok.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon"><RiGlobalLine /></div>
                <h3>Globális lefedettség</h3>
                <p>Több száz célállomás világszerte. Európa legnagyobb repülőterei elérhetőek.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon"><MdContactPhone /></div>
                <h3>24/7 támogatás</h3>
                <p>Ügyfélszolgálatunk mindig rendelkezésére áll. Email, telefon és chat support.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon"><GiFlexibleStar /></div>
                <h3>Rugalmas lemondás</h3>
                <p>Ingyenes lemondási lehetőség. Foglalását bármikor módosíthatja vagy törölheti.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-section">
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-number">1M+</div>
              <div className="stat-label">Elégedett utas</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Útvonal</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Ország</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Ügyfélszolgálat</div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;