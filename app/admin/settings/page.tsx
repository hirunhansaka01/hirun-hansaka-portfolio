import { getSettings } from '../../../lib/queries';
import SettingsForm from '../../../components/admin/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <>
      <div className="a-topbar">
        <div>
          <span className="a-crumb">Dashboard / Settings</span>
          <h1 className="a-title">Website settings</h1>
        </div>
      </div>

      <SettingsForm
        settings={settings}
        sections={['identity', 'contact', 'footer', 'seo', 'theme']}
        title="Site identity, colours & metadata"
      />
    </>
  );
}
