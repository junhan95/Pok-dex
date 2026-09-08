import test from 'node:test';
import assert from 'node:assert/strict';
import {defenseMultipliers,evolutionEdges} from './pokemonContent.js';
const relation=(double=[],half=[],zero=[])=>({damage_relations:{double_damage_from:double.map(name=>({name})),half_damage_from:half.map(name=>({name})),no_damage_from:zero.map(name=>({name}))}});
test('dual types multiply weaknesses, cancel neutral damage, and preserve immunity',()=>{
 const d=defenseMultipliers([relation(['rock','ground','water'],['grass','ice']),relation(['rock','ice','electric'],['grass'],['ground'])]);
 assert.equal(d.rock,4);assert.equal(d.ground,0);assert.equal(d.ice,1);assert.equal(d.grass,.25);assert.equal(d.water,2);
});
test('branched evolutions never connect siblings',()=>{
 const tree={species:{name:'eevee'},evolves_to:[{species:{name:'vaporeon'},evolves_to:[]},{species:{name:'jolteon'},evolves_to:[]}]};
 assert.deepEqual(evolutionEdges(tree).map(e=>[e.from.name,e.to.name]),[['eevee','vaporeon'],['eevee','jolteon']]);
 assert.deepEqual(evolutionEdges(null),[]);
});
