import { getSkills, getServices, getExperiments, getSocials, getSettings } from '../../../lib/queries';
import SettingsForm from '../../../components/admin/SettingsForm';
import {
  DeleteContentButton,
  ExperimentAdder,
  ServiceAdder,
  SkillAdder,
  SocialAdder,
} from '../../../components/admin/ContentForms';

export const dynamic = 'force-dynamic';

export default async function ContentPage() {
  const [skills, services, experiments, socials, settings] = await Promise.all([
    getSkills(),
    getServices(),
    getExperiments(),
    getSocials(),
    getSettings(),
  ]);

  return (
    <>
      <div className="a-topbar">
        <div>
          <span className="a-crumb">Dashboard / Content</span>
          <h1 className="a-title">Content</h1>
        </div>
        <div className="a-topbar-actions">
          <a href="/" target="_blank" rel="noreferrer" className="a-btn">
            Preview site ↗
          </a>
        </div>
      </div>

      {/* HOMEPAGE + ABOUT TEXT */}
      <SettingsForm settings={settings} sections={['homepage']} title="Homepage & about text" />

      {/* SKILLS */}
      <div className="a-panel">
        <div className="a-panel-head">
          <h2>Skills &amp; interests ({skills.length})</h2>
        </div>
        <div className="a-panel-body">
          <SkillAdder />

          {skills.length ? (
            <table className="a-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Label</th>
                  <th>Group</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--a-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
                      {String(i + 1).padStart(2, '0')}
                    </td>
                    <td>{s.label}</td>
                    <td style={{ color: 'var(--a-muted)' }}>{s.group_name || '—'}</td>
                    <td className="a-row-actions">
                      <DeleteContentButton kind="skill" id={s.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="a-empty">No skills yet — add the disciplines you want to show.</div>
          )}
        </div>
      </div>

      {/* SERVICES */}
      <div className="a-panel">
        <div className="a-panel-head">
          <h2>Services ({services.length})</h2>
        </div>
        <div className="a-panel-body">
          <ServiceAdder />

          {services.length ? (
            <table className="a-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Note</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--a-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
                      {s.number || String(i + 1).padStart(2, '0')}
                    </td>
                    <td>{s.title}</td>
                    <td style={{ color: 'var(--a-muted)' }}>{s.note || '—'}</td>
                    <td className="a-row-actions">
                      <DeleteContentButton kind="service" id={s.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="a-empty">No services yet.</div>
          )}
        </div>
      </div>

      {/* EXPERIMENTS */}
      <div className="a-panel">
        <div className="a-panel-head">
          <h2>Creative lab experiments ({experiments.length})</h2>
        </div>
        <div className="a-panel-body">
          <ExperimentAdder />

          {experiments.length ? (
            <table className="a-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Link</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {experiments.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <span className="cell-title">
                        {e.media_url && e.media_type === 'image' ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img className="thumb-xs" src={e.media_url} alt="" />
                        ) : null}
                        {e.title}
                      </span>
                    </td>
                    <td style={{ color: 'var(--a-muted)' }}>{e.media_type}</td>
                    <td style={{ color: 'var(--a-muted)' }}>{e.link_url ? 'Yes' : '—'}</td>
                    <td className="a-row-actions">
                      <DeleteContentButton kind="experiment" id={e.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="a-empty">No experiments yet.</div>
          )}
        </div>
      </div>

      {/* SOCIALS */}
      <div className="a-panel">
        <div className="a-panel-head">
          <h2>Social links ({socials.length})</h2>
        </div>
        <div className="a-panel-body">
          <SocialAdder />

          {socials.length ? (
            <table className="a-table">
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Handle</th>
                  <th>URL</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {socials.map((s) => (
                  <tr key={s.id}>
                    <td>{s.label}</td>
                    <td style={{ color: 'var(--a-muted)' }}>{s.handle || '—'}</td>
                    <td style={{ color: 'var(--a-muted)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.url}
                    </td>
                    <td className="a-row-actions">
                      <DeleteContentButton kind="social" id={s.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="a-empty">No social links yet.</div>
          )}
        </div>
      </div>
    </>
  );
}
