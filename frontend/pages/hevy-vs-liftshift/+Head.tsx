export { Head };

import React from 'react';
import { CommonHead } from '../../renderer/CommonHead';
import { SeoHead } from '../../renderer/SeoHead';
import config from './+config';

const SCHEMA = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Article',
  'headline': 'Hevy vs LiftShift \u2014 Logger vs Analytics: Why You Need Both',
  'description': 'Hevy is a great workout logger. But its analytics are basic. LiftShift is a free, open source analytics add-on that gives you muscle heatmaps, plateau detection, set-by-set feedback, and AI export that Hevy lacks.',
  'author': { '@type': 'Organization', 'name': 'LiftShift', 'url': 'https://liftshift.app/' },
  'publisher': { '@type': 'Organization', 'name': 'LiftShift', 'url': 'https://liftshift.app/' },
  'url': 'https://liftshift.app/hevy-vs-liftshift/',
  'mainEntityOfPage': 'https://liftshift.app/hevy-vs-liftshift/',
});

function Head() {
  return (
    <>
      <CommonHead />
      <SeoHead canonicalPath="/hevy-vs-liftshift/" isLanding={false} title={config.title} description={config.description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SCHEMA }} />
    </>
  );
}
