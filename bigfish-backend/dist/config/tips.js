export const tipsDatabase = [
    {
        id: 't1',
        translations: {
            UA: 'Практика робить майстра! Навчайся кожного дня.',
            PL: 'Praktyka czyni mistrza! Ucz się każdego dnia.',
            EN: 'Practice makes perfect! Keep learning every day.'
        }
    },
    {
        id: 't2',
        translations: {
            UA: 'Переглядай попередні теми, щоб зміцнити основи.',
            PL: 'Przeglądaj poprzednie tematy, aby wzmocnić podstawy.',
            EN: 'Review previous topics to strengthen your foundations.'
        }
    },
    {
        id: 't3',
        translations: {
            UA: 'Роби перерви між сесіями, щоб краще засвоювати інформацію.',
            PL: 'Rób przerwy między sesjami, aby lepiej zapamiętywać.',
            EN: 'Take breaks between sessions to retain information better.'
        }
    },
    {
        id: 't4',
        translations: {
            UA: 'Намагайся набирати 80%+ на тестах для максимального XP.',
            PL: 'Staraj się zdobywać 80%+ w testach dla maksymalnego XP.',
            EN: 'Try to score 80%+ on quizzes for maximum XP.'
        }
    },
    {
        id: 't5',
        translations: {
            UA: 'Зосередься спочатку на слабких місцях, щоб швидше покращитися.',
            PL: 'Skup się najpierw na słabych stronach, aby szybciej się poprawić.',
            EN: 'Focus on weak spots first to improve faster.'
        }
    },
    {
        id: 't6',
        translations: {
            UA: 'Вивчай нові теми вранці — мозок краще засвоює інформацію.',
            PL: 'Ucz się nowych tematów rano — mózg lepiej przyswaja informacje.',
            EN: 'Learn new topics in the morning — your brain absorbs information better.'
        }
    },
    {
        id: 't7',
        translations: {
            UA: 'Записуй ключові моменти — це допомагає запам\'ятовувати.',
            PL: 'Zapisuj kluczowe momenty — to pomaga zapamiętywać.',
            EN: 'Write down key points — it helps memorization.'
        }
    },
    {
        id: 't8',
        translations: {
            UA: 'Ставлять собі невеликі цілі і святкуй досягнення!',
            PL: 'Stawiaj sobie małe cele i świętuj osiągnięcia!',
            EN: 'Set small goals and celebrate achievements!'
        }
    }
];
/**
 * Get tip of the day based on current date
 */
export function getTipOfTheDay(lang) {
    const dayIndex = Math.floor(Date.now() / 86400000) % tipsDatabase.length;
    const tip = tipsDatabase[dayIndex];
    return tip.translations[lang] || tip.translations.EN;
}
/**
 * Get localized weak spot advice
 */
export function getWeakSpotAdvice(score, lang) {
    const adviceTemplates = {
        UA: `Ваш середній бал ${score}%. Практикуйте цю тему більше для кращого розуміння.`,
        PL: `Twój średni wynik to ${score}%. Ćwicz ten temat więcej, aby lepiej zrozumieć.`,
        EN: `You scored ${score}% on average. Practice this topic more to improve your understanding.`
    };
    return adviceTemplates[lang] || adviceTemplates.EN;
}
