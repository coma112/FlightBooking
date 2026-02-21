import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import CustomSelect from '../components/common/CustomSelect';
import './ContactPage.css';

import {
    FaPhone, FaEnvelope, FaMapMarkerAlt,
    FaClock, FaHeadset, FaSpinner, FaCheck, FaPaperPlane
} from 'react-icons/fa';

import { MdChat, MdFlight, MdSupportAgent } from 'react-icons/md';

interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

const SUBJECT_OPTIONS = [
  { value: 'booking',   label: 'Foglalással kapcsolatos kérdés', icon: '✈️' },
  { value: 'cancel',    label: 'Lemondás / módosítás',           icon: '🔄' },
  { value: 'payment',   label: 'Fizetéssel kapcsolatos probléma',icon: '💳' },
  { value: 'technical', label: 'Technikai probléma',             icon: '🔧' },
  { value: 'other',     label: 'Egyéb kérdés',                   icon: '💬' },
];

const ContactPage = () => {
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof ContactFormData, boolean>>>({});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const validateField = (name: keyof ContactFormData, value: string): string | null => {
        switch (name) {
            case 'name':
                if (!value.trim()) return 'Kötelező mező!';
                if (value.trim().length < 2) return 'Legalább 2 karakter szükséges';
                return null;
            case 'email':
                if (!value.trim()) return 'Kötelező mező!';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Érvénytelen email cím!';
                return null;
            case 'subject':
                if (!value.trim()) return 'Kérjük, válasszon témát!';
                return null;
            case 'message':
                if (!value.trim()) return 'Kötelező mező!';
                if (value.trim().length < 10) return 'Az üzenet legalább 10 karakter legyen!';
                return null;
            
            default:
                return null;
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name as keyof ContactFormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const fieldName = name as keyof ContactFormData;

        setTouched(prev => ({ ...prev, [fieldName]: true }));

        const error = validateField(fieldName, value);
        setErrors(prev => ({ ...prev, [fieldName]: error ?? undefined }));
    };

    const handleSubjectChange = (value: string) => {
        setFormData(prev => ({ ...prev, subject: value }));
        setTouched(prev => ({ ...prev, subject: true }));
        
        const error = validateField('subject', value);

        setErrors(prev => ({ ...prev, subject: error ?? undefined }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const allTouched: Partial<Record<keyof ContactFormData, boolean>> = {
            name: true, email: true, subject: true, message: true,
        };

        setTouched(allTouched);

        const newErrors: Partial<Record<keyof ContactFormData, string>> = {};
        let isValid = true;

        (Object.keys(formData) as (keyof ContactFormData)[]).forEach(field => {
            const error = validateField(field, formData[field]);

            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);

        if (!isValid) return;

        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1800));
        setLoading(false);
        setSubmitted(true);
    };

    const handleReset = () => {
        setFormData({ name: '', email: '', subject: '', message: '' });
        setErrors({});
        setTouched({});
        setSubmitted(false);
    };

    return (
        <div className="contact-page">
            <Navbar />

            <main className="contact-main">
                <div className="contact-header">
                    <div className="contact-header-content">
                        <h1 className="contact-page-title">Kapcsolat</h1>
                        <p className="contact-page-subtitle">
                            Kérdése van? Csapatunk 24/7 rendelkezésére áll.<br />
                            Írjon nekünk, vagy hívjon minket!
                        </p>
                    </div>
                </div>

                <div className="contact-content">
                    <div className="contact-info-card">
                        <div className="contact-info-header">
                            <h2>Elérhetőségeink</h2>
                        </div>
                        <div className="contact-info-body">
                            <div className="contact-info-item">
                                <div className="contact-info-icon-wrap">
                                    <FaPhone className="contact-info-icon" />
                                </div>
                                <div className="contact-info-text">
                                    <span className="contact-info-label">Telefon</span>
                                    <span className="contact-info-value">+36 1 234 5678</span>
                                </div>
                            </div>

                            <div className="contact-info-item">
                                <div className="contact-info-icon-wrap">
                                    <FaEnvelope className="contact-info-icon" />
                                </div>
                                <div className="contact-info-text">
                                    <span className="contact-info-label">Email</span>
                                    <span className="contact-info-value">info@skybooker.hu</span>
                                </div>
                            </div>

                            <div className="contact-info-item">
                                <div className="contact-info-icon-wrap">
                                    <FaMapMarkerAlt className="contact-info-icon" />
                                </div>
                                <div className="contact-info-text">
                                    <span className="contact-info-label">Cím</span>
                                    <span className="contact-info-value">1051 Budapest, Váci út 12.</span>
                                </div>
                            </div>

                            <div className="contact-info-item">
                                <div className="contact-info-icon-wrap">
                                    <FaHeadset className="contact-info-icon" />
                                </div>
                                <div className="contact-info-text">
                                    <span className="contact-info-label">Ügyfélszolgálat</span>
                                    <span className="contact-info-value">0-24 chat és email</span>
                                </div>
                            </div>

                            <div className="opening-hours">
                                <h3>
                                    <FaClock style={{ marginRight: '0.4rem', color: '#0078D4' }} />
                                    Telefonos ügyfélszolgálat
                                </h3>

                                <div className="hours-row">
                                    <span className="hours-day">Hétfő - Péntek</span>
                                    <span className="hours-time">08:00 - 20:00</span>
                                </div>

                                <div className="hours-row">
                                    <span className="hours-day">Szombat</span>
                                    <span className="hours-time">09:00 - 17:00</span>
                                </div>

                                <div className="hours-row">
                                    <span className="hours-day">Vasárnap</span>
                                    <span className="hours-time">Zárva</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-card">
                        <div className="contact-form-header">
                            <h2>Írjon nekünk</h2>
                        </div>

                        <div className="contact-form-body">
                            {submitted ? (
                                <div className="cf-success">
                                    <div className="cf-success-icon">
                                        <FaCheck />
                                    </div>

                                    <h3>Üzenet elküldve</h3>
                                    <p>
                                        Köszönjük megkeresését! Csapatunk 24 órán belül
                                        felveszi Önnel a kapcsolatot a megadott email címen.
                                    </p>

                                    <button className="cf-reset-btn" onClick={handleReset}>
                                        Új üzenet küldése
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} noValidate>
                                    <div className="cf-form-group">
                                        <label htmlFor="cf-name" className="cf-label">
                                            Teljes név <span className="cf-required">*</span>
                                        </label>
                                        <input
                                            id="cf-name"
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Kovács Anna"
                                            disabled={loading}
                                            className={`cf-input ${touched.name && errors.name ? 'cf-input-error' : ''}`}
                                        />

                                        {touched.name && errors.name && (
                                            <span className="cf-error">{errors.name}</span>
                                        )}
                                    </div>

                                    <div className="cf-form-group">
                                        <label htmlFor="cf-email" className="cf-label">
                                            Email cím <span className="cf-required">*</span>
                                        </label>
                                        <input
                                            id="cf-email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="anna.kovacs@example.com"
                                            disabled={loading}
                                            className={`cf-input ${touched.email && errors.email ? 'cf-input-error' : ''}`}
                                        />

                                        {touched.email && errors.email && (
                                            <span className="cf-error">{errors.email}</span>
                                        )}
                                    </div>

                                    <div className="cf-form-group">
                                        <label htmlFor="cf-subject" className="cf-label">
                                            Tárgy <span className="cf-required">*</span>
                                        </label>
                                        
                                        <CustomSelect 
                                            options={SUBJECT_OPTIONS}
                                            value={formData.subject}
                                            onChange={handleSubjectChange}
                                            placeholder="Válasszon témát"
                                            disabled={loading}
                                        />
                                        {touched.subject && errors.subject && (
                                            <span className="cf-error">{errors.subject}</span>
                                        )}
                                    </div>

                                    <div className="cf-form-group">
                                        <label htmlFor="cf-message" className="cf-label">
                                            Üzenet <span className="cf-required">*</span>
                                        </label>
                                        <textarea
                                            id="cf-message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Írja le kérdését vagy problémáját"
                                            disabled={loading}
                                            className={`cf-input ${touched.message && errors.message ? 'cf-input-error' : ''}`}
                                        />

                                        {touched.message && errors.message && (
                                            <span className="cf-error">{errors.message}</span>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        className="cf-submit-btn"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <FaSpinner className="cf-spinner" />
                                                Küldés folyamatban
                                            </>
                                        ) : (
                                            <>
                                                <FaPaperPlane />
                                                Üzenes küldése
                                            </>
                                        )}
                                    </button>
                                    </form>
                            )}
                        </div>
                    </div>
                </div>

                <div className="contact-quick-section">
                    <h2>Azonnali segítség</h2>
                    <div className="quick-contact-grid">
                        <div className="quick-contact-card">
                            <FaPhone className="quick-contact-card-icon" />
                            <h3>Telefon</h3>
                            <p>+36 1 234 5678<br />Hétfő-Péntek 8-20 óráig</p>
                        </div>

                        <div className="quick-contact-card">
                            <FaEnvelope className="quick-contact-card-icon" />
                            <h3>Email</h3>
                            <p>info@skybooker.hu<br />24 órán belül válaszolunk</p>
                        </div>

                        <div className="quick-contact-card">
                            <MdChat className="quick-contact-card-icon" />
                            <h3>Live Chat</h3>
                            <p>Azonnal elérhető<br />0-24 online chat</p>
                        </div>

                        <div className="quick-contact-card">
                            <MdFlight className="quick-contact-card-icon" />
                            <h3>Repülőtéri iroda</h3>
                            <p>Budapest Liszt Ferenc<br />Terminal 2B · 5-22 óráig</p>
                        </div>

                        <div className="quick-contact-card">
                            <MdSupportAgent className="quick-contact-card-icon" />
                            <h3>Sürgős esetben</h3>
                            <p>+36 70 999 8877<br />Heti 7 nap, 24 óra</p>
                        </div>

                        <div className="quick-contact-card">
                            <FaHeadset className="quick-contact-card-icon" />
                            <h3>Vállalati ügyfelek</h3>
                            <p>corporate@skybooker.hu<br />Dedikált ügyintéző</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ContactPage;