import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  List,
  Search,
  Shuffle,
  Star,
  X
} from "lucide-react";
import { animals, type Animal } from "./data/animals";

const favoriteKey = "animal-picture-book-favorites";

function readFavorites(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(favoriteKey) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeFavorites(ids: string[]) {
  localStorage.setItem(favoriteKey, JSON.stringify(ids));
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[ぁ-ゖ]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0x60))
    .replace(/\s+/g, "");
}

function usePath() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const go = (nextPath: string) => {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return { path, go };
}

export default function App() {
  const { path, go } = usePath();
  const [favorites, setFavorites] = useState<string[]>(readFavorites);
  const animalId = path.match(/^\/animal\/([^/]+)$/)?.[1];
  const selectedAnimal = animalId ? animals.find((animal) => animal.id === animalId) : undefined;

  const toggleFavorite = (id: string) => {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      writeFavorites(next);
      return next;
    });
  };

  if (selectedAnimal) {
    return (
      <DetailPage
        animal={selectedAnimal}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onNavigate={go}
      />
    );
  }

  if (path === "/animals") {
    return (
      <AnimalsPage
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onNavigate={go}
      />
    );
  }

  return (
    <TopPage
      favorites={favorites}
      onToggleFavorite={toggleFavorite}
      onNavigate={go}
    />
  );
}

type SharedProps = {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onNavigate: (path: string) => void;
};

function TopPage(props: SharedProps) {
  return (
    <DetailFrame
      animal={animals[0]}
      mode="top"
      {...props}
    />
  );
}

function DetailPage({ animal, favorites, onToggleFavorite, onNavigate }: SharedProps & { animal: Animal }) {
  return (
    <DetailFrame
      animal={animal}
      mode="detail"
      favorites={favorites}
      onToggleFavorite={onToggleFavorite}
      onNavigate={onNavigate}
    />
  );
}

