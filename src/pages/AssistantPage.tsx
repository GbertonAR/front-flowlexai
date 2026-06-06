import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import AssistantChat from '../components/AssistantChat';

const AssistantPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const tenant_id = user?.tenant_id || 1;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black font-title mb-4">
            {t('assistant.title').split(' ')[0]}{' '}
            <span className="text-accent underline decoration-accent/30 decoration-4 underline-offset-8">
              {t('assistant.title').split(' ').slice(1).join(' ')}
            </span>
          </h1>
          <p className="text-gray-400 font-light">{t('home.subtitle')}</p>
        </div>
        <div className="relative h-[600px] w-full">
            <AssistantChat tenant_id={tenant_id} onClose={() => {}} />
        </div>
      </div>
    </div>
  );
};

export default AssistantPage;
