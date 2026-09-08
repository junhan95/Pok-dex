import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const questions = {
    ko: [
        ['포켓몬 이름이나 도감 번호로 어떻게 검색하나요?', '검색창에 한국어 이름, 영어 이름 또는 도감 번호를 입력하세요. 예를 들어 피카츄, pikachu, 25로 같은 포켓몬을 찾을 수 있습니다.'],
        ['타입과 세대를 함께 선택할 수 있나요?', '네. 세대 버튼과 타입 필터를 함께 사용하면 해당 세대의 포켓몬 중 선택한 타입을 가진 포켓몬만 표시됩니다. 타입 두 개를 선택하면 두 타입을 모두 가진 포켓몬을 찾습니다.'],
        ['포켓몬의 진화와 능력치는 어디서 보나요?', '포켓몬 카드를 선택하면 상세 페이지에서 타입, 기본 능력치, 특성, 키와 몸무게, 제공되는 진화 정보를 확인할 수 있습니다.'],
        ['즐겨찾기는 어디에 저장되나요?', '카드의 하트를 누르면 현재 브라우저에 저장됩니다. 같은 브라우저에서 다시 볼 수 있으며, 다른 기기로 자동 동기화되지는 않습니다. 브라우저 데이터를 삭제하면 기록도 사라질 수 있습니다.'],
        ['공식 포켓몬 사이트인가요?', '이 사이트는 PokéAPI 데이터를 활용한 비공식 팬 도감입니다. 게임 버전이나 포켓몬 형태에 따라 정보가 다를 수 있으므로, 특정 게임의 규칙은 해당 게임의 공식 안내도 함께 확인하세요.'],
    ],
    en: [
        ['How do I search by name or Pokédex number?', 'Enter a Korean name, an English name, or a Pokédex number. For example, 피카츄, pikachu, and 25 find the same Pokémon.'],
        ['Can I combine type and generation filters?', 'Yes. Choose a generation and a type to narrow the list. Selecting two types shows Pokémon that have both types.'],
        ['Where can I find evolutions and base stats?', 'Select a Pokémon card to see its types, base stats, abilities, height, weight, and available evolution information.'],
        ['Where are my favorites saved?', 'Tap a card’s heart to save it in this browser. Favorites do not automatically sync to other devices and may be lost when you clear browser data.'],
        ['Is this an official Pokémon website?', 'This is an unofficial fan Pokédex powered by PokéAPI. Information can vary by game version or Pokémon form. Check the official game guidance for version-specific rules.'],
    ],
};

export default function DiscoveryGuide() {
    const { language } = useLanguage();
    const ko = language === 'ko';
    return (
        <div className="discovery-guide">
            <section className="guide-section" aria-labelledby="guide-title">
                <div className="section-heading"><span className="section-kicker">FIELD GUIDE</span><h2 id="guide-title">{ko ? '궁금한 포켓몬에서, 다음 발견으로.' : 'One Pokémon. More to discover.'}</h2><p>{ko ? '이 도감은 1~9세대 포켓몬의 이름, 타입, 기본 능력치와 진화 정보를 찾아보는 공간입니다.' : 'Explore names, types, base stats, and evolution information for Pokémon from generations I–IX.'}</p></div>
                <div className="guide-grid">
                    <article><span className="guide-number">01 / FIND</span><h3>{ko ? '이름이 기억나면 검색부터' : 'Start with a name'}</h3><p>{ko ? '한국어·영어 이름이나 도감 번호로 찾아보세요. 이름의 일부만 입력해도 목록을 좁힐 수 있습니다.' : 'Search with a Korean or English name, or a Pokédex number. Part of a name works, too.'}</p><Link to="/pokemon/25">{ko ? '피카츄 알아보기' : 'Meet Pikachu'} ↗</Link></article>
                    <article><span className="guide-number">02 / EXPLORE</span><h3>{ko ? '진화를 따라 넓어지는 도감' : 'Follow the evolution'}</h3><p>{ko ? '상세 페이지에서 진화 과정을 살펴보고 이어지는 포켓몬을 만나보세요.' : 'Open a detail page to explore its evolution chain and discover related Pokémon.'}</p><Link to="/pokemon/1">{ko ? '이상해씨부터 시작하기' : 'Start with Bulbasaur'} ↗</Link></article>
                    <article><span className="guide-number">03 / COLLECT</span><h3>{ko ? '좋아하는 포켓몬은 가까이에' : 'Keep your favorites close'}</h3><p>{ko ? '카드의 하트를 눌러 저장하세요. 즐겨찾기 필터로 다시 보고 싶은 포켓몬만 모아볼 수 있습니다.' : 'Save Pokémon with the heart on each card. Use the favorites filter to revisit your collection.'}</p><a href="#pokedex">{ko ? '나만의 목록 만들기' : 'Build your collection'} ↗</a></article>
                </div>
            </section>
            <section className="guide-section faq-section" aria-labelledby="faq-title"><div className="section-heading"><span className="section-kicker">QUESTIONS & ANSWERS</span><h2 id="faq-title">{ko ? '포켓몬 도감 이용 안내' : 'Using the Pokédex'}</h2><p>{ko ? '검색부터 즐겨찾기까지, 자주 궁금해할 내용을 모았습니다.' : 'Answers about searching, exploring, and saving Pokémon.'}</p></div><div className="faq-list">{questions[language].map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>
            <aside className="source-note"><strong>{ko ? '데이터와 사이트 안내' : 'About this Pokédex'}</strong><p>{ko ? '포켓몬 정보는 ' : 'Pokémon data comes from '}<a href="https://pokeapi.co/" target="_blank" rel="noopener noreferrer">PokéAPI</a>{ko ? '를 활용합니다. 포켓몬 관련 명칭과 이미지는 각 권리자에게 귀속되며, 본 사이트는 공식 서비스와 제휴하지 않은 팬 프로젝트입니다.' : '. Pokémon names and images belong to their respective owners. This fan project is not affiliated with the official service.'}</p></aside>
        </div>
    );
}
