import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesPokemon, clampPage, validCatalog } from './search.js';
const pokemon = { id: 4, name: 'charmander', ko: '파이리', gen: 1, types: ['fire'] };
test('search handles spaces, full-width input, padded numbers and hashes', () => {
    for (const query of [' 파이리 ', 'CHARMANDER', '#0004', '０００４', '파 이리']) assert.equal(matchesPokemon(pokemon, query), true);
    assert.equal(matchesPokemon(pokemon, '14'), false);
    assert.equal(matchesPokemon(pokemon, '피카츄'), false);
    assert.equal(matchesPokemon({id:122,name:'mr-mime'}, 'Mr. Mime'), true);
});
test('removing the last favorite on page two returns a populated page', () => {
    assert.equal(clampPage(2, 24, 24), 1);
    assert.equal(clampPage(2, 25, 24), 2);
    assert.equal(clampPage(2, 0, 24), 1);
});
test('reject incomplete fallback catalogs and corrupted storage', () => {
    assert.equal(validCatalog([pokemon]), true);
    for (const value of [null, {}, [], [{id:4,name:'charmander',types:[]}]]) assert.equal(validCatalog(value), false);
});
