import { useGameStore } from './state/useGameStore';
import MainMenu from './components/Lobby/MainMenu';
import GameTable from './components/GameTable/GameTable';

export default function App() {
  const mode = useGameStore(s => s.mode);

  switch (mode) {
    case 'hotseat':
    case 'online':
      return <GameTable />;
    case 'lobby':
    default:
      return <MainMenu />;
  }
}
