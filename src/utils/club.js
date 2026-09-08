export const cleanIds = (value, limit = 6) => [...new Set((Array.isArray(value) ? value : String(value || '').split(',')).map(Number).filter(id => Number.isInteger(id) && id > 0 && id <= 1025))].slice(0, limit);
export const themes = [
 {id:'eevee',ko:'이브이와 여덟 진화',en:'Eevee & evolutions',ids:[133,134,135,136,196,197,470,471,700]},
 {id:'starters',ko:'첫 모험의 파트너',en:'First adventure partners',ids:[1,4,7,152,155,158,252,255,258,387,390,393,495,498,501,650,653,656,722,725,728,810,813,816,906,909,912]},
 {id:'kanto',ko:'관동의 전설과 환상',en:'Kanto legends & myths',ids:[144,145,146,150,151]},
 {id:'tiny',ko:'작고 소중한 친구들',en:'Little companions',ids:[25,35,39,175,172,173,174,298,406,417,702,778]}
];
export const dailyPokemon = (date = new Date()) => (Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000) * 37 % 1025) + 1;
export function albumUrl(origin, title, ids) {
 const query = new URLSearchParams({mode:'album',title: String(title).trim().slice(0,40) || 'My Pokémon',ids:cleanIds(ids).join(',')});
 return `${origin}/club?${query}`;
}
export function readAlbums(storage) {
 try { const data=JSON.parse(storage.getItem('pokedex_albums_v1') || '[]'); return Array.isArray(data) ? data.filter(x=>x && typeof x.title==='string' && Array.isArray(x.ids)).slice(0,12).map(x=>({title:x.title.slice(0,40),ids:cleanIds(x.ids)})) : []; } catch { return []; }
}
