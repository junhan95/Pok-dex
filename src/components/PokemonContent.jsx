import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {fetchLocalizedResource, getPokemonImageUrl} from '../api/pokeApi';
import {useLanguage} from '../context/LanguageContext';
import {localizedName} from '../utils/pokemonLocalization';
import {defenseMultipliers, evolutionEdges, resourceId, localizedText} from '../utils/pokemonContent';

export function PokemonMedia({pokemon, name}) {
    const {language} = useLanguage();
    const ko = language === 'ko';
    const [shiny, setShiny] = useState(false);
    const [failed, setFailed] = useState(false);
    const [audioFailed, setAudioFailed] = useState(false);
    const art = pokemon.sprites?.other?.['official-artwork'];
    const normal = art?.front_default || pokemon.sprites?.front_default;
    const alternate = art?.front_shiny || pokemon.sprites?.front_shiny;
    return <div className="pokemon-detail-image-wrapper"><img className="pokemon-detail-image" src={failed ? pokemon.sprites?.front_default : shiny ? alternate : normal} alt={`${name}${shiny ? (ko ? ' 색이 다른 모습' : ' shiny') : ''}`} onError={() => setFailed(true)} />
        {alternate && <div className="content-switch" aria-label={ko ? '모습 선택' : 'Appearance'}><button aria-pressed={!shiny} onClick={() => {setShiny(false);setFailed(false);}}>{ko ? '일반' : 'Normal'}</button><button aria-pressed={shiny} onClick={() => {setShiny(true);setFailed(false);}}>✦ {ko ? '색이 다른 모습' : 'Shiny'}</button></div>}
        {pokemon.cries?.latest && <div className="cry-player"><label htmlFor={`cry-${pokemon.id}`}>{ko ? '울음소리 듣기' : 'Listen to its cry'}</label><audio id={`cry-${pokemon.id}`} aria-label={ko ? `${name} 울음소리` : `${name} cry`} controls preload="none" src={pokemon.cries.latest} onError={() => setAudioFailed(true)} />{audioFailed && <p>{ko ? '울음소리를 불러오지 못했습니다.' : 'Audio is unavailable.'}</p>}</div>}
    </div>;
}

export function PokemonInsights({pokemon, species, abilities}) {
    const {language, t} = useLanguage(); const ko = language === 'ko';
    const [relations, setRelations] = useState(null);
    const [error, setError] = useState(false);
    useEffect(() => {let active=true; Promise.all(pokemon.types.map(x=>fetchLocalizedResource('type',x.type.name))).then(data=>{if(active)setRelations(defenseMultipliers(data));}).catch(()=>{if(active)setError(true);});return()=>{active=false;};},[pokemon]);
    const genus = species.genera?.find(x=>x.language.name===language)?.genus;
    const generation = species.generation?.name.replace('generation-', '').toUpperCase();
    const statsTotal = pokemon.stats.reduce((sum,s)=>sum+s.base_stat,0);
    return <>
        <section className="content-section"><div className="content-heading"><span>PROFILE</span><h2>{ko ? '한눈에 보는 특징' : 'At a glance'}</h2></div><dl className="profile-grid"><div><dt>{ko ? '분류' : 'Category'}</dt><dd>{genus || '—'}</dd></div><div><dt>{ko ? '첫 등장 세대' : 'Introduced in'}</dt><dd>Gen {generation}</dd></div><div><dt>{ko ? '기본 능력치 합계' : 'Base stat total'}</dt><dd>{statsTotal}</dd></div><div><dt>{ko ? '분류 태그' : 'Status'}</dt><dd>{species.is_mythical ? (ko?'환상의 포켓몬':'Mythical') : species.is_legendary ? (ko?'전설의 포켓몬':'Legendary') : (ko?'일반 포켓몬':'Regular Pokémon')}</dd></div></dl></section>
        <section className="content-section"><div className="content-heading"><span>ABILITIES</span><h2>{ko ? '특성은 어떤 효과인가요?' : 'What do its abilities do?'}</h2></div><div className="ability-grid">{pokemon.abilities.map(a=>{const data=abilities[a.ability.name];const text=localizedText(data?.flavor_text_entries,language);return <article key={a.ability.name}><h3>{localizedName(data?.names,language,a.ability.name)} {a.is_hidden && <small>{ko?'숨겨진 특성':'Hidden Ability'}</small>}</h3><p lang={text?.language}>{text?.text || (ko?'제공되는 설명이 없습니다.':'No description is available.')}</p>{text && text.language!==language && <small>{ko?'한국어 설명이 없어 영어 원문을 표시합니다.':'Original description shown.'}</small>}</article>;})}</div><p className="content-note">{ko?'게임에 따라 특성의 세부 효과가 다를 수 있습니다.':'Ability effects can vary between game versions.'}</p></section>
        <section className="content-section"><div className="content-heading"><span>TYPE MATCHUPS</span><h2>{ko?'어떤 타입의 공격에 약한가요?':'Which attack types is it weak to?'}</h2></div><p className="content-note">{ko?'현재 타입 기준의 방어 상성입니다. 특성·도구·테라스탈 등은 반영하지 않으며, 과거 세대의 규칙은 다를 수 있습니다.':'Defensive matchups for the current types. Abilities, items, and Terastallization are excluded; older generations may differ.'}</p>{error ? <p role="status">{ko?'상성 정보를 불러오지 못했습니다.':'Unable to load matchups.'}</p> : !relations ? <p role="status">{ko?'상성 계산 중…':'Loading matchups…'}</p> : <div className="matchup-grid">{[[ko?'약점':'Weakness',n=>n>1],[ko?'저항':'Resistance',n=>n>0&&n<1],[ko?'무효':'Immunity',n=>n===0]].map(([label,filter])=><div key={label}><h3>{label}</h3><div className="matchup-chips">{Object.entries(relations).filter(([,v])=>filter(v)).map(([type,m])=><span key={type} style={{borderColor:`var(--type-${type})`}}>{t(`type_${type}`)} <b>×{m}</b></span>)}{!Object.values(relations).some(filter)&&<span>{ko?'없음':'None'}</span>}</div></div>)}</div>}</section>
    </>;
}

