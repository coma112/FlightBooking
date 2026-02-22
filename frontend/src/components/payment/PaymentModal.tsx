import { useState, useEffect, useRef } from 'react';
import './PaymentModal.css';
import type { BookingData } from '../../types/booking';
import { formatPrice } from '../../utils/priceCalculation';

interface PaymentModalProps {
  bookingReference: string;
  totalPrice: number;
  flightNumber: string;
  passengerName: string;
  onSuccess: (paymentMethod: string) => void;
  onClose: () => void;
}

type PaymentMethod = 'stripe' | 'barion' | 'apple_pay' | 'google_pay';
type Step = 'method' | 'card' | 'barion' | 'processing' | 'done';

const TEST_CARDS = [
  { number: '4242 4242 4242 4242', type: 'Visa', result: 'success', icon: '💳' },
  { number: '5555 5555 5555 4444', type: 'Mastercard', result: 'success', icon: '💳' },
  { number: '4000 0000 0000 9995', type: 'Visa (elutasítva)', result: 'decline', icon: '❌' },
];

const BARION_TEST_ACCOUNTS = [
  { email: 'buyer@barion.com', password: 'abc123', result: 'Sikeres' },
];

export default function PaymentModal({
  bookingReference,
  totalPrice,
  flightNumber,
  passengerName,
  onSuccess,
  onClose,
}: PaymentModalProps) {
  const [step, setStep] = useState<Step>('method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [barionEmail, setBarionEmail] = useState('');
  const [barionPassword, setBarionPassword] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showTestCards, setShowTestCards] = useState(false);

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setError('');
    if (method === 'apple_pay' || method === 'google_pay') {
      handleWalletPay(method);
    } else if (method === 'barion') {
      setStep('barion');
    } else {
      setStep('card');
    }
  };

  const handleWalletPay = async (method: PaymentMethod) => {
    setStep('processing');
    setProcessing(true);
    await simulateProcessing(1800);
    await confirmPayment(method);
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const digits = cardNumber.replace(/\s/g, '');
    if (digits.length < 16) return setError('Érvénytelen kártyaszám!');
    if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) return setError('Érvénytelen lejárati dátum! (HH/ÉÉ)');
    if (cardCvc.length < 3) return setError('Érvénytelen CVC kód!');
    if (!cardName.trim()) return setError('Adja meg a kártyán szereplő nevet!');

    if (digits === '4000000000009995') {
      setError('❌ A kártya elutasítva. Próbáljon másik kártyával.');
      return;
    }

    setStep('processing');
    setProcessing(true);
    await simulateProcessing(2200);
    await confirmPayment('stripe');
  };

  const handleBarionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!barionEmail.includes('@')) return setError('Érvénytelen email cím!');
    if (barionEmail === 'error@barion.com') {
      setError('❌ Barion fizetés sikertelen. Ellenőrizze az adatokat!');
      return;
    }

    setStep('processing');
    setProcessing(true);
    await simulateProcessing(2000);
    await confirmPayment('barion');
  };

  const simulateProcessing = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const confirmPayment = async (method: string) => {
    try {
      const response = await fetch('http://localhost:8081/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingReference,
          paymentMethod: method,
          paymentIntentId: 'pi_test_' + Date.now(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setStep('done');
        setTimeout(() => onSuccess(method), 1500);
      } else {
        setError(data.message || 'Hiba történt a fizetés során');
        setStep(method === 'barion' ? 'barion' : 'card');
      }
    } catch {
      setStep('done');
      setTimeout(() => onSuccess(method), 1500);
    } finally {
      setProcessing(false);
    }
  };

  const fillTestCard = (card: typeof TEST_CARDS[0]) => {
    setCardNumber(card.number);
    setCardExpiry('12/26');
    setCardCvc('123');
    setCardName('Test Utas');
    setShowTestCards(false);
  };

  return (
    <div className="payment-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>

        <div className="pm-header">
          <div className="pm-header-left">
            <span className="pm-logo">✈️ SkyBooker Pay</span>
            <span className="pm-ref">#{bookingReference}</span>
          </div>
          <button className="pm-close" onClick={onClose}>✕</button>
        </div>

        <div className="pm-amount-strip">
          <div className="pm-amount-info">
            <span className="pm-flight-label">{flightNumber} • {passengerName}</span>
            <span className="pm-amount">{formatPrice(totalPrice)}</span>
          </div>
          <div className="pm-secure">🔒 Biztonságos fizetés</div>
        </div>

        <div className="pm-body">

          {step === 'method' && (
            <div className="pm-methods">
              <p className="pm-methods-title">Válasszon fizetési módot</p>

              <div className="pm-test-notice">
                <span>🧪</span>
                <div>
                  <strong>Teszt mód aktív</strong> – Valódi összeg nem kerül levonásra!
                  <br />Teszt kártyaszám: <code>4242 4242 4242 4242</code>
                </div>
              </div>

              <div className="pm-method-grid">
                <button
                  className="pm-method-btn"
                  onClick={() => handleMethodSelect('stripe')}
                >
                  <div className="pm-method-icon stripe-icon">
                    <svg viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <text x="0" y="20" font-size="22" font-weight="800" fill="#635BFF">stripe</text>
                    </svg>
                  </div>
                  <span className="pm-method-label">Bankkártya</span>
                  <span className="pm-method-sub">Visa, Mastercard, Amex</span>
                </button>

                <button
                  className="pm-method-btn"
                  onClick={() => handleMethodSelect('barion')}
                >
                  <div className="pm-method-icon barion-icon">
                    <span style={{ fontSize: '22px', fontWeight: 800, color: '#703CFF', letterSpacing: '-1px' }}>Barion</span>
                  </div>
                  <span className="pm-method-label">Barion</span>
                  <span className="pm-method-sub">Magyar fizetési tárca</span>
                </button>

                <button
                  className="pm-method-btn apple-btn"
                  onClick={() => handleMethodSelect('apple_pay')}
                >
                  <div className="pm-method-icon">
                    <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                    </svg>
                  </div>
                  <span className="pm-method-label">Apple Pay</span>
                  <span className="pm-method-sub">Face ID / Touch ID</span>
                </button>

                <button
                  className="pm-method-btn google-btn"
                  onClick={() => handleMethodSelect('google_pay')}
                >
                  <div className="pm-method-icon google-icon">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <span className="pm-method-label">Google Pay</span>
                  <span className="pm-method-sub">Google fizetés</span>
                </button>
              </div>
            </div>
          )}

          {step === 'card' && (
            <form className="pm-card-form" onSubmit={handleCardSubmit}>
              <div className="pm-form-header">
                <button type="button" className="pm-back" onClick={() => setStep('method')}>← Vissza</button>
                <span className="pm-form-title">💳 Bankkártya adatok</span>
              </div>

              <div className="pm-test-cards-toggle">
                <button type="button" onClick={() => setShowTestCards(!showTestCards)} className="pm-test-toggle-btn">
                  🧪 Teszt kártyák {showTestCards ? '▲' : '▼'}
                </button>
                {showTestCards && (
                  <div className="pm-test-cards">
                    {TEST_CARDS.map((card) => (
                      <button
                        key={card.number}
                        type="button"
                        className="pm-test-card-item"
                        onClick={() => fillTestCard(card)}
                      >
                        <span>{card.icon} {card.type}</span>
                        <code>{card.number}</code>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pm-visual-card">
                <div className="pm-card-chip">⬛</div>
                <div className="pm-card-number-display">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>
                <div className="pm-card-bottom">
                  <div>
                    <div className="pm-card-sub">Kártyabirtokos</div>
                    <div className="pm-card-val">{cardName || 'TELJES NÉV'}</div>
                  </div>
                  <div>
                    <div className="pm-card-sub">Lejárat</div>
                    <div className="pm-card-val">{cardExpiry || 'HH/ÉÉ'}</div>
                  </div>
                </div>
              </div>

              <div className="pm-field-group">
                <label className="pm-label">Kártyaszám</label>
                <input
                  className="pm-input"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  autoComplete="cc-number"
                />
              </div>

              <div className="pm-field-row">
                <div className="pm-field-group">
                  <label className="pm-label">Lejárati dátum</label>
                  <input
                    className="pm-input"
                    type="text"
                    placeholder="HH/ÉÉ"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                    autoComplete="cc-exp"
                  />
                </div>
                <div className="pm-field-group">
                  <label className="pm-label">CVC</label>
                  <input
                    className="pm-input"
                    type="text"
                    placeholder="123"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    autoComplete="cc-csc"
                  />
                </div>
              </div>

              <div className="pm-field-group">
                <label className="pm-label">Kártyabirtokos neve</label>
                <input
                  className="pm-input"
                  type="text"
                  placeholder="KOVÁCS ANNA"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  autoComplete="cc-name"
                />
              </div>

              {error && <div className="pm-error">{error}</div>}

              <button type="submit" className="pm-pay-btn">
                🔒 Fizetés most – {formatPrice(totalPrice)}
              </button>

              <div className="pm-brands">
                <span title="Visa">VISA</span>
                <span title="Mastercard">MC</span>
                <span title="American Express">AMEX</span>
                <span title="Secured by Stripe">🔒 Stripe</span>
              </div>
            </form>
          )}

          {step === 'barion' && (
            <form className="pm-card-form" onSubmit={handleBarionSubmit}>
              <div className="pm-form-header">
                <button type="button" className="pm-back" onClick={() => setStep('method')}>← Vissza</button>
                <span className="pm-form-title">Barion bejelentkezés</span>
              </div>

              <div className="pm-barion-logo">
                <div className="pm-barion-badge">
                  <span style={{ fontSize: 28, fontWeight: 800, color: '#703CFF' }}>Barion</span>
                </div>
                <p className="pm-barion-sub">Adja meg Barion fiókja adatait</p>
              </div>

              <div className="pm-test-cards-toggle">
                <button type="button" onClick={() => setShowTestCards(!showTestCards)} className="pm-test-toggle-btn">
                  🧪 Teszt fiók adatok {showTestCards ? '▲' : '▼'}
                </button>
                {showTestCards && (
                  <div className="pm-test-cards">
                    {BARION_TEST_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        className="pm-test-card-item"
                        onClick={() => { setBarionEmail(acc.email); setBarionPassword(acc.password); setShowTestCards(false); }}
                      >
                        <span>👤 {acc.email}</span>
                        <code>Jelszó: {acc.password}</code>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pm-field-group">
                <label className="pm-label">Email cím</label>
                <input
                  className="pm-input"
                  type="email"
                  placeholder="barion@example.com"
                  value={barionEmail}
                  onChange={(e) => setBarionEmail(e.target.value)}
                />
              </div>

              <div className="pm-field-group">
                <label className="pm-label">Jelszó</label>
                <input
                  className="pm-input"
                  type="password"
                  placeholder="••••••••"
                  value={barionPassword}
                  onChange={(e) => setBarionPassword(e.target.value)}
                />
              </div>

              {error && <div className="pm-error">{error}</div>}

              <button type="submit" className="pm-pay-btn barion-pay-btn">
                Fizetés Barionnal – {formatPrice(totalPrice)}
              </button>
            </form>
          )}

          {step === 'processing' && (
            <div className="pm-processing">
              <div className="pm-spinner" />
              <p className="pm-processing-title">Fizetés feldolgozása...</p>
              <p className="pm-processing-sub">Kérjük, ne zárja be ezt az ablakot</p>
              <div className="pm-processing-steps">
                <div className="pm-step done">✓ Foglalás ellenőrzése</div>
                <div className="pm-step active">⟳ Fizetés feldolgozása</div>
                <div className="pm-step">◌ Visszaigazolás küldése</div>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="pm-success">
              <div className="pm-success-icon">✅</div>
              <h2 className="pm-success-title">Sikeres fizetés!</h2>
              <p className="pm-success-sub">Visszaigazoló emailt küldtünk az Ön email címére</p>
              <div className="pm-success-ref">#{bookingReference}</div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}