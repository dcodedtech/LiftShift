export { Page };

import React, { useEffect } from 'react';

function Page() {
  useEffect(() => {
    window.location.replace('https://liftshift.app/hevy-vs-lyfta/');
  }, []);

  return (
    <p style={{ color: '#fff', padding: '2rem', fontFamily: 'sans-serif' }}>
      Redirecting to the full comparison&hellip;
    </p>
  );
}
