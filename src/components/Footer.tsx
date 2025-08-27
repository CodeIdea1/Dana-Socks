import ContactSection from './ContactSection';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            {/* الجزء العلوي الأبيض */}
            <div className={styles.topSection}>
                <div className={styles.container}>
                    <div className={styles.topContent}>
                        <div className={styles.getInTouch}>
                            <h2>GET IN TOUCH</h2>
                            <p>
                                Lorem Ipsum has been the industry's standard dummy text
                                ever since the 1500s, when an unknown printer took a
                                galley of type and scrambled it to make a type specimen book.
                            </p>

                            <div className={styles.contactInfo}>
                                <div className={styles.contactItem}>
                                    <div className={styles.contactIcon}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                        </svg>
                                    </div>
                                    <span>hello@youremail.com</span>
                                </div>

                                <div className={styles.contactItem}>
                                    <div className={styles.contactIcon}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                                        </svg>
                                    </div>
                                    <span>+1 779 774 6773</span>
                                </div>

                                <div className={styles.contactItem}>
                                    <div className={styles.contactIcon}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                        </svg>
                                    </div>
                                    <span>Golden Tower 404/A, Dhaka, City, Bangladesh</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* نموذج الاتصال في المنتصف */}
                <div className={styles.contactFormWrapper}>
                    <ContactSection />
                </div>
            </div>

            {/* الجزء السفلي الأحمر */}
            <div className={styles.bottomSection}>
                {/* الخلفية مع النصوص الكبيرة */}
                <div className={styles.backgroundText}>
                    AASHA
                </div>

                <div className={styles.container}>


                    <h1>DANA</h1>
                    <div className={styles.bottomContent}>


                        <div className={styles.aboutSection}>
                            <div className={styles.aboutTitle}>ABOUT US</div>
                            <p className={styles.aboutText}>
                                AASHA is a team of experienced designers and strategists
                                that we've learned a lot about the great work
                                that's been done.
                            </p>
                        </div>

                        <div className={styles.aboutSection}>
                            <div className={styles.aboutTitle}>ABOUT US</div>
                            <p className={styles.aboutText}>
                                AASHA is a team of experienced designers and strategists
                                that we've learned a lot about the great work
                                that's been done.
                            </p>
                        </div>
                    </div>

                    <div>
                        {/* القائمة السفلية */}
                        <nav className={styles.bottomNav}>

                            <a href="/" className={styles.navLink}>HOME</a>
                            <a href="/portfolio" className={styles.navLink}>PORTFOLIO</a>
                            <a href="/services" className={styles.navLink}>SERVICES</a>
                            <a href="/team" className={styles.navLink}>TEAM MEMBER</a>
                            <a href="/client" className={styles.navLink}>CLIENT</a>
                            <a href="/contact" className={styles.navLink}>CONTACT</a>
                        </nav>
                    </div>
                </div>
            </div>
        </footer >
    );
}