'use client';

import { Authors } from './authors';
import { BuyMeACoffee } from './buy-me-a-coffee';
import { Features } from './features';
import { HowItWorks } from './how-it-works';

export function LandingSections() {
  return (
    <>
      <HowItWorks />
      <Features />
      <Authors />
      <BuyMeACoffee />
    </>
  );
}
