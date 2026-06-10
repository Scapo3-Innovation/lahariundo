import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { HelpCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Accordion } from '../components/Accordion';
import { ContactAction } from '../components/ContactAction';
import { useAppData } from '../context/DataContext';
import { findContacts } from '../utils/contacts';

interface QA { q: string; a: string }

// Per-question follow-ups: internal link and/or data.json contacts (by index).
const EXTRAS: Record<number, { linkKey?: string; route?: string; contactIds?: string[] }> = {
  0: { linkKey: 'rights', route: '/rights' },
  1: { linkKey: 'report', route: '/report' },
  2: { contactIds: ['vimukthi-14405'] },
  3: { linkKey: 'recovery', route: '/recovery' },
  5: { linkKey: 'parents', route: '/parents', contactIds: ['childline-1098'] },
};

export function Faq() {
  const { t, i18n } = useTranslation();
  const isML = i18n.language === 'ml';
  const { data } = useAppData();

  const items = t('faq.items', { returnObjects: true }) as QA[];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        icon={<HelpCircle size={18} className="text-indigo-600" />}
        title={t('faq.heading')}
        subtitle={t('faq.intro')}
        isML={isML}
      />

      <div className="tone-amber border rounded-card p-3 flex items-start gap-2">
        <AlertTriangle size={13} className="text-amber-600 mt-0.5 shrink-0" />
        <p className={`text-xs text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
          {t('faq.disclaimer')}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {Array.isArray(items) && items.map((item, i) => {
          const extra = EXTRAS[i];
          const contacts = extra?.contactIds ? findContacts(data, extra.contactIds) : [];
          return (
            <Accordion key={i} title={item.q} isML={isML} defaultOpen={i === 0}>
              <div className="flex flex-col gap-3">
                <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
                  {item.a}
                </p>
                {contacts.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {contacts.map((c) => <ContactAction key={c.id} contact={c} />)}
                  </div>
                )}
                {extra?.linkKey && extra.route && (
                  <Link
                    to={extra.route}
                    className={`inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:opacity-80 ${isML ? 'ml-text' : ''}`}
                  >
                    {t(`faq.links.${extra.linkKey}`)}
                    <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </Accordion>
          );
        })}
      </div>
    </div>
  );
}
