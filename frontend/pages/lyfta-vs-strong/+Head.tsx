export { Head };

import React from 'react';
import { CommonHead } from '../../renderer/CommonHead';
import { SeoHead } from '../../renderer/SeoHead';
import config from './+config';

const SCHEMA = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Article',
  'headline': 'Lyfta vs Strong \u2014 Which Workout Tracker? Free &amp; Open Source Analytics Comparison',
  'description': 'Honest comparison of Lyfta vs Strong: features, pricing, exercise libraries, API access, data export, and how LiftShift (free and open source, AGPL-3.0) adds the analytics layer both are missing.',
  'author': { '@type': 'Organization', 'name': 'LiftShift', 'url': 'https://liftshift.app/' },
  'publisher': { '@type': 'Organization', 'name': 'LiftShift', 'url': 'https://liftshift.app/' },
  'url': 'https://liftshift.app/lyfta-vs-strong/',
  'mainEntityOfPage': 'https://liftshift.app/lyfta-vs-strong/',
});

function Head() {
  return (
    <>
      <CommonHead />
      <SeoHead canonicalPath="/lyfta-vs-strong/" isLanding={false} title={config.title} description={config.description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SCHEMA }} />
    </>
  );
}
