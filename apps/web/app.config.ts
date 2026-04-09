export default defineAppConfig({
    ui: {
        colors: {
            primary: 'rose',
            neutral: 'stone',
        },
        formField: {
            slots: {
                label: 'block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-faint)]',
                hint: 'text-[10px] uppercase tracking-widest text-[var(--color-text-faint)] opacity-60',
            },
        },
    },
});
