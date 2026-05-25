export { Head };

import React from 'react';
import { CommonHead } from '../../renderer/CommonHead';
import { SeoHead } from '../../renderer/SeoHead';
import config from './+config';

const SCHEMA = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Article',
  'headline': 'Lyfta vs LiftShift \u2014 Logger vs Analytics: Why You Need Both',
  'description': 'Lyfta has the largest exercise library and a modern UI. But its analytics stop at basic charts. LiftShift is a free, open source analytics add-on that gives you muscle heatmaps, plateau detection, set-by-set feedback, and AI export that Lyfta lacks.',
  'author': { '@type': 'Organization', 'name': 'LiftShift', 'url': 'https://liftshift.app/' },
  'publisher': { '@type': 'Organization', 'name': 'LiftShift', 'url': 'https://liftshift.app/' },
  'url': 'https://liftshift.app/lyfta-vs-liftshift/',
  'mainEntityOfPage': 'https://liftshift.app/lyfta-vs-liftshift/',
});

function Head() {
  return (
    <>
      <CommonHead />
      <SeoHead canonicalPath="/lyfta-vs-liftshift/" isLanding={false} title={config.title} description={config.description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SCHEMA }} />
    </>
  );
}
