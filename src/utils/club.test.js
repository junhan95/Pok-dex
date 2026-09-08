import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanIds, albumUrl, readAlbums, dailyPokemon } from './club.js';
test('selection rejects invalid IDs, deduplicates and limits', () => {
 assert.deepEqual(cleanIds('1,1,0,-2,1026,no,4,7,25',3),[1,4,7]);
});
test('shared album preserves Korean titles and selection without injecting query parameters', () => {
 const url=new URL(albumUrl('https://example.com','우리 친구 & mode=compare',[133,197,133]));
 assert.equal(url.searchParams.get('title'),'우리 친구 & mode=compare');
 assert.equal(url.searchParams.get('mode'),'album');
 assert.deepEqual(cleanIds(url.searchParams.get('ids')),[133,197]);
});
test('storage recovers safely from corrupt and unavailable data', () => {
 assert.deepEqual(readAlbums({getItem:()=>'{broken'}),[]);
 assert.deepEqual(readAlbums({getItem:()=>{throw Error();}}),[]);
 assert.deepEqual(readAlbums({getItem:()=>JSON.stringify([null,{title:'a',ids:[1,1,9999]},{}])}),[{title:'a',ids:[1]}]);
});
test('daily discovery stays the same throughout a local day and changes next day', () => {
 const first=dailyPokemon(new Date(2026,8,8,1));
 assert.equal(first,dailyPokemon(new Date(2026,8,8,23)));
 assert.notEqual(first,dailyPokemon(new Date(2026,8,9,1)));
 assert.ok(first>=1&&first<=1025);
});
