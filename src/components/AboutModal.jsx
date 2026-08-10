import React from 'react';
import './AboutModal.css';

const AboutModal = ({ onClose }) => {
  return (
    <div className="about-modal-overlay" onClick={onClose}>
      <div className="about-modal-content" onClick={e => e.stopPropagation()}>
        
        {/* Filigree corner decorations */}
        <img src="/gold-rose-trans.png" alt="Rose" className="about-corner top-left" />
        <img src="/gold-rose-trans.png" alt="Rose" className="about-corner top-right" />
        <img src="/gold-rose-trans.png" alt="Rose" className="about-corner bottom-left" />
        <img src="/gold-rose-trans.png" alt="Rose" className="about-corner bottom-right" />

        <button className="about-close-btn" onClick={onClose}>X</button>
        
        <div className="about-header">
          <img src="/logo.jpg" alt="Charmettes Crest" className="about-logo" />
          <h2>ABOUT THE CHARMETTES</h2>
        </div>
        
        <div className="about-scroll-body">
          <section>
            <h3>Our History</h3>
            <p>
              The Charmettes, Incorporated is a national civic organization that had its beginnings when friends <strong>Gwendolyn Baker Rodgers</strong> and <strong>Frankie Drayton Thomas</strong> recognized the need for an organization that would bring together women with similar ideas, principles and backgrounds to organize themselves to utilize their skills, talents and resources for community impact. They invited ten of their friends to join them, and on June 17, 1951, the West Palm Beach Charmettes were created.
            </p>
          </section>

          <section>
            <h3>Our Impact</h3>
            <p>
              Our chapters are engaged in programs and activities that provide assistance to individuals and families in need in areas including: education, health, scholarship, and community development. In 1981, the organization adopted a national thrust to eradicate cancer in our lifetime. In addition to our cancer awareness and education programs, we have contributed more than <strong>$1.1 Million dollars</strong> to the Howard University Cancer Center (HUCC) in Washington, D.C.
            </p>
          </section>

          <section>
            <h3>Our Mission</h3>
            <p>
              The Charmettes, Incorporated is a sisterhood of dedicated women committed to improving the quality of life within our communities through advocacy, education, service and support for cancer research.
            </p>
          </section>

          <section>
            <h3>The Charmettes Today</h3>
            <p>
              Today, The Charmettes, Incorporated is a nationally recognized women’s community service organization, known for getting results and making a difference in the lives of African Americans and their communities. With 20 chapters active throughout Florida, Georgia, North Carolina, South Carolina, Tennessee, Virginia, and Washington, D.C., we are poised for even greater accomplishments in the future.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