const conditionLabels = {
    min_level:['레벨','Level'], min_happiness:['친밀도','Friendship'], min_affection:['애정도','Affection'], min_beauty:['아름다움','Beauty'], time_of_day:['시간','Time'], gender:['성별','Gender'], relative_physical_stats:['능력치 조건','Stat condition'],
    item:['사용 아이템','Use item'], held_item:['지닌 도구','Held item'], known_move:['배운 기술','Known move'], known_move_type:['배운 기술 타입','Known move type'], location:['장소','Location'], trade_species:['교환 대상','Trade partner'], party_species:['동료 포켓몬','Party Pokémon'], party_type:['동료 타입','Party type'], trigger:['방법','Method'], region:['지역','Region'], base_form:['이전 모습','Base form'], evolved_form:['진화 모습','Evolved form'], used_move:['사용 기술','Used move'], min_move_count:['기술 사용 횟수','Move uses'], min_steps:['걸음 수','Steps'], min_damage_taken:['받은 피해','Damage taken'], needs_overworld_rain:['비가 오는 필드','Overworld rain'], turn_upside_down:['기기를 뒤집기','Turn device upside down'], needs_multiplayer:['멀티플레이 필요','Multiplayer required'], near_special_rock:['특수 바위 근처','Near special rock'],
};
export function EvolutionPaths({tree, names}) {
    const {language}=useLanguage();const ko=language==='ko';
    const [resources,setResources]=useState({});
    const edges=evolutionEdges(tree);
    useEffect(()=>{let active=true;const refs=new Map();for(const edge of evolutionEdges(tree))for(const condition of edge.conditions)for(const value of Object.values(condition))if(value?.url)refs.set(value.url,value);Promise.all([...refs.values()].map(async ref=>{const parts=ref.url.split('/').filter(Boolean);return [ref.url,await fetchLocalizedResource(parts.at(-2),parts.at(-1)).catch(()=>null)];})).then(entries=>{if(active)setResources(Object.fromEntries(entries));});return()=>{active=false;};},[tree]);
    const nameOf=ref=>{const p=names.find(x=>String(x.id)===resourceId(ref));return ko?(p?.ko||p?.name||ref.name):(p?.name||ref.name);};
    const resourceName=ref=>localizedName(resources[ref.url]?.names,language,ref.name.replaceAll('-',' '));
    const conditionText=(key,value)=>{
        const label=conditionLabels[key]?.[ko?0:1] || key;
        if(value===true)return label;
        if(key==='gender')return `${label}: ${value===1?(ko?'암컷':'Female'):(ko?'수컷':'Male')}`;
        if(key==='relative_physical_stats')return ko?(['공격 < 방어','공격 = 방어','공격 > 방어'][value+1]):(['Attack < Defense','Attack = Defense','Attack > Defense'][value+1]);
        if(key==='time_of_day')return `${label}: ${{day:ko?'낮':'Day',night:ko?'밤':'Night',dusk:ko?'황혼':'Dusk'}[value]||value}`;
        return `${label}: ${value?.url?resourceName(value):value}`;
    };
    return <section className="content-section"><div className="content-heading"><span>EVOLUTION PATHS</span><h2>{ko?'어떻게 진화하나요?':'How does it evolve?'}</h2></div><p className="content-note">{ko?'각 행은 하나의 진화 경로입니다. 조건 묶음 안의 항목은 함께 충족해야 하며, 다른 묶음은 대체 경로입니다. 게임별로 조건과 지원 여부가 다릅니다.':'Each row is one evolution path. Conditions within a group apply together; separate groups are alternatives. Availability and requirements vary by game.'}</p>{!tree?<p>{ko?'진화 정보를 불러오지 못했습니다.':'Evolution data is unavailable.'}</p>:!edges.length?<p>{ko?'등록된 진화 경로가 없습니다. 다른 모습은 아래에서 확인하세요.':'No evolution path is recorded. Check forms below.'}</p>:<div className="evolution-paths">{edges.map(edge=><article key={edge.to.name}><div className="evolution-pair">{[edge.from,edge.to].map((ref,i)=><ReactPair key={ref.name} refData={ref} name={nameOf(ref)} arrow={i===1}/>)}</div><details><summary>{ko ? `진화 조건 보기 (${edge.conditions.length})` : `View conditions (${edge.conditions.length})`}</summary><div className="evolution-conditions">{edge.conditions.length?edge.conditions.map((c,i)=><div key={i}><strong>{c.version_group?resourceName(c.version_group):(ko?'기본 조건':'Conditions')}</strong><ul>{Object.entries(c).filter(([k,v])=>!['version_group','is_default'].includes(k)&&v!==null&&v!==false&&v!=='').map(([k,v])=><li key={k}>{conditionText(k,v)}</li>)}</ul></div>):<p>{ko?'상세 조건이 제공되지 않습니다.':'No detailed conditions available.'}</p>}</div></details></article>)}</div>}</section>;
}
function ReactPair({refData,name,arrow}) {return <>{arrow&&<span aria-hidden="true">→</span>}<Link to={`/pokemon/${resourceId(refData)}`}><img loading="lazy" src={getPokemonImageUrl(resourceId(refData))} alt="" width="90" height="90"/><strong>{name}</strong></Link></>;}
