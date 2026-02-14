import './PopularRoutes.css';
import { FaArrowRight } from "react-icons/fa6";

interface Route {
  from: string;
  to: string;
  fromCode: string;
  toCode: string;
  price: string;
  image: string;
}

const PopularRoutes = () => {
  const routes: Route[] = [
    {
      from: 'Budapest',
      to: 'London',
      fromCode: 'BUD',
      toCode: 'LHR',
      price: '25.900 Ft',
      image: '🇬🇧'
    },
    {
      from: 'Budapest',
      to: 'Párizs',
      fromCode: 'BUD',
      toCode: 'CDG',
      price: '28.500 Ft',
      image: '🇫🇷'
    },
    {
      from: 'Budapest',
      to: 'Barcelona',
      fromCode: 'BUD',
      toCode: 'BCN',
      price: '31.200 Ft',
      image: '🇪🇸'
    },
    {
      from: 'Budapest',
      to: 'Róma',
      fromCode: 'BUD',
      toCode: 'FCO',
      price: '29.800 Ft',
      image: '🇮🇹'
    },
    {
      from: 'Budapest',
      to: 'Amszterdam',
      fromCode: 'BUD',
      toCode: 'AMS',
      price: '27.300 Ft',
      image: '🇳🇱'
    },
    {
      from: 'Budapest',
      to: 'Bécs',
      fromCode: 'BUD',
      toCode: 'VIE',
      price: '18.900 Ft',
      image: '🇦🇹'
    },
  ];

  const handleRouteClick = (route: Route) => {
    console.log('Selected route:', route);
    // Itt majd be lesz állítva a search form
    alert(`${route.from} → ${route.to} útvonal kiválasztva!`);
  };

  return (
    <section className="popular-routes">
      <div className="popular-routes-container">
        <h2 className="section-title">
          Népszerű útvonalak
        </h2>
        <p className="section-subtitle">
          Fedezze fel a legkedveltebb célállomásokat kedvező árakon
        </p>

        <div className="routes-grid">
          {routes.map((route, index) => (
            <div
              key={index}
              className="route-card"
              onClick={() => handleRouteClick(route)}
            >
              <div className="route-flag">{route.image}</div>
              <div className="route-info">
                <div className="route-cities">
                  <span className="from">{route.from}</span>
                  <span className="arrow"><FaArrowRight /></span>
                  <span className="to">{route.to}</span>
                </div>
                <div className="route-codes">
                  {route.fromCode} - {route.toCode}
                </div>
              </div>
              <div className="route-price">
                <span className="price-label">-tól</span>
                <span className="price-value">{route.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularRoutes;