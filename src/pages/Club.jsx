import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchAllPokemonWithNames, fetchPokemonDetails, fetchLocalizedResource, getPokemonImageUrl } from '../api/pokeApi';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';
import { matchesPokemon } from '../utils/search';
import { cleanIds, themes, dailyPokemon, albumUrl, readAlbums } from '../utils/club';
import { localizedName } from '../utils/pokemonLocalization';
import useSEO from '../hooks/useSEO';
import './club.css';

function Comparison({ids, catalog, ko, language, t}) {
 const [result,setResult]=useState({}); const [retry,setRetry]=useState(0);
 const key=ids.join(',');
 useEffect(()=>{let active=true;
  Promise.all(ids.map(async id=>{try {const data=await fetchPokemonDetails(id);const abilities=await Promise.all(data.abilities.filter(a=>!a.is_hidden).map(a=>fetchLocalizedResource('ability',a.ability.name).catch(()=>null)));return {id,data,abilities};}catch{return {id,error:true};}})).then(items=>{if(active)setResult({key,items});});
  return()=>{active=false;};
 },[key,retry]); // eslint-disable-line react-hooks/exhaustive-deps
 if(ids.length<2)return <p className="club-empty">{ko?'포켓몬을 2~3마리 선택하면 나란히 비교할 수 있어요.':'Choose 2–3 Pokémon to compare them side by side.'}</p>;
 if(result.key!==key)return <p role="status">{ko?'비교 정보를 불러오는 중…':'Loading comparison…'}</p>;
 if(result.items.some(x=>x.error))return <p role="alert">{ko?'비교 정보를 불러오지 못했습니다.':'Could not load comparison.'} <button onClick={()=>setRetry(n=>n+1)}>{ko?'다시 시도':'Retry'}</button></p>;
 const rows=[['height',ko?'키 (m)':'Height (m)',x=>x.data.height/10],['weight',ko?'몸무게 (kg)':'Weight (kg)',x=>x.data.weight/10],...['hp','attack','defense','special-attack','special-defense','speed'].map(stat=>[stat,t(`stat_${stat}`),x=>x.data.stats.find(s=>s.stat.name===stat)?.base_stat ?? 0])];
 return <div className="club-table-wrap"><table className="club-table"><caption>{ko?'게임 기본 능력치 비교 · 레벨·성격·노력치는 반영하지 않습니다.':'Base game stats · excludes level, nature and training.'}</caption><thead><tr><th>{ko?'항목':'Attribute'}</th>{result.items.map(x=><th key={x.id}><Link to={`/pokemon/${x.id}`}><img src={getPokemonImageUrl(x.id)} alt=""/>{ko?catalog.find(p=>p.id===x.id)?.ko:catalog.find(p=>p.id===x.id)?.name}</Link></th>)}</tr></thead><tbody><tr><th>{ko?'타입':'Types'}</th>{result.items.map(x=><td key={x.id}>{x.data.types.map(v=>t(`type_${v.type.name}`)).join(' / ')}</td>)}</tr>{rows.map(([id,label,get])=><tr key={id}><th>{label}</th>{result.items.map(x=><td key={x.id}><strong>{get(x)}</strong>{!['height','weight'].includes(id)&&<meter min="0" max="255" value={get(x)} aria-label={label}/>}</td>)}</tr>)}<tr><th>{ko?'일반 특성':'Regular abilities'}</th>{result.items.map(x=><td key={x.id}>{x.abilities.map(a=>localizedName(a?.names,language,'—')).join(' / ')}</td>)}</tr></tbody></table></div>;
}

