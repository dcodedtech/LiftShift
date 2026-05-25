export { Head };

import React from 'react';
import { CommonHead } from '../../renderer/CommonHead';
import { SeoHead } from '../../renderer/SeoHead';
import config from './+config';

const SCHEMA = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Article',
  'headline': 'Hevy vs Strong \u2014 Which Workout Tracker? Free &amp; Open Source Analytics Comparison',
  'description': 'Honest comparison of Hevy vs Strong: features, pricing, API access, data export, and how LiftShift (free and open source, AGPL-3.0) adds the analytics layer both are missing.',
  'author': { '@type': 'Organization', 'name': 'LiftShift', 'url': 'https://liftshift.app/' },
  'publisher': { '@type': 'Organization', 'name': 'LiftShift', 'url': 'https://liftshift.app/' },
  'url': 'https://liftshift.app/hevy-vs-strong/',
  'mainEntityOfPage': 'https://liftshift.app/hevy-vs-strong/',
});

function Head() {
  return (
    <>
      <CommonHead />
      <SeoHead canonicalPath="/hevy-vs-strong/" isLanding={false} title={config.title} description={config.description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SCHEMA }} />
    </>
  );
}
