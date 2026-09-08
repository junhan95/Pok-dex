import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localizedName, formInfo } from './pokemonLocalization.js';

test('ability names follow the selected language', () => {
    const names = [{ language: { name: 'ko' }, name: '심록' }, { language: { name: 'en' }, name: 'Overgrow' }];
    assert.equal(localizedName(names, 'ko'), '심록');
    assert.equal(localizedName(names, 'en'), 'Overgrow');
    assert.equal(localizedName([], 'ko', 'unavailable'), 'unavailable');
});

test('full Mega names and partial form labels do not mix languages', () => {
    const mega = { names: [{ language: { name: 'en' }, name: 'Mega Charizard X' }], form_names: [{ language: { name: 'ko' }, name: '메가리자몽X' }] };
    assert.equal(formInfo(mega, 'Charizard', 'en').displayName, 'Mega Charizard X');
    assert.equal(formInfo(mega, '리자몽', 'ko').displayName, '메가리자몽X');
    assert.equal(formInfo({ form_names: [{ language: { name: 'ko' }, name: '어택폼' }] }, '테오키스', 'ko').label, '어택폼');
    assert.equal(formInfo({ form_name: 'gmax' }, '리자몽', 'ko').label, '거다이맥스의 모습');
    assert.equal(formInfo({ form_name: 'galar' }, 'Meowth', 'en').label, 'Galarian Form');
});
