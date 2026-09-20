import React from 'react';
import { ScreenContainer } from '@/components/ScreenContainer';
import { PartyIntro } from '@/components/party/PartyIntro';
import { getPartyGame } from '@/data/games';

// Placeholder — wordt vervangen door de volledige implementatie.
export default function Screen() {
  const game = getPartyGame('doe-of-drink')!;
  return (
    <ScreenContainer>
      <PartyIntro game={game} rules={['Binnenkort.']} onStart={() => {}} />
    </ScreenContainer>
  );
}