function DetailFrame({
  animal,
  mode,
  favorites,
  onToggleFavorite,
  onNavigate
}: SharedProps & { animal: Animal; mode: "top" | "detail" }) {
  const startX = useRef<number | null>(null);
  const currentIndex = animals.findIndex((item) => item.id === animal.id);
  const previousAnimal = animals[(currentIndex - 1 + animals.length) % animals.length];
  const nextAnimal = animals[(currentIndex + 1) % animals.length];
  const isFavorite = favorites.includes(animal.id);

  const moveTo = (target: Animal) => onNavigate(`/animal/${target.id}`);
  const randomAnimal = () => {
    const next = animals[Math.floor(Math.random() * animals.length)];
    moveTo(next.id === animal.id ? nextAnimal : next);
  };

  const onTouchStart = (event: React.TouchEvent) => {
    startX.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (startX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? startX.current;
    const diff = endX - startX.current;
    startX.current = null;
    if (Math.abs(diff) < 64) return;
    moveTo(diff > 0 ? previousAnimal : nextAnimal);
  };

  return (
    <main className="detail-shell" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <section className="photo-stage" aria-label={`${animal.nameKana}の写真`}>
        <img className="detail-photo" src={animal.image} alt={animal.nameKana} />
        <div className="name-band">
          <span>{mode === "top" ? "今日のいきもの" : String(currentIndex + 1).padStart(2, "0")}</span>
          <h1>{animal.nameKana}</h1>
        </div>
        <button
          className={`floating-favorite ${isFavorite ? "saved" : ""}`}
          type="button"
          onClick={() => onToggleFavorite(animal.id)}
          aria-label={`${animal.nameKana}のお気に入りを切り替える`}
          aria-pressed={isFavorite}
        >
          <Heart size={27} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </section>

      <section className="description-card" aria-label={`${animal.nameKana}の説明`}>
        <div className="description-head">
          <div className="detail-meta">
            <p>{String(currentIndex + 1).padStart(2, "0")} / 100</p>
            <strong>{animal.category}</strong>
          </div>
          <button type="button" onClick={() => onNavigate("/animals")}>
            <List size={19} aria-hidden="true" />
            一覧へ
          </button>
        </div>
        <InfoBlock label="すんでいるところ" value={animal.habitat} />
        <InfoBlock label="たべもの" value={animal.food} />
        <InfoBlock label="どんな生き物？" value={animal.description} />
        <InfoBlock label="まめちしき" value={animal.funFact} />
      </section>

      <nav className="detail-nav" aria-label="いきものページの移動">
        <button type="button" onClick={() => moveTo(previousAnimal)}>
          <ChevronLeft size={23} aria-hidden="true" />
          前へ
        </button>
        <button type="button" onClick={randomAnimal}>
          <Shuffle size={21} aria-hidden="true" />
          ランダム
        </button>
        <button type="button" onClick={() => onNavigate("/")}>
          <Home size={21} aria-hidden="true" />
          トップ
        </button>
        <button type="button" onClick={() => moveTo(nextAnimal)}>
          次へ
          <ChevronRight size={23} aria-hidden="true" />
        </button>
      </nav>
    </main>
  );
}

function AnimalsPage({ favorites, onToggleFavorite, onNavigate }: SharedProps) {
  const [query, setQuery] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const filteredAnimals = useMemo(() => {
    const text = normalizeSearchText(query);
    return animals.filter((animal) => {
      const favoriteOk = !onlyFavorites || favorites.includes(animal.id);
      const target = normalizeSearchText(`${animal.nameKana} ${animal.category} ${animal.habitat} ${animal.food}`);
      return favoriteOk && (!text || target.includes(text));
    });
  }, [favorites, onlyFavorites, query]);

  return (
    <main className="list-shell">
      <header className="list-hero">
        <button className="back-home" type="button" onClick={() => onNavigate("/")}>
          <Home size={21} aria-hidden="true" />
          トップへ
        </button>
        <div>
          <p>100種類から選ぶ</p>
          <h1>いきもの一覧</h1>
        </div>
      </header>

      <section className="list-toolbar" aria-label="検索と表示">
        <label className="search-box">
          <Search size={22} aria-hidden="true" />
          <input
            type="search"
            placeholder="名前や分類でさがす"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="名前や分類でさがす"
          />
          {query && (
            <button className="icon-button" type="button" onClick={() => setQuery("")} aria-label="検索を消す">
              <X size={20} />
            </button>
          )}
        </label>
        <button
          className={`toggle-button ${onlyFavorites ? "active" : ""}`}
          type="button"
          onClick={() => setOnlyFavorites((value) => !value)}
          aria-pressed={onlyFavorites}
        >
          <Star size={20} aria-hidden="true" />
          おきにいり
        </button>
      </section>

      <section className="animal-list" aria-label="いきもの一覧">
        {filteredAnimals.map((animal) => (
          <article className="animal-row" key={animal.id}>
            <button
              className="row-main"
              type="button"
              onClick={() => onNavigate(`/animal/${animal.id}`)}
              aria-label={`${animal.nameKana}をひらく`}
            >
              <img src={animal.image} alt={animal.nameKana} loading="lazy" />
              <span>
                <strong>{animal.nameKana}</strong>
                <small>{animal.category}</small>
              </span>
            </button>
            <button
              className={`row-favorite ${favorites.includes(animal.id) ? "saved" : ""}`}
              type="button"
              onClick={() => onToggleFavorite(animal.id)}
              aria-label={`${animal.nameKana}のお気に入りを切り替える`}
              aria-pressed={favorites.includes(animal.id)}
            >
              <Heart size={20} fill={favorites.includes(animal.id) ? "currentColor" : "none"} />
            </button>
          </article>
        ))}
      </section>

      {filteredAnimals.length === 0 && (
        <p className="empty-state">見つかりませんでした。</p>
      )}
    </main>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <article className="info-block">
      <h2>{label}</h2>
      <p>{value}</p>
    </article>
  );
}
