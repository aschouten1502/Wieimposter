import { Redirect } from 'expo-router';

// Discussion is now part of the hints screen flow (happens in person)
export default function DiscussionScreen() {
  return <Redirect href="/game/vote" />;
}