export default function Club(){
 useLayoutEffect(()=>{window.scrollTo({top:0,left:0,behavior:'instant'});},[]);
 const {language,t}=useLanguage(); const ko=language==='ko'; const {favorites}=useFavorites(); const [params,setParams]=useSearchParams();
 useSEO({title:ko?'포켓몬 놀이터 · 비교와 공유 앨범':'Pokémon club · Compare and share', url:'https://pokemon-drawing-book.com/club'});
 const mode=params.get('mode')==='album'?'album':'compare'; const selected=cleanIds(params.get(mode==='album'?'ids':'compare'),mode==='album'?6:3);const title=(params.get('title')||'').slice(0,40);
 const theme=themes.find(x=>x.id===params.get('theme'));
 const [catalog,setCatalog]=useState([]),[error,setError]=useState(false),[retry,setRetry]=useState(0),[query,setQuery]=useState(''),[page,setPage]=useState(1),[onlyFavorites,setOnlyFavorites]=useState(false),[notice,setNotice]=useState(''),[shareLink,setShareLink]=useState('');
 const pickerDialog=useRef(null);
 const [slotQuery,setSlotQuery]=useState('');
 const [slotPage,setSlotPage]=useState(1);
 const openSlotPicker=()=>{setSlotQuery('');setSlotPage(1);pickerDialog.current.showModal();};
 const slotMatches=catalog.filter(p=>matchesPokemon(p,slotQuery));
 const chooseSlot=id=>{if(selected.includes(id))return;toggle(id);pickerDialog.current.close();};
 const [albums,setAlbums]=useState(()=>{try{return readAlbums(localStorage);}catch{return [];}});
 useEffect(()=>{let active=true;fetchAllPokemonWithNames().then(data=>{if(active){setCatalog(data);setError(false);}}).catch(()=>{if(active)setError(true);});return()=>{active=false;};},[retry]);
 const update=(changes)=>{setParams(previous=>{const next=new URLSearchParams(previous);Object.entries(changes).forEach(([key,value])=>value?next.set(key,value):next.delete(key));return next;},{replace:true});setNotice('');setShareLink('');};
 const toggle=id=>{if(selected.includes(id))update({[mode==='album'?'ids':'compare']:selected.filter(x=>x!==id).join(',')});else if(selected.length<(mode==='album'?6:3))update({[mode==='album'?'ids':'compare']:[...selected,id].join(',')});else setNotice(ko?`최대 ${mode==='album'?6:3}마리까지 선택할 수 있어요.`:`Choose up to ${mode==='album'?6:3} Pokémon.`);};
 const save=()=>{if(!selected.length)return;const entry={title:title.trim()||(ko?'나의 포켓몬 앨범':'My Pokémon album'),ids:selected};const next=[entry,...albums.filter(x=>x.title!==entry.title)].slice(0,12);try{localStorage.setItem('pokedex_albums_v1',JSON.stringify(next));setAlbums(next);setNotice(ko?'이 브라우저에 저장했어요. 같은 이름의 앨범은 갱신됩니다.':'Saved in this browser. Albums with the same title are updated.');}catch{setNotice(ko?'저장 공간을 사용할 수 없습니다. 공유 링크를 보관해 주세요.':'Storage unavailable. Keep a share link instead.');}};
 const share=async()=>{const url=albumUrl(window.location.origin,title||(ko?'나의 포켓몬 앨범':'My Pokémon album'),selected);setShareLink(url);try{await navigator.clipboard.writeText(url);setNotice(ko?'링크를 복사했어요. 친구에게 보내보세요!':'Link copied. Send it to a friend!');}catch{setNotice(ko?'아래 링크를 복사해 친구에게 보내세요.':'Copy the link below to share with a friend.');}};
 const filtered=catalog.filter(p=>(!theme||theme.ids.includes(p.id))&&(!onlyFavorites||favorites.includes(p.id))&&matchesPokemon(p,query)); const current=Math.min(page,Math.max(1,Math.ceil(filtered.length/24))); const daily=dailyPokemon();
 const name=id=>{const p=catalog.find(x=>x.id===id);return (ko?p?.ko:p?.name)||`#${id}`;};
 return <main className="container club-page"><Link to="/#pokedex">← {ko?'도감으로':'Back to Pokédex'}</Link><header className="club-intro"><span>POKÉMON CLUB</span><h1>{ko?'비교하고, 모으고, 함께 발견해요.':'Compare, collect, discover together.'}</h1><p>{ko?'나만의 여섯 친구를 고르고 앨범을 공유해 보세요.':'Choose your six favorites and share your album.'}</p></header>
 <aside className="club-daily"><div><strong>{ko?'오늘의 발견':'Today’s discovery'}</strong><p>{ko?'매일 새로운 포켓몬을 만나보세요.':'Meet a different Pokémon each day.'}</p></div><Link to={`/pokemon/${daily}`}><img src={getPokemonImageUrl(daily)} alt=""/>{name(daily)} ↗</Link></aside>
 <nav className="club-modes" aria-label={ko?'놀이터 메뉴':'Club modes'}>{['compare','album'].map(value=><button key={value} aria-pressed={mode===value} onClick={()=>update({mode:value})}>{value==='compare'?(ko?'포켓몬 비교':'Compare Pokémon'):(ko?'친구에게 공유할 앨범':'Shareable album')}</button>)}</nav>
 <section className="club-workbench"><h2>{mode==='album'?(ko?'나의 포켓몬 앨범':'My Pokémon album'):(ko?'누가 어떻게 다를까요?':'What makes them different?')}</h2>{mode==='album'&&<label className="club-title-label">{ko?'앨범 이름':'Album title'}<input maxLength={40} value={title} placeholder={ko?'예: 우리 반의 최애 포켓몬':'Our favorite Pokémon'} onChange={e=>update({title:e.target.value})}/></label>}
 <div className={`club-slots club-slots-${mode}`}>{Array.from({length:mode==='album'?6:3},(_,i)=>selected[i]?<div key={i}><Link to={`/pokemon/${selected[i]}`}><img src={getPokemonImageUrl(selected[i])} alt=""/><strong>{name(selected[i])}</strong></Link><button aria-label={`${name(selected[i])} ${ko?'선택 해제':'Remove'}`} onClick={()=>toggle(selected[i])}>×</button></div>:<button type="button" className="club-slot-empty" key={i} onClick={openSlotPicker} aria-label={ko?`${i+1}번 슬롯 포켓몬 선택`:`Choose Pokémon for slot ${i+1}`}><span>＋</span><small>{ko?'검색하여 선택':'Search & choose'}</small></button>)}</div>
 {mode==='compare'?<Comparison ids={selected} catalog={catalog} ko={ko} language={language} t={t}/>:<><div className="club-actions"><button disabled={!selected.length} onClick={save}>{ko?'앨범 저장':'Save album'}</button><button disabled={!selected.length} onClick={share}>{ko?'친구에게 공유하기':'Share with a friend'}</button></div><p className="club-note">{ko?'최대 12개 앨범을 이 브라우저에 저장합니다. 공유 링크에는 현재 앨범의 이름과 포켓몬만 담기며, 이후 수정은 반영되지 않습니다.':'Save up to 12 albums in this browser. Links contain a snapshot of the title and Pokémon; later edits are not synced.'}</p></>}
 <p role="status">{notice}</p>{shareLink&&<label className="club-title-label">{ko?'공유 링크':'Share link'}<input readOnly value={shareLink} onFocus={e=>e.target.select()}/></label>}
 </section>
 {mode==='album'&&albums.length>0&&<section className="club-saved"><h2>{ko?'저장한 앨범':'Saved albums'}</h2>{albums.map((album,i)=><div key={i}><button onClick={()=>update({mode:'album',title:album.title,ids:album.ids.join(',')})}>{album.title} · {album.ids.length}</button><button aria-label={`${album.title} ${ko?'삭제':'Delete'}`} onClick={()=>{const next=albums.filter((_,n)=>n!==i);try{localStorage.setItem('pokedex_albums_v1',JSON.stringify(next));setAlbums(next);}catch{setNotice(ko?'삭제 내용을 저장하지 못했습니다.':'Could not save changes.');}}}>×</button></div>)}</section>}
 <section className="club-picker"><h2>{ko?'테마에서 친구 찾기':'Find friends by theme'}</h2><div className="club-themes"><button aria-pressed={!theme} onClick={()=>{update({theme:''});setPage(1);}}>{ko?'전체 도감':'All Pokémon'}</button>{themes.map(x=><button key={x.id} aria-pressed={theme?.id===x.id} onClick={()=>{update({theme:x.id});setPage(1);}}>{ko?x.ko:x.en}</button>)}</div><label className="club-title-label">{ko?'이름 또는 번호 검색':'Search by name or number'}<input value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}}/></label><button aria-pressed={onlyFavorites} onClick={()=>{setOnlyFavorites(x=>!x);setPage(1);}}>{ko?'즐겨찾기만':'Favorites only'}</button><p>{filtered.length} {ko?'마리 · 선택':'Pokémon · Selected'} {selected.length}/{mode==='album'?6:3}</p>
 {error?<p role="alert">{ko?'목록을 불러오지 못했습니다.':'Unable to load list.'}<button onClick={()=>setRetry(n=>n+1)}>{ko?'다시 시도':'Retry'}</button></p>:!catalog.length?<p role="status">{ko?'도감을 불러오는 중…':'Loading Pokédex…'}</p>:!filtered.length?<p>{ko?'조건에 맞는 포켓몬이 없습니다.':'No matches.'}</p>:<div className="club-pokemon-grid">{filtered.slice((current-1)*24,current*24).map(p=><button key={p.id} aria-pressed={selected.includes(p.id)} onClick={()=>toggle(p.id)}><img loading="lazy" src={getPokemonImageUrl(p.id)} alt=""/><small>#{String(p.id).padStart(4,'0')}</small><strong>{name(p.id)}</strong><span>{selected.includes(p.id)?'✓':'＋'}</span></button>)}</div>}
 <div className="club-pagination"><button disabled={current===1} onClick={()=>setPage(current-1)}>{ko?'이전':'Previous'}</button><span>{current} / {Math.max(1,Math.ceil(filtered.length/24))}</span><button disabled={current*24>=filtered.length} onClick={()=>setPage(current+1)}>{ko?'다음':'Next'}</button></div></section>
 <dialog ref={pickerDialog} className="club-select-dialog" aria-labelledby="club-select-heading">
 <div className="club-dialog-heading"><h2 id="club-select-heading">{ko?'포켓몬 검색 · 선택':'Search & choose Pokémon'}</h2><button type="button" onClick={()=>pickerDialog.current.close()} aria-label={ko?'선택 창 닫기':'Close picker'}>×</button></div>
 <label className="club-title-label">{ko?'한국어·영어 이름 또는 도감 번호':'Korean / English name or Pokédex number'}<input autoFocus type="search" value={slotQuery} placeholder={ko?'예: 피카츄, pikachu, 25':'e.g. Pikachu, 25'} onChange={e=>{setSlotQuery(e.target.value);setSlotPage(1);}}/></label>
 <p role="status">{ko?`${slotMatches.length}마리 · 원하는 포켓몬을 선택하세요.`:`${slotMatches.length} Pokémon · Choose one to add.`}</p>
 {error?<p role="alert">{ko?'목록을 불러오지 못했습니다.':'Could not load Pokémon.'}<button onClick={()=>setRetry(n=>n+1)}>{ko?'다시 시도':'Retry'}</button></p>:!catalog.length?<p>{ko?'불러오는 중…':'Loading…'}</p>:!slotMatches.length?<p>{ko?'검색 결과가 없습니다. 이름이나 번호를 확인해 주세요.':'No matches. Check the name or number.'}</p>:<div className="club-pokemon-grid">{slotMatches.slice((slotPage-1)*18,slotPage*18).map(p=><button key={p.id} disabled={selected.includes(p.id)} onClick={()=>chooseSlot(p.id)}><img loading="lazy" src={getPokemonImageUrl(p.id)} alt=""/><small>#{String(p.id).padStart(4,'0')}</small><strong>{name(p.id)}</strong><span>{selected.includes(p.id)?'✓':'＋'}</span></button>)}</div>}
 <div className="club-pagination"><button disabled={slotPage===1} onClick={()=>setSlotPage(n=>n-1)}>{ko?'이전':'Previous'}</button><span>{slotPage} / {Math.max(1,Math.ceil(slotMatches.length/18))}</span><button disabled={slotPage*18>=slotMatches.length} onClick={()=>setSlotPage(n=>n+1)}>{ko?'다음':'Next'}</button></div>
 </dialog>
 </main>;
}
