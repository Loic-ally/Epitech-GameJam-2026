import './App.css';
<<<<<<< HEAD
import Animation, { type Rarity } from './Animation';
import MultiPullAnimation, { type PullResult } from './MultiPullAnimation';
import GachaPage, { type Banner } from './components/GachaPage';
import { GACHA_BANNERS } from './data/banners';
import { ALL_THEMES, pickImageTheme, type ThemeName } from './themeEffects';

function pickRarity(banner: Banner, count: 1 | 10): Rarity {
  const order: Rarity[] = ['common', 'rare', 'epic', 'legendary'];
  const roll = Math.random() * 100;
  let cursor = 0;
  let picked: Rarity = 'common';

  for (const key of order) {
    cursor += banner.dropRates[key];
    if (roll <= cursor) {
      picked = key;
      break;
    }
  }

  if (count === 10 && picked === 'common') return 'rare';
  return picked;
}

function App() {
  const [gachaOpen, setGachaOpen] = useState(true);
  const [pull, setPull] = useState<{ banner: Banner; rarity: Rarity; count: 1 | 10; theme: ThemeName } | null>(null);
  const [multiPull, setMultiPull] = useState<PullResult[] | null>(null);

  const highlightedBanner = useMemo(() => GACHA_BANNERS[0], []);

  useEffect(() => {
    // Détecte un combo clavier et déclenche une synthèse vocale thématique.
    const TRIGGER_SEQUENCE = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'b', 'a', 'Enter',
    ];

    let position = 0;

    const normalizeKey = (key: string) => (key.length === 1 ? key.toLowerCase() : key);

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

      const key = normalizeKey(event.key);
      const expected = normalizeKey(TRIGGER_SEQUENCE[position]);

      if (key === expected) {
        position += 1;
        if (position === TRIGGER_SEQUENCE.length) {
          position = 0;

          const utterance = new SpeechSynthesisUtterance('al-hayat media center, presents: the gacha simulator');
          utterance.lang = 'en-US';
          utterance.rate = 0.95;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        }
      } else {
        position = key === normalizeKey(TRIGGER_SEQUENCE[0]) ? 1 : 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePull = useCallback((banner: Banner, count: 1 | 10) => {
    if (count === 10) {
      const pulls: PullResult[] = Array.from({ length: 10 }, () => ({
        rarity: pickRarity(banner, count),
        imgTheme: pickImageTheme(),
        imageSrc: banner.image,
      }));
      setMultiPull(pulls);
    } else {
      const rarity = pickRarity(banner, count);
      const theme = ALL_THEMES[Math.floor(Math.random() * ALL_THEMES.length)];
      setPull({ banner, rarity, count, theme });
    }
  }, []);

  const closeAnimation = useCallback(() => setPull(null), []);
  const closeMultiPull = useCallback(() => setMultiPull(null), []);
=======
import AuthPage from './pages/AuthPage';
import RoomsPage from './pages/RoomsPage';
import GachaHub from './pages/GachaHub';
import { RoomProvider } from './context/RoomContext';
import { useAuthSession } from './hooks/useAuthSession';

function App() {
  const { session, authenticate, logout } = useAuthSession();
  const isPullPreview = typeof window !== 'undefined' && window.location.pathname === '/pull';

  if (isPullPreview) {
    return <GachaHub startOpen />;
  }
>>>>>>> refs/remotes/origin/animation

  return (
    <RoomProvider>
      {session ? (
        <RoomsPage user={session.user} onLogout={logout} />
      ) : (
        <AuthPage onAuthenticated={authenticate} />
      )}
<<<<<<< HEAD

      {pull && (
        <Animation
          rarity={pull.rarity}
          theme={pull.theme}
          imageSrc={pull.banner.image}
          onDone={closeAnimation}
        />
      )}

      {multiPull && (
        <MultiPullAnimation pulls={multiPull} onDone={closeMultiPull} />
      )}
    </div>
=======
    </RoomProvider>
>>>>>>> refs/remotes/origin/animation
  );
}

export default App;
