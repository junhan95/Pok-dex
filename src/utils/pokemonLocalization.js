export const localizedName = (names, language, fallback = '') =>
    names?.find(entry => entry.language.name === language)?.name ||
    names?.find(entry => entry.language.name === 'en')?.name || fallback;

export const formInfo = (form, speciesName, language) => {
    const fullName = form?.names?.find(entry => entry.language.name === language)?.name;
    const label = form?.form_names?.find(entry => entry.language.name === language)?.name;
    if (fullName) return { displayName: fullName, label: null };
    // Some form_names contain the entire name (e.g. 메가리자몽X).
    if (label?.includes(speciesName)) return { displayName: label, label: null };
    const regionalLabels = {
        gmax: ['거다이맥스의 모습', 'Gigantamax'],
        alola: ['알로라의 모습', 'Alolan Form'],
        galar: ['가라르의 모습', 'Galarian Form'],
        hisui: ['히스이의 모습', 'Hisuian Form'],
        paldea: ['팔데아의 모습', 'Paldean Form'],
        'paldea-combat': ['팔데아의 모습 (격투)', 'Paldean Combat Breed'],
        'paldea-blaze': ['팔데아의 모습 (화염)', 'Paldean Blaze Breed'],
        'paldea-aqua': ['팔데아의 모습 (수중)', 'Paldean Aqua Breed'],
    };
    const knownLabel = regionalLabels[form?.form_name]?.[language === 'ko' ? 0 : 1];
    return {
        displayName: speciesName,
        label: label || knownLabel || (form?.form_name ? (language === 'ko' ? '이 모습의 한국어 명칭이 제공되지 않습니다.' : localizedName(form.form_names, 'en', form.form_name.replaceAll('-', ' '))) : null),
    };
};
