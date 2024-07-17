import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/i18n';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons'; // Icône globe pour le sélecteur de langue

const LanguageSelector = () => {
  const { t } = useTranslation();

  const changeLanguage = (lng) => {
    console.log('Changing language to:', lng);
    i18n.changeLanguage(lng);
  };

  console.log('Current language:', i18n.language);

  return (
    <div className="text-end mb-3"> {/* Utilisation de la classe text-end pour aligner le contenu à droite */}
      <Button variant="light" className="me-2" onClick={() => changeLanguage('en')}>
        {t('EN')}
      </Button>
      <Button variant="light" onClick={() => changeLanguage('fr')}>
        {t('FR')}
      </Button>
      <Button variant="light" className="ms-2">
        <FontAwesomeIcon icon={faGlobe} className="me-2" />
        Language
      </Button>
    </div>
  );
};

export default LanguageSelector;
